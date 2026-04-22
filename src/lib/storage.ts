// SecureVault — storage layer
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
import { MEMBER_AVATAR_COLORS } from './memberAvatarColors';

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
}

/** Normalize legacy `stackIds[]` or missing field to single `stackId`. */
export function migrateDocumentStackField(
  d: Document & { stackIds?: string[] }
): Document {
  const fromArray =
    Array.isArray(d.stackIds) && d.stackIds.length > 0 ? d.stackIds[0] : null;
  const stackId =
    typeof d.stackId === 'string' && d.stackId.length > 0 ? d.stackId : fromArray;
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
}

export interface ExportRecord {
  id: string;
  format: string;
  exportedAt: string;
  documentCount: number;
}

const STORAGE_KEY = 'securevault_data';
const MIGRATED_KEY = 'securevault_idb_migrated';
const ENCRYPTION_MIGRATED_KEY = 'securevault_encryption_migrated_v1';

// ─── Async API (preferred — uses IndexedDB) ───────────────────────────────────

export async function loadVaultDataAsync(): Promise<VaultData> {
  if (typeof window === 'undefined') return getDefaultData();

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
  return normalized;
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
    return { members: [], documents: [], exportHistory: [], documentStacks: [] };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultData();
    const parsed = JSON.parse(raw) as VaultData;
    if (!Array.isArray(parsed.documentStacks)) parsed.documentStacks = [];
    parsed.documents = parsed.documents.map((d) =>
      migrateDocumentStackField(d as Document & { stackIds?: string[] })
    );
    return parsed;
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
    console.error('SecureVault: localStorage write failed — storage may be full');
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
  } catch {
    // ignore
  }
  try {
    sessionStorage.removeItem(SESSION_UNLOCKED_KEY);
  } catch {
    // ignore
  }
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

function getDefaultData(): VaultData {
  const now = new Date().toISOString();
  const members: FamilyMember[] = [
    {
      id: 'member-001',
      name: 'Arjun Sharma',
      relationship: 'Self',
      dob: '1988-03-15',
      avatarColor: MEMBER_AVATAR_COLORS[0],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'member-002',
      name: 'Priya Sharma',
      relationship: 'Spouse',
      dob: '1991-07-22',
      avatarColor: MEMBER_AVATAR_COLORS[1],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'member-003',
      name: 'Rohan Sharma',
      relationship: 'Son',
      dob: '2015-11-08',
      avatarColor: MEMBER_AVATAR_COLORS[2],
      createdAt: now,
      updatedAt: now,
    },
  ];

  const documents: Document[] = [
    {
      id: 'doc-001',
      memberId: 'member-001',
      categoryId: 'government-ids',
      title: 'Aadhaar Card',
      fields: {
        'Aadhaar Number': '4521 8734 9012',
        'Date of Issue': '2019-04-12',
        Address: '42, MG Road, Bengaluru 560001',
        'DOB on Card': '15-03-1988',
      },
      notes: 'Linked to mobile 98765XXXXX',
      createdAt: now,
      updatedAt: now,
      tags: ['primary', 'kyc'],
      stackId: null,
    },
    {
      id: 'doc-002',
      memberId: 'member-001',
      categoryId: 'government-ids',
      title: 'PAN Card',
      fields: {
        'PAN Number': 'ABCPS1234D',
        'Date of Issue': '2010-06-01',
        'Father Name': 'Ramesh Sharma',
      },
      notes: '',
      createdAt: now,
      updatedAt: now,
      tags: ['tax', 'kyc'],
      stackId: null,
    },
    {
      id: 'doc-003',
      memberId: 'member-001',
      categoryId: 'bank-accounts',
      title: 'HDFC Savings Account',
      fields: {
        'Account Number': '50100XXXXXXXX',
        'IFSC Code': 'HDFC0001234',
        Branch: 'Indiranagar, Bengaluru',
        'Account Type': 'Savings',
        Nominee: 'Priya Sharma',
      },
      notes: 'Primary salary account',
      createdAt: now,
      updatedAt: now,
      tags: ['salary', 'primary'],
      stackId: null,
    },
    {
      id: 'doc-004',
      memberId: 'member-001',
      categoryId: 'credit-debit-cards',
      title: 'HDFC Regalia Credit Card',
      fields: {
        'Card Number (Last 4)': '4821',
        'Card Network': 'Visa',
        Expiry: '09/2027',
        'Credit Limit': '₹3,00,000',
        'Billing Cycle': '15th of every month',
        'Customer Care': '1800-266-4332',
      },
      notes: 'Annual fee waived on ₹1L spend',
      createdAt: now,
      updatedAt: now,
      tags: ['rewards', 'travel'],
      stackId: null,
    },
    {
      id: 'doc-005',
      memberId: 'member-001',
      categoryId: 'vehicle-documents',
      title: 'Honda City RC',
      fields: {
        'Registration Number': 'KA-01-MF-4521',
        'Engine Number': 'L15Z8XXXXXX',
        'Chassis Number': 'MAKGD649XXXXX',
        'Insurance Expiry': '2025-08-14',
        'PUC Expiry': '2025-02-28',
        'Fuel Type': 'Petrol',
      },
      notes: 'Insurance: Bajaj Allianz, Policy #OG-23-1234',
      createdAt: now,
      updatedAt: now,
      tags: ['car', 'honda'],
      stackId: null,
    },
    {
      id: 'doc-006',
      memberId: 'member-002',
      categoryId: 'government-ids',
      title: 'Passport',
      fields: {
        'Passport Number': 'N1234567',
        'Date of Issue': '2021-09-10',
        'Expiry Date': '2031-09-09',
        'Place of Issue': 'Bengaluru',
        'File Number': 'BAN123456789',
      },
      notes: 'Visa pages remaining: 8',
      createdAt: now,
      updatedAt: now,
      tags: ['travel', 'international'],
      stackId: null,
    },
    {
      id: 'doc-007',
      memberId: 'member-002',
      categoryId: 'bank-accounts',
      title: 'SBI Joint Account',
      fields: {
        'Account Number': '31234567890',
        'IFSC Code': 'SBIN0012345',
        Branch: 'Jayanagar, Bengaluru',
        'Account Type': 'Joint Savings',
        'Joint Holder': 'Arjun Sharma',
      },
      notes: 'Joint account for household expenses',
      createdAt: now,
      updatedAt: now,
      tags: ['joint', 'household'],
      stackId: null,
    },
    {
      id: 'doc-008',
      memberId: 'member-002',
      categoryId: 'institutional-docs',
      title: 'LIC Jeevan Anand Policy',
      fields: {
        'Policy Number': '123456789',
        'Sum Assured': '₹25,00,000',
        'Premium Amount': '₹18,450/year',
        'Policy Term': '25 years',
        'Maturity Date': '2046-07-22',
        'Agent Contact': '9876543210',
      },
      notes: 'Nominee: Arjun Sharma',
      createdAt: now,
      updatedAt: now,
      tags: ['insurance', 'life'],
      stackId: null,
    },
    {
      id: 'doc-009',
      memberId: 'member-003',
      categoryId: 'institutional-docs',
      title: 'School Admission Certificate',
      fields: {
        'School Name': 'Delhi Public School, Bengaluru',
        'Admission Number': 'DPS/2022/1234',
        Class: '4th Grade',
        Section: 'B',
        'Academic Year': '2025-2026',
      },
      notes: 'TC to be collected in April',
      createdAt: now,
      updatedAt: now,
      tags: ['school', 'education'],
      stackId: null,
    },
    {
      id: 'doc-010',
      memberId: 'member-001',
      categoryId: 'institutional-docs',
      title: 'Home Loan Account',
      fields: {
        'Loan Account': 'HL0012345678',
        Lender: 'HDFC Bank',
        Outstanding: '₹42,00,000',
        EMI: '₹38,450/month',
        'Tenure Remaining': '18 years',
        Property: 'Flat 4B, Prestige Heights',
      },
      notes: 'EMI debited on 5th every month',
      createdAt: now,
      updatedAt: now,
      tags: ['loan', 'property'],
      stackId: null,
    },
  ];

  const data: VaultData = { members, documents, exportHistory: [], documentStacks: [] };
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
  return data;
}
