/**
 * Persists the vault AES key across full page reloads (same browser profile) for a limited TTL.
 * The key is wrapped with a random secret stored alongside the ciphertext in localStorage —
 * possession of that storage during the TTL is treated like an unlocked session (same threat
 * model as "remember me" on a trusted device).
 */

import { base64ToBytes, bytesToBase64 } from './crypto/base64';
import { SESSION_UNLOCKED_KEY } from './vaultSession';

export const VAULT_UNLOCK_PERSIST_STORAGE_KEY = `${SESSION_UNLOCKED_KEY}_persist`;
export const VAULT_PERSIST_TTL_MS = 1000 * 60 * 60 * 12; // 12h

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const out = new Uint8Array(bytes.byteLength);
  out.set(bytes);
  return out.buffer;
}

type PersistV1 = {
  v: 1;
  unlockedAt: number;
  wrapSecretB64: string;
  keyIvB64: string;
  keyCtB64: string;
};

export async function persistUnlockedVaultKey(vaultKey: CryptoKey): Promise<void> {
  try {
    const rawVault = new Uint8Array(await crypto.subtle.exportKey('raw', vaultKey));
    const wrapSecret = crypto.getRandomValues(new Uint8Array(32));
    const wrapKey = await crypto.subtle.importKey(
      'raw',
      toArrayBuffer(wrapSecret),
      'AES-GCM',
      false,
      ['encrypt']
    );
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const ct = new Uint8Array(
      await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, wrapKey, toArrayBuffer(rawVault))
    );
    const payload: PersistV1 = {
      v: 1,
      unlockedAt: Date.now(),
      wrapSecretB64: bytesToBase64(wrapSecret),
      keyIvB64: bytesToBase64(iv),
      keyCtB64: bytesToBase64(ct),
    };
    localStorage.setItem(VAULT_UNLOCK_PERSIST_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* quota, private mode, etc. — unlock still succeeds without persist */
  }
}

export async function tryRestoreVaultKeyFromPersist(): Promise<CryptoKey | null> {
  try {
    const raw = localStorage.getItem(VAULT_UNLOCK_PERSIST_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PersistV1> & { unlockedAt?: number };
    if (parsed.v !== 1 || !parsed.wrapSecretB64 || !parsed.keyIvB64 || !parsed.keyCtB64) {
      localStorage.removeItem(VAULT_UNLOCK_PERSIST_STORAGE_KEY);
      return null;
    }
    const unlockedAt = parsed.unlockedAt ?? 0;
    if (!unlockedAt || Date.now() - unlockedAt > VAULT_PERSIST_TTL_MS) {
      localStorage.removeItem(VAULT_UNLOCK_PERSIST_STORAGE_KEY);
      return null;
    }
    const wrapSecret = base64ToBytes(parsed.wrapSecretB64);
    const wrapKey = await crypto.subtle.importKey(
      'raw',
      toArrayBuffer(wrapSecret),
      'AES-GCM',
      false,
      ['decrypt']
    );
    const iv = Uint8Array.from(base64ToBytes(parsed.keyIvB64));
    const ct = Uint8Array.from(base64ToBytes(parsed.keyCtB64));
    const rawVaultBuf = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      wrapKey,
      toArrayBuffer(ct)
    );
    return await crypto.subtle.importKey(
      'raw',
      toArrayBuffer(new Uint8Array(rawVaultBuf)),
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );
  } catch {
    try {
      localStorage.removeItem(VAULT_UNLOCK_PERSIST_STORAGE_KEY);
    } catch {
      /* ignore */
    }
    return null;
  }
}

export function clearPersistedVaultKey(): void {
  try {
    localStorage.removeItem(VAULT_UNLOCK_PERSIST_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

/** End session and reload so AuthGuard shows the unlock screen (sidebar + mobile nav). */
export function lockVaultAndReload(): void {
  try {
    sessionStorage.removeItem(SESSION_UNLOCKED_KEY);
  } catch {
    /* ignore */
  }
  clearPersistedVaultKey();
  window.location.reload();
}
