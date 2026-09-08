'use client';

// IndexedDB-backed storage for Strong Vault
// Survives manual cache clearing (unlike localStorage which is wiped with "Clear site data")
// Photos are stored as Blobs in a separate object store — never serialised to JSON

import { decryptBytes, decryptJson, encryptBytes, encryptJson } from './crypto/vaultCrypto';
import { getVaultKey } from './vaultSession';

const DB_NAME = 'strongvault_db';
/** Old IndexedDB names (base64) — copied once into strongvault_db if present. */
const LEGACY_DB_NAMES =
  typeof atob === 'function'
    ? [atob('c2VjdXJldmF1bHRfZGI='), atob('bGlmZWZpbGVzX2Ri')]
    : [];
const DB_VERSION = 2;
const STORE_VAULT = 'vault'; // key-value store for encrypted vault blob
const STORE_PHOTOS = 'photos'; // key: docId, value: { photos: PhotoEntry[] }

export interface PhotoEntry {
  id: string; // unique photo id
  docId: string; // owning document id
  name: string; // original filename
  type: string; // MIME type
  size: number; // bytes
  blob: Blob; // actual image data
  addedAt: string; // ISO timestamp
}

type EncryptedPayloadV1 = { v: 1; ivB64: string; ctB64: string };
export type EncryptedVaultRecordV1 = { v: 1; payload: EncryptedPayloadV1 };
type EncryptedPhotoEntryV1 = Omit<PhotoEntry, 'blob'> & { v: 1; blobEnc: EncryptedPayloadV1 };

let _db: IDBDatabase | null = null;


async function copyLegacyIndexedDbIfNeeded(): Promise<void> {
  if (typeof indexedDB === 'undefined' || LEGACY_DB_NAMES.length === 0) return;
  const flag = 'strongvault_idb_name_migrated_v1';
  try {
    if (localStorage.getItem(flag)) return;
  } catch {
    return;
  }

  const openNamed = (name: string) =>
    new Promise<IDBDatabase | null>((resolve) => {
      const req = indexedDB.open(name);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    });

  let sourceName: string | null = null;
  let legacyDb: IDBDatabase | null = null;
  for (const name of LEGACY_DB_NAMES) {
    const db = await openNamed(name);
    if (db && db.objectStoreNames.contains(STORE_VAULT)) {
      sourceName = name;
      legacyDb = db;
      break;
    }
    db?.close();
  }

  if (!legacyDb || !sourceName) {
    try {
      localStorage.setItem(flag, '1');
    } catch {
      /* ignore */
    }
    return;
  }

  const newDb = await new Promise<IDBDatabase>((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_VAULT)) db.createObjectStore(STORE_VAULT);
      if (!db.objectStoreNames.contains(STORE_PHOTOS)) {
        const photoStore = db.createObjectStore(STORE_PHOTOS, { keyPath: 'id' });
        photoStore.createIndex('docId', 'docId', { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });

  try {
    const vaultVal = await new Promise<unknown>((resolve) => {
      if (!legacyDb.objectStoreNames.contains(STORE_VAULT)) return resolve(undefined);
      const tx = legacyDb.transaction(STORE_VAULT, 'readonly');
      const r = tx.objectStore(STORE_VAULT).get('data');
      r.onsuccess = () => resolve(r.result);
      r.onerror = () => resolve(undefined);
    });
    if (vaultVal != null) {
      await new Promise<void>((resolve, reject) => {
        const tx = newDb.transaction(STORE_VAULT, 'readwrite');
        tx.objectStore(STORE_VAULT).put(vaultVal, 'data');
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    }
    if (legacyDb.objectStoreNames.contains(STORE_PHOTOS) && newDb.objectStoreNames.contains(STORE_PHOTOS)) {
      const photos = await new Promise<unknown[]>((resolve) => {
        const tx = legacyDb.transaction(STORE_PHOTOS, 'readonly');
        const r = tx.objectStore(STORE_PHOTOS).getAll();
        r.onsuccess = () => resolve((r.result as unknown[]) ?? []);
        r.onerror = () => resolve([]);
      });
      if (photos.length) {
        await new Promise<void>((resolve, reject) => {
          const tx = newDb.transaction(STORE_PHOTOS, 'readwrite');
          const store = tx.objectStore(STORE_PHOTOS);
          for (const row of photos) store.put(row);
          tx.oncomplete = () => resolve();
          tx.onerror = () => reject(tx.error);
        });
      }
    }
  } finally {
    legacyDb.close();
    newDb.close();
  }

  try {
    for (const name of LEGACY_DB_NAMES) indexedDB.deleteDatabase(name);
    localStorage.setItem(flag, '1');
  } catch {
    /* ignore */
  }
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (_db) {
      resolve(_db);
      return;
    }

    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_VAULT)) {
        db.createObjectStore(STORE_VAULT);
      }
      if (!db.objectStoreNames.contains(STORE_PHOTOS)) {
        const photoStore = db.createObjectStore(STORE_PHOTOS, { keyPath: 'id' });
        photoStore.createIndex('docId', 'docId', { unique: false });
      }
    };

    req.onsuccess = (e) => {
      _db = (e.target as IDBOpenDBRequest).result;
      resolve(_db);
    };

    req.onerror = () => reject(req.error);
  });
}

// ─── Vault Data ───────────────────────────────────────────────────────────────

export async function idbGetVaultData<T>(fallback: T): Promise<T> {
  try {
    await copyLegacyIndexedDbIfNeeded();
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_VAULT, 'readonly');
      const req = tx.objectStore(STORE_VAULT).get('data');
      req.onsuccess = async () => {
        const raw = req.result as EncryptedVaultRecordV1 | T | undefined;
        if (!raw) return resolve(fallback);
        if (typeof raw === 'object' && raw && (raw as EncryptedVaultRecordV1).v === 1) {
          try {
            const key = getVaultKey();
            const dec = await decryptJson<T>(key, (raw as EncryptedVaultRecordV1).payload);
            return resolve(dec);
          } catch {
            return resolve(fallback);
          }
        }
        return resolve(raw as T);
      };
      req.onerror = () => resolve(fallback);
    });
  } catch {
    return fallback;
  }
}

/** Raw encrypted vault record for cloud backup (never decrypt). */
export async function idbGetEncryptedVaultRecord(): Promise<EncryptedVaultRecordV1 | null> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_VAULT, 'readonly');
      const req = tx.objectStore(STORE_VAULT).get('data');
      req.onsuccess = () => {
        const raw = req.result;
        if (raw && typeof raw === 'object' && (raw as EncryptedVaultRecordV1).v === 1) {
          resolve(raw as EncryptedVaultRecordV1);
        } else resolve(null);
      };
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

export async function idbPutEncryptedVaultRecord(record: EncryptedVaultRecordV1): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_VAULT, 'readwrite');
    tx.objectStore(STORE_VAULT).put(record, 'data');
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error('IndexedDB vault write failed'));
  });
}

export async function idbSaveVaultData<T>(data: T): Promise<void> {
  // Encrypt *before* opening the IDB transaction. IndexedDB auto-commits when the
  // synchronous turn ends; async work inside the tx often runs after commit, so the
  // put never persisted (members/documents appeared to "revert" after navigation).
  const key = getVaultKey();
  const payload = await encryptJson(key, data);
  const record: EncryptedVaultRecordV1 = { v: 1, payload };
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_VAULT, 'readwrite');
    tx.objectStore(STORE_VAULT).put(record, 'data');
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error('IndexedDB vault write failed'));
    tx.onabort = () => reject(new Error('IndexedDB vault transaction aborted'));
  });
}

export async function idbGetStorageEstimate(): Promise<{
  used: number;
  total: number;
  percent: number;
}> {
  const fallback = { used: 0, total: 50 * 1024 * 1024, percent: 0 };
  try {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const est = await navigator.storage.estimate();
      const used = est.usage ?? 0;
      const total = est.quota ?? 50 * 1024 * 1024;
      return { used, total, percent: Math.round((used / total) * 100) };
    }
  } catch {
    /* ignore */
  }
  return fallback;
}

// ─── Photos ───────────────────────────────────────────────────────────────────

export async function idbGetPhotosForDoc(docId: string): Promise<PhotoEntry[]> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_PHOTOS, 'readonly');
      const index = tx.objectStore(STORE_PHOTOS).index('docId');
      const req = index.getAll(docId);
      req.onsuccess = async () => {
        const rows = (req.result ?? []) as (EncryptedPhotoEntryV1 | PhotoEntry)[];
        if (rows.length === 0) return resolve([]);
        try {
          const key = getVaultKey();
          const dec: PhotoEntry[] = [];
          for (const r of rows) {
            if ((r as EncryptedPhotoEntryV1).v === 1) {
              const enc = (r as EncryptedPhotoEntryV1).blobEnc;
              const bytes = await decryptBytes(key, enc);
              dec.push({
                id: r.id,
                docId: r.docId,
                name: r.name,
                type: r.type,
                size: r.size,
                blob: new Blob([new Uint8Array(bytes).buffer], { type: r.type }),
                addedAt: r.addedAt,
              });
            } else {
              dec.push(r as PhotoEntry);
            }
          }
          return resolve(dec);
        } catch {
          return resolve([]);
        }
      };
      req.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
}

export async function idbAddPhoto(entry: PhotoEntry): Promise<void> {
  const key = getVaultKey();
  const bytes = new Uint8Array(await entry.blob.arrayBuffer());
  const blobEnc = await encryptBytes(key, bytes);
  const encEntry: EncryptedPhotoEntryV1 = {
    v: 1,
    id: entry.id,
    docId: entry.docId,
    name: entry.name,
    type: entry.type,
    size: entry.size,
    blobEnc,
    addedAt: entry.addedAt,
  };
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_PHOTOS, 'readwrite');
    tx.objectStore(STORE_PHOTOS).put(encEntry);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error('IndexedDB photo write failed'));
    tx.onabort = () => reject(new Error('IndexedDB photo transaction aborted'));
  });
}

export async function idbDeletePhoto(photoId: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_PHOTOS, 'readwrite');
    tx.objectStore(STORE_PHOTOS).delete(photoId);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function idbDeletePhotosForDoc(docId: string): Promise<void> {
  const photos = await idbGetPhotosForDoc(docId);
  if (photos.length === 0) return;
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_PHOTOS, 'readwrite');
    const store = tx.objectStore(STORE_PHOTOS);
    photos.forEach((p) => store.delete(p.id));
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function idbGetAllPhotos(): Promise<PhotoEntry[]> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_PHOTOS, 'readonly');
      const req = tx.objectStore(STORE_PHOTOS).getAll();
      req.onsuccess = async () => {
        const rows = (req.result ?? []) as (EncryptedPhotoEntryV1 | PhotoEntry)[];
        if (rows.length === 0) return resolve([]);
        try {
          const key = getVaultKey();
          const dec: PhotoEntry[] = [];
          for (const r of rows) {
            if ((r as EncryptedPhotoEntryV1).v === 1) {
              const enc = (r as EncryptedPhotoEntryV1).blobEnc;
              const bytes = await decryptBytes(key, enc);
              dec.push({
                id: r.id,
                docId: r.docId,
                name: r.name,
                type: r.type,
                size: r.size,
                blob: new Blob([new Uint8Array(bytes).buffer], { type: r.type }),
                addedAt: r.addedAt,
              });
            } else {
              dec.push(r as PhotoEntry);
            }
          }
          return resolve(dec);
        } catch {
          return resolve([]);
        }
      };
      req.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
}

export async function idbClearAll(): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction([STORE_VAULT, STORE_PHOTOS], 'readwrite');
      tx.objectStore(STORE_VAULT).clear();
      tx.objectStore(STORE_PHOTOS).clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // ignore
  }
}
