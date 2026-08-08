'use client';

import { sha256Hex } from './crypto/sha256';

export type AuditAction =
  | 'document_created'
  | 'document_updated'
  | 'document_deleted'
  | 'document_viewed'
  | 'document_exported'
  | 'document_shared'
  | 'member_created'
  | 'member_updated'
  | 'member_deleted'
  | 'vault_unlocked'
  | 'vault_exported'
  | 'emergency_pdf_generated'
  | 'digilocker_connected'
  | 'share_import_received'
  | 'audit_cleared';

export interface AuditEntry {
  id: string;
  action: AuditAction;
  /** Family member related to the action (owner of the document, etc.). */
  actorMemberId: string | null;
  targetId: string | null;
  targetTitle: string | null;
  /** Document category when applicable. */
  categoryId?: string | null;
  timestamp: string;
  metadata?: Record<string, string>;
  /** SHA-256 hex of previous entry's hash (genesis = GENESIS_HASH). */
  prevHash: string;
  /** SHA-256 hex of prevHash + canonical entry payload. */
  hash: string;
}

export const GENESIS_HASH = '0'.repeat(64);

const LEGACY_LS_KEY = 'sv_audit_log';
const AUDIT_DB = 'securevault_audit';
const AUDIT_DB_VERSION = 1;
const STORE = 'log';
const RECORD_KEY = 'chain';
const MAX_ENTRIES = 500;

type AuditRecordV2 = { v: 2; entries: AuditEntry[] };

let _db: IDBDatabase | null = null;
let _memory: AuditEntry[] | null = null;
let _migratePromise: Promise<void> | null = null;

function openAuditDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (_db) {
      resolve(_db);
      return;
    }
    const req = indexedDB.open(AUDIT_DB, AUDIT_DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE);
      }
    };
    req.onsuccess = () => {
      _db = req.result;
      resolve(_db);
    };
    req.onerror = () => reject(req.error);
  });
}

/** Stable serialization for hashing (excludes hash / prevHash). */
export function canonicalAuditPayload(
  entry: Omit<AuditEntry, 'hash' | 'prevHash'>
): string {
  return JSON.stringify({
    id: entry.id,
    action: entry.action,
    actorMemberId: entry.actorMemberId,
    targetId: entry.targetId,
    targetTitle: entry.targetTitle,
    categoryId: entry.categoryId ?? null,
    timestamp: entry.timestamp,
    metadata: entry.metadata ?? {},
  });
}

export async function computeEntryHash(
  prevHash: string,
  entry: Omit<AuditEntry, 'hash' | 'prevHash'>
): Promise<string> {
  return sha256Hex(`${prevHash}\n${canonicalAuditPayload(entry)}`);
}

async function readRecord(): Promise<AuditEntry[]> {
  if (_memory) return _memory;
  try {
    const db = await openAuditDb();
    const raw = await new Promise<unknown>((resolve) => {
      const tx = db.transaction(STORE, 'readonly');
      const req = tx.objectStore(STORE).get(RECORD_KEY);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(undefined);
    });
    if (raw && typeof raw === 'object' && (raw as AuditRecordV2).v === 2) {
      _memory = (raw as AuditRecordV2).entries ?? [];
      return _memory;
    }
  } catch {
    /* fall through */
  }
  _memory = [];
  return _memory;
}

async function writeRecord(entries: AuditEntry[]): Promise<void> {
  _memory = entries;
  try {
    const db = await openAuditDb();
    await new Promise<void>((resolve) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).put({ v: 2, entries } satisfies AuditRecordV2, RECORD_KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch {
    /* ignore — memory still holds latest */
  }
}

async function migrateLegacyIfNeeded(): Promise<void> {
  if (typeof window === 'undefined') return;
  if (_migratePromise) return _migratePromise;
  _migratePromise = (async () => {
    const existing = await readRecord();
    if (existing.length > 0) return;
    let legacy: unknown[] = [];
    try {
      const raw = localStorage.getItem(LEGACY_LS_KEY);
      if (!raw) return;
      legacy = JSON.parse(raw) as unknown[];
    } catch {
      return;
    }
    if (!Array.isArray(legacy) || legacy.length === 0) return;

    // Legacy was newest-first; rebuild oldest-first with a fresh chain.
    const chronological = [...legacy].reverse();
    const rebuilt: AuditEntry[] = [];
    let prev = GENESIS_HASH;
    for (const item of chronological) {
      if (!item || typeof item !== 'object') continue;
      const o = item as Record<string, unknown>;
      const base: Omit<AuditEntry, 'hash' | 'prevHash'> = {
        id: typeof o.id === 'string' ? o.id : `audit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        action: (typeof o.action === 'string' ? o.action : 'document_updated') as AuditAction,
        actorMemberId: typeof o.actorMemberId === 'string' ? o.actorMemberId : null,
        targetId: typeof o.targetId === 'string' ? o.targetId : null,
        targetTitle: typeof o.targetTitle === 'string' ? o.targetTitle : null,
        categoryId: typeof o.categoryId === 'string' ? o.categoryId : null,
        timestamp: typeof o.timestamp === 'string' ? o.timestamp : new Date().toISOString(),
        metadata:
          o.metadata && typeof o.metadata === 'object'
            ? (o.metadata as Record<string, string>)
            : undefined,
      };
      const hash = await computeEntryHash(prev, base);
      rebuilt.push({ ...base, prevHash: prev, hash });
      prev = hash;
    }
    await writeRecord(rebuilt.slice(-MAX_ENTRIES));
    try {
      localStorage.removeItem(LEGACY_LS_KEY);
    } catch {
      /* ignore */
    }
  })();
  return _migratePromise;
}

/** Newest-first for UI. */
export async function getAuditLog(): Promise<AuditEntry[]> {
  await migrateLegacyIfNeeded();
  const entries = await readRecord();
  return [...entries].reverse();
}

export type AuditAppendInput = Omit<AuditEntry, 'id' | 'timestamp' | 'prevHash' | 'hash'> & {
  id?: string;
  timestamp?: string;
};

export async function appendAuditEntryAsync(entry: AuditAppendInput): Promise<AuditEntry | null> {
  try {
    await migrateLegacyIfNeeded();
    const entries = await readRecord();
    const prevHash = entries.length > 0 ? entries[entries.length - 1]!.hash : GENESIS_HASH;
    const base: Omit<AuditEntry, 'hash' | 'prevHash'> = {
      id: entry.id ?? `audit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      action: entry.action,
      actorMemberId: entry.actorMemberId,
      targetId: entry.targetId,
      targetTitle: entry.targetTitle,
      categoryId: entry.categoryId ?? null,
      timestamp: entry.timestamp ?? new Date().toISOString(),
      metadata: entry.metadata,
    };
    const hash = await computeEntryHash(prevHash, base);
    const newEntry: AuditEntry = { ...base, prevHash, hash };
    let updated = [...entries, newEntry];
    if (updated.length > MAX_ENTRIES) {
      updated = await rehashFromGenesis(updated.slice(-MAX_ENTRIES));
    }
    await writeRecord(updated);
    return updated[updated.length - 1] ?? newEntry;
  } catch {
    return null;
  }
}

async function rehashFromGenesis(entries: AuditEntry[]): Promise<AuditEntry[]> {
  const out: AuditEntry[] = [];
  let prev = GENESIS_HASH;
  for (const e of entries) {
    const base: Omit<AuditEntry, 'hash' | 'prevHash'> = {
      id: e.id,
      action: e.action,
      actorMemberId: e.actorMemberId,
      targetId: e.targetId,
      targetTitle: e.targetTitle,
      categoryId: e.categoryId ?? null,
      timestamp: e.timestamp,
      metadata: e.metadata,
    };
    const hash = await computeEntryHash(prev, base);
    out.push({ ...base, prevHash: prev, hash });
    prev = hash;
  }
  return out;
}

/** Fire-and-forget wrapper for existing call sites. */
export function appendAuditEntry(entry: AuditAppendInput): void {
  void appendAuditEntryAsync(entry);
}

export async function clearAuditLog(): Promise<void> {
  await migrateLegacyIfNeeded();
  const clearedAt = new Date().toISOString();
  const base: Omit<AuditEntry, 'hash' | 'prevHash'> = {
    id: `audit-clear-${Date.now()}`,
    action: 'audit_cleared',
    actorMemberId: null,
    targetId: null,
    targetTitle: null,
    categoryId: null,
    timestamp: clearedAt,
    metadata: { reason: 'user_cleared' },
  };
  const hash = await computeEntryHash(GENESIS_HASH, base);
  await writeRecord([{ ...base, prevHash: GENESIS_HASH, hash }]);
  try {
    localStorage.removeItem(LEGACY_LS_KEY);
  } catch {
    /* ignore */
  }
}

export interface AuditIntegrityResult {
  ok: boolean;
  entryCount: number;
  /** 0-based index in chronological order where the chain broke; null if ok or empty. */
  brokenAt: number | null;
  message: string;
}

/** Test-only: replace the stored chain (does not rehash). */
export async function __unsafeReplaceAuditEntriesForTests(entries: AuditEntry[]): Promise<void> {
  await writeRecord(entries);
}

export async function verifyAuditIntegrity(): Promise<AuditIntegrityResult> {
  await migrateLegacyIfNeeded();
  const entries = await readRecord();
  if (entries.length === 0) {
    return { ok: true, entryCount: 0, brokenAt: null, message: 'No activity yet — chain is empty.' };
  }
  let prev = GENESIS_HASH;
  for (let i = 0; i < entries.length; i++) {
    const e = entries[i]!;
    if (e.prevHash !== prev) {
      return {
        ok: false,
        entryCount: entries.length,
        brokenAt: i,
        message: `Chain broken at entry ${i + 1}: previous hash mismatch.`,
      };
    }
    const expected = await computeEntryHash(e.prevHash, {
      id: e.id,
      action: e.action,
      actorMemberId: e.actorMemberId,
      targetId: e.targetId,
      targetTitle: e.targetTitle,
      categoryId: e.categoryId ?? null,
      timestamp: e.timestamp,
      metadata: e.metadata,
    });
    if (expected !== e.hash) {
      return {
        ok: false,
        entryCount: entries.length,
        brokenAt: i,
        message: `Chain broken at entry ${i + 1}: content hash mismatch.`,
      };
    }
    prev = e.hash;
  }
  return {
    ok: true,
    entryCount: entries.length,
    brokenAt: null,
    message: `Integrity verified — ${entries.length} entries, hash chain intact.`,
  };
}
