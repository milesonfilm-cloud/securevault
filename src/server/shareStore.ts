/** Dev-oriented in-memory store for encrypted share payloads. Replace with Redis/DB in production. */

type Entry = { cipherB64: string; expiresAt: number; views: number };

const store = new Map<string, Entry>();

export function shareStorePut(id: string, cipherB64: string, expiresAt: number): void {
  store.set(id, { cipherB64, expiresAt, views: 0 });
}

export function shareStoreGet(id: string): Entry | null {
  const e = store.get(id);
  if (!e) return null;
  if (Date.now() > e.expiresAt) {
    store.delete(id);
    return null;
  }
  return e;
}

export function shareStoreBumpView(id: string): number {
  const e = store.get(id);
  if (!e) return 0;
  e.views += 1;
  return e.views;
}

/** Metadata only (no ciphertext); does not bump view count. */
export function shareStorePeek(id: string): { expiresAt: number; views: number } | null {
  const e = store.get(id);
  if (!e) return null;
  if (Date.now() > e.expiresAt) {
    store.delete(id);
    return null;
  }
  return { expiresAt: e.expiresAt, views: e.views };
}

export function shareStoreDelete(id: string): boolean {
  return store.delete(id);
}
