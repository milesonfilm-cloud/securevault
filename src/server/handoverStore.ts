/** Dev-oriented store for encrypted handover payloads (replace with DB in production). */

type Entry = { cipherB64: string; expiresAt: number };

const store = new Map<string, Entry>();

export function handoverStorePut(id: string, cipherB64: string, expiresAt: number): void {
  store.set(id, { cipherB64, expiresAt });
}

export function handoverStoreGet(id: string): Entry | null {
  const e = store.get(id);
  if (!e) return null;
  if (Date.now() > e.expiresAt) {
    store.delete(id);
    return null;
  }
  return e;
}
