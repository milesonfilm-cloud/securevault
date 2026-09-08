// Strong Vault — storage layer
// Primary: IndexedDB (survives manual cache clearing)
// Fallback seed: localStorage (migrated on first load)

import { idbGetVaultData, idbSaveVaultData, idbGetStorageEstimate, idbClearAll } from './db';
import {
  clearVaultKey,
  PIN_KDF_PARAMS_KEY,
  PIN_VERIFIER_KEY,
  SESSION_UNLOCKED_KEY,
} from './vaultSession';
import { clearPersistedVaultKey } from './vaultKeyPersist';
import { clearAppWalkthroughSeen } from './appWalkthrough';

export type CategoryId =
  | 'government-ids'
  | 'bank-accounts'
  | 'credit-debit-cards'
  | 'institutional-docs'
  | 'vehicle-documents'
  | 'family-profiles'
  | 'password-vault'
  | 'passport'
  | 'drivers-license'
  | 'insurance'
  | 'visa'
  | 'medical-record'
  | 'certificate'
  | 'contract'
  | 'warranty'
  | 'membership'
  | 'subscription'
  | 'permit'
  | 'other';

export interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
  dob: string;
  avatarColor: string;
  /** Optional profile photo (JPEG data URL, resized client-side). */
  photoDataUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  id: string;
  memberId: string;
  categoryId: CategoryId;
  title: string;
  fields: Record<string, string>;
  notes: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  /** At most one stack board folder; null = not in any folder. */
  stackId: string | null;
  /** Legacy: verified import (display field may still exist on old documents). */
  isDigiLockerVerified?: boolean;
}

export interface ShareViewEvent {
  at: string;
  userAgent: string;
}

export interface ShareLink {
  id: string;
  /** Legacy field from removed share-link feature; kept for import compatibility. */
  shareId: string;
  docId: string;
  docTitle: string;
  categoryId: CategoryId;
  createdAt: string;
  expiresAt: string;
  views: ShareViewEvent[];
}

export interface EmergencyContact {
  name: string;
  email: string;
  inactivityDays: 7 | 14 | 30;
  lastCheckInAt: string;
}

export interface VaultSettings {
  language: string;
  cloudSyncEnabled: boolean;
  notificationsEnabled: boolean;
  expiryWarnDays: number;
  theme: 'glass';
  /** Read-only vault UI for owner (emergency mode). */
  emergencyModeEnabled: boolean;
  /** Subscription plan. Free = 1 document per category. */
  plan: 'free' | 'pro';
  /**
   * Proof of a paid Play/App Store purchase. Pro must only activate when this
   * exists with a real transaction id — never from a free UI toggle.
   */
  proEntitlement?: {
    transactionId: string;
    productId: string;
    purchasedAt: string;
  };
}

export interface StreakData {
  lastOpenDate: string;
  streakDays: number;
  lastStreakCheckDate: string;
  badges: string[];
  onboardingDone: boolean;
  onboardingSteps: Record<string, boolean>;
}

export type VaultRole = 'admin' | 'member' | 'viewer';

export interface RolePermissions {
  role: VaultRole;
  canExport: boolean;
  canShare: boolean;
}

/** Default capability flags per vault role (document-level rules may further restrict). */
export function defaultPermissions(role: VaultRole): RolePermissions {
  switch (role) {
    case 'admin':
      return { role: 'admin', canExport: true, canShare: true };
    case 'viewer':
      return { role: 'viewer', canExport: false, canShare: false };
    case 'member':
    default:
      return { role: 'member', canExport: true, canShare: true };
  }
}

export function defaultVaultSettings(): VaultSettings {
  return {
    language: 'en',
    cloudSyncEnabled: false,
    notificationsEnabled: true,
    expiryWarnDays: 30,
    theme: 'glass',
    emergencyModeEnabled: false,
    plan: 'free',
  };
}

export function defaultStreakData(): StreakData {
  return {
    lastOpenDate: '',
    streakDays: 0,
    lastStreakCheckDate: '',
    badges: [],
    onboardingDone: false,
    onboardingSteps: {},
  };
}

/** Normalize legacy `stackIds[]` or missing field to single `stackId`. */
export function migrateDocumentStackField(d: Document & { stackIds?: string[] }): Document {
  const fromArray = Array.isArray(d.stackIds) && d.stackIds.length > 0 ? d.stackIds[0] : null;
  const stackId = typeof d.stackId === 'string' && d.stackId.length > 0 ? d.stackId : fromArray;
  const { stackIds: _drop, ...rest } = d;
  return { ...(rest as Document), stackId };
}

/**
 * User-defined folder on the stack board: combine member scope and/or categories.
 * A document matches when it passes both: optional member filter AND optional category list
 * (empty category list = all categories allowed under the member scope; no member = any member).
 */
export interface DocumentStack {
  id: string;
  name: string;
  accentColor: string;
  memberScopeId: string | null;
  categoryIds: CategoryId[];
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface VaultData {
  members: FamilyMember[];
  documents: Document[];
  exportHistory: ExportRecord[];
  documentStacks: DocumentStack[];
  shareLinks: ShareLink[];
  emergencyContact: EmergencyContact | null;
  settings: VaultSettings;
  streakData: StreakData;
}

function stripLegacyMemberFields(m: FamilyMember): FamilyMember {
  const legacy = m as FamilyMember & { permissions?: unknown; pinHash?: unknown };
  const { permissions: _p, pinHash: _h, ...rest } = legacy;
  return rest;
}

function stripLegacyDocumentFields(d: Document): Document {
  const legacy = d as Document & {
    digilockerVerified?: boolean;
    isPrivate?: boolean;
    sharedWithMemberIds?: string[];
  };
  const { digilockerVerified: _dv, isPrivate: _pr, sharedWithMemberIds: _sh, ...rest } = legacy;
  return {
    ...(rest as Document),
    isDigiLockerVerified: rest.isDigiLockerVerified ?? legacy.digilockerVerified,
  };
}

function normalizeStoredTheme(_raw: unknown): VaultSettings['theme'] {
  return 'glass';
}

export function normalizeVaultData(data: VaultData): VaultData {
  const settingsRaw = { ...defaultVaultSettings(), ...data.settings };
  const {
    digilockerConnectedAt: _dropDigiLocker,
    adminRole: _dropAdminRole,
    ...settingsRest
  } = settingsRaw as VaultSettings & {
    adminRole?: unknown;
    digilockerConnectedAt?: string | null;
  };
  const settings = {
    ...(settingsRest as VaultSettings),
    theme: normalizeStoredTheme((settingsRest as VaultSettings).theme),
  };
  const streakData = { ...defaultStreakData(), ...data.streakData };
  return {
    ...data,
    shareLinks: [],
    emergencyContact: data.emergencyContact ?? null,
    settings,
    streakData,
    members: data.members.map(stripLegacyMemberFields),
    documents: data.documents.map((d) => {
      const migrated = migrateDocumentStackField(d as Document & { stackIds?: string[] });
      return stripLegacyDocumentFields(migrated);
    }),
  };
}

export interface ExportRecord {
  id: string;
  format: string;
  exportedAt: string;
  documentCount: number;
}

const STORAGE_KEY = 'strongvault_data';
const MIGRATED_KEY = 'strongvault_idb_migrated';
const ENCRYPTION_MIGRATED_KEY = 'strongvault_encryption_migrated_v1';

/** Pre-rebrand localStorage keys (base64 so prior product names are not left in source). */
const LEGACY_KEY_SETS: Array<[string, string, string]> = [
  [
    atob('c2VjdXJldmF1bHRfZGF0YQ=='),
    atob('c2VjdXJldmF1bHRfaWRiX21pZ3JhdGVk'),
    atob('c2VjdXJldmF1bHRfZW5jcnlwdGlvbl9taWdyYXRlZF92MQ=='),
  ],
  [
    atob('bGlmZWZpbGVzX2RhdGE='),
    atob('bGlmZWZpbGVzX2lkYl9taWdyYXRlZA=='),
    atob('bGlmZWZpbGVzX2VuY3J5cHRpb25fbWlncmF0ZWRfdjE='),
  ],
];

function migrateLegacyLocalStorageKeys(): void {
  if (typeof window === 'undefined') return;
  for (const [dataKey, migratedKey, encKey] of LEGACY_KEY_SETS) {
    const pairs: Array<[string, string]> = [
      [dataKey, STORAGE_KEY],
      [migratedKey, MIGRATED_KEY],
      [encKey, ENCRYPTION_MIGRATED_KEY],
    ];
    for (const [from, to] of pairs) {
      if (!localStorage.getItem(to)) {
        const v = localStorage.getItem(from);
        if (v != null) localStorage.setItem(to, v);
      }
      localStorage.removeItem(from);
    }
  }
}

// ─── Async API (preferred — uses IndexedDB) ───────────────────────────────────

export async function loadVaultDataAsync(): Promise<VaultData> {
  if (typeof window === 'undefined') return getDefaultData();

  migrateLegacyLocalStorageKeys();

  // One-time migration from localStorage → IndexedDB
  if (!localStorage.getItem(MIGRATED_KEY)) {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as VaultData;
        await idbSaveVaultData(parsed);
      } catch {
        /* ignore bad data */
      }
    }
    localStorage.setItem(MIGRATED_KEY, '1');
  }

  const data = await idbGetVaultData<VaultData | null>(null);

  // One-time best-effort migration: if we loaded legacy plaintext from IDB, re-save it encrypted.
  if (data && !localStorage.getItem(ENCRYPTION_MIGRATED_KEY)) {
    try {
      await idbSaveVaultData(data);
    } catch {
      // ignore; will retry next load
    }
    localStorage.setItem(ENCRYPTION_MIGRATED_KEY, '1');
  }

  const normalized = (data ?? getDefaultData()) as VaultData;
  // Migration: old "websites" entries are treated as password records.
  normalized.documents = normalized.documents.map((d) =>
    (d.categoryId as unknown as string) === 'websites' ? { ...d, categoryId: 'password-vault' } : d
  );
  if (!Array.isArray(normalized.documentStacks)) {
    normalized.documentStacks = [];
  }
  normalized.documents = normalized.documents.map((d) =>
    migrateDocumentStackField(d as Document & { stackIds?: string[] })
  );
  return normalizeVaultData(normalized);
}

export async function saveVaultDataAsync(data: VaultData): Promise<void> {
  await idbSaveVaultData(data);
}

export async function getStorageSizeAsync(): Promise<{
  used: number;
  total: number;
  percent: number;
}> {
  return idbGetStorageEstimate();
}

// ─── Sync shims (kept for components not yet migrated) ────────────────────────
// These read/write localStorage as a best-effort fallback.
// Prefer the Async variants above for all new code.

export function loadVaultData(): VaultData {
  if (typeof window === 'undefined') {
    return {
      members: [],
      documents: [],
      exportHistory: [],
      documentStacks: [],
      shareLinks: [],
      emergencyContact: null,
      settings: defaultVaultSettings(),
      streakData: defaultStreakData(),
    };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultData();
    const parsed = JSON.parse(raw) as VaultData;
    if (!Array.isArray(parsed.documentStacks)) parsed.documentStacks = [];
    parsed.documents = parsed.documents.map((d) =>
      migrateDocumentStackField(d as Document & { stackIds?: string[] })
    );
    return normalizeVaultData(parsed);
  } catch {
    return getDefaultData();
  }
}

export function saveVaultData(data: VaultData): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    // Also persist to IndexedDB asynchronously
    idbSaveVaultData(data).catch(() => {});
  } catch {
    console.error('Strong Vault: localStorage write failed — storage may be full');
  }
}

export async function resetVaultLocalOnly(): Promise<void> {
  // Wipes all local data. This is intentionally destructive.
  try {
    await idbClearAll();
  } catch {
    // ignore
  }
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(MIGRATED_KEY);
    localStorage.removeItem(ENCRYPTION_MIGRATED_KEY);
    localStorage.removeItem(PIN_KDF_PARAMS_KEY);
    localStorage.removeItem(PIN_VERIFIER_KEY);
    localStorage.removeItem('sv_streak');
  } catch {
    // ignore
  }
  try {
    sessionStorage.removeItem(SESSION_UNLOCKED_KEY);
    sessionStorage.removeItem('sv_gamification_hydrate_v1');
  } catch {
    // ignore
  }
  clearAppWalkthroughSeen();
  clearPersistedVaultKey();
  clearVaultKey();
}

export function getStorageSize(): { used: number; total: number; percent: number } {
  if (typeof window === 'undefined') return { used: 0, total: 5242880, percent: 0 };
  const raw = localStorage.getItem(STORAGE_KEY) || '';
  const used = new Blob([raw]).size;
  const total = 5 * 1024 * 1024;
  return { used, total, percent: Math.round((used / total) * 100) };
}

// ─── Default seed data ────────────────────────────────────────────────────────
// Production ships with an empty vault. Fresh installs start with no members
// and no documents so users see a clean onboarding state.

function getDefaultData(): VaultData {
  const data: VaultData = {
    members: [],
    documents: [],
    exportHistory: [],
    documentStacks: [],
    shareLinks: [],
    emergencyContact: null,
    settings: defaultVaultSettings(),
    streakData: defaultStreakData(),
  };
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      /* ignore quota errors — IndexedDB is the primary store */
    }
  }
  return data;
}
