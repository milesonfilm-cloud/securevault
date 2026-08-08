'use client';

/**
 * Public Razorpay IFSC lookup with IndexedDB cache for offline reuse.
 * https://ifsc.razorpay.com/{IFSC}
 */

export interface IfscDetails {
  IFSC: string;
  BANK: string;
  BRANCH: string;
  CENTRE?: string;
  DISTRICT?: string;
  STATE?: string;
  ADDRESS?: string;
  CITY?: string;
}

const CACHE_DB = 'securevault_ifsc_cache';
const CACHE_VERSION = 1;
const STORE = 'ifsc';

let _db: IDBDatabase | null = null;

function openCacheDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (_db) {
      resolve(_db);
      return;
    }
    const req = indexedDB.open(CACHE_DB, CACHE_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'IFSC' });
      }
    };
    req.onsuccess = () => {
      _db = req.result;
      resolve(_db);
    };
    req.onerror = () => reject(req.error);
  });
}

async function getCached(ifsc: string): Promise<IfscDetails | null> {
  try {
    const db = await openCacheDb();
    return await new Promise((resolve) => {
      const tx = db.transaction(STORE, 'readonly');
      const req = tx.objectStore(STORE).get(ifsc);
      req.onsuccess = () => resolve((req.result as IfscDetails | undefined) ?? null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

async function setCached(details: IfscDetails): Promise<void> {
  try {
    const db = await openCacheDb();
    await new Promise<void>((resolve) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).put(details);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch {
    /* ignore cache write failures */
  }
}

function normalizeIfsc(raw: string): string {
  return raw.trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 11);
}

export function isCompleteIfsc(raw: string): boolean {
  return /^[A-Z]{4}0[A-Z0-9]{6}$/.test(normalizeIfsc(raw));
}

/** Lookup IFSC; returns null if invalid, not found, or network error with empty cache. */
export async function lookupIfsc(raw: string): Promise<IfscDetails | null> {
  const ifsc = normalizeIfsc(raw);
  if (!isCompleteIfsc(ifsc)) return null;

  const cached = await getCached(ifsc);
  if (cached) return cached;

  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return null;
  }

  try {
    const res = await fetch(`https://ifsc.razorpay.com/${ifsc}`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as Partial<IfscDetails>;
    if (!data.BANK || !data.BRANCH) return null;
    const details: IfscDetails = {
      IFSC: ifsc,
      BANK: String(data.BANK),
      BRANCH: String(data.BRANCH),
      CENTRE: data.CENTRE ? String(data.CENTRE) : undefined,
      DISTRICT: data.DISTRICT ? String(data.DISTRICT) : undefined,
      STATE: data.STATE ? String(data.STATE) : undefined,
      ADDRESS: data.ADDRESS ? String(data.ADDRESS) : undefined,
      CITY: data.CITY ? String(data.CITY) : undefined,
    };
    await setCached(details);
    return details;
  } catch {
    return null;
  }
}
