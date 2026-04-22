import { parseKdfParamsJson, type KdfParams } from './crypto/vaultCrypto';

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

export function getStoredKdfParams(): KdfParams | null {
  const raw = localStorage.getItem(PIN_KDF_PARAMS_KEY);
  if (!raw) return null;
  return parseKdfParamsJson(raw);
}

export function setStoredKdfParams(params: KdfParams) {
  localStorage.setItem(PIN_KDF_PARAMS_KEY, JSON.stringify(params));
}

export function getStoredVerifier(): string | null {
  return localStorage.getItem(PIN_VERIFIER_KEY);
}

export function setStoredVerifier(verifierB64: string) {
  localStorage.setItem(PIN_VERIFIER_KEY, verifierB64);
}
