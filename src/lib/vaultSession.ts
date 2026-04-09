import type { KdfParamsV1 } from './crypto/vaultCrypto';

let _vaultKey: CryptoKey | null = null;

export const PIN_KDF_PARAMS_KEY = 'sv_pin_kdf_v1';
export const PIN_VERIFIER_KEY = 'sv_pin_verifier_v1';
export const SESSION_UNLOCKED_KEY = 'sv_session_unlocked';

export function setVaultKey(key: CryptoKey) {
  _vaultKey = key;
}

export function clearVaultKey() {
  _vaultKey = null;
}

export function getVaultKey(): CryptoKey {
  if (!_vaultKey) throw new Error('Vault is locked');
  return _vaultKey;
}

export function getStoredKdfParams(): KdfParamsV1 | null {
  const raw = localStorage.getItem(PIN_KDF_PARAMS_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as KdfParamsV1;
  } catch {
    return null;
  }
}

export function setStoredKdfParams(params: KdfParamsV1) {
  localStorage.setItem(PIN_KDF_PARAMS_KEY, JSON.stringify(params));
}

export function getStoredVerifier(): string | null {
  return localStorage.getItem(PIN_VERIFIER_KEY);
}

export function setStoredVerifier(verifierB64: string) {
  localStorage.setItem(PIN_VERIFIER_KEY, verifierB64);
}
