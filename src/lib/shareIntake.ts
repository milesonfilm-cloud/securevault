'use client';

/**
 * Pending files shared into SecureVault (PWA share target or native share sheet).
 * Blobs live in a small IndexedDB inbox until the vault UI consumes them.
 */

export interface SharedInboxItem {
  id: string;
  name: string;
  type: string;
  size: number;
  /** ISO timestamp */
  receivedAt: string;
  /** optional title/text from the share sheet */
  title?: string;
  text?: string;
}

const DB_NAME = 'securevault_share_inbox';
const DB_VERSION = 1;
const STORE = 'files';

let _db: IDBDatabase | null = null;

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (_db) {
      resolve(_db);
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => {
      _db = req.result;
      resolve(_db);
    };
    req.onerror = () => reject(req.error);
  });
}

type StoredShare = SharedInboxItem & { blob: Blob };

export async function enqueueSharedFile(
  file: Blob,
  meta: { name: string; type?: string; title?: string; text?: string }
): Promise<SharedInboxItem> {
  const item: StoredShare = {
    id: `share-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: meta.name || 'shared-file',
    type: meta.type || file.type || 'application/octet-stream',
    size: file.size,
    receivedAt: new Date().toISOString(),
    title: meta.title,
    text: meta.text,
    blob: file,
  };
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(item);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  try {
    sessionStorage.setItem('sv_share_pending', '1');
  } catch {
    /* ignore */
  }
  return {
    id: item.id,
    name: item.name,
    type: item.type,
    size: item.size,
    receivedAt: item.receivedAt,
    title: item.title,
    text: item.text,
  };
}

export async function listSharedInbox(): Promise<SharedInboxItem[]> {
  try {
    const db = await openDb();
    const rows = await new Promise<StoredShare[]>((resolve) => {
      const tx = db.transaction(STORE, 'readonly');
      const req = tx.objectStore(STORE).getAll();
      req.onsuccess = () => resolve((req.result as StoredShare[]) ?? []);
      req.onerror = () => resolve([]);
    });
    return rows
      .map(({ blob: _b, ...meta }) => meta)
      .sort((a, b) => b.receivedAt.localeCompare(a.receivedAt));
  } catch {
    return [];
  }
}

export async function takeNextSharedFile(): Promise<{ meta: SharedInboxItem; file: File } | null> {
  try {
    const db = await openDb();
    const rows = await new Promise<StoredShare[]>((resolve) => {
      const tx = db.transaction(STORE, 'readonly');
      const req = tx.objectStore(STORE).getAll();
      req.onsuccess = () => resolve((req.result as StoredShare[]) ?? []);
      req.onerror = () => resolve([]);
    });
    if (!rows.length) {
      try {
        sessionStorage.removeItem('sv_share_pending');
      } catch {
        /* ignore */
      }
      return null;
    }
    rows.sort((a, b) => a.receivedAt.localeCompare(b.receivedAt));
    const next = rows[0]!;
    await new Promise<void>((resolve) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).delete(next.id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
    const remaining = rows.length - 1;
    try {
      if (remaining <= 0) sessionStorage.removeItem('sv_share_pending');
      else sessionStorage.setItem('sv_share_pending', '1');
    } catch {
      /* ignore */
    }
    const file = new File([next.blob], next.name, { type: next.type || next.blob.type });
    const { blob: _b, ...meta } = next;
    return { meta, file };
  } catch {
    return null;
  }
}

export function hasPendingShareFlag(): boolean {
  try {
    return sessionStorage.getItem('sv_share_pending') === '1';
  } catch {
    return false;
  }
}

export async function extractTextFromSharedFile(file: File): Promise<string> {
  const { runTesseractOnImage } = await import('@/lib/ocr/tesseractHelper');
  if (file.type.startsWith('image/') || /\.(png|jpe?g|webp|gif|heic)$/i.test(file.name)) {
    return (
      await runTesseractOnImage(file, {
        onProgress: () => {},
      })
    ).trim();
  }
  const { extractTextFromImportFile } = await import('@/lib/import/fileImportExtract');
  return extractTextFromImportFile(file);
}
