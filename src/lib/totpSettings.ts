import type { EncryptedPayloadV1 } from '@/lib/crypto/vaultCrypto';

const TOTP_ENABLED_KEY = 'sv_totp_enabled';
const TOTP_SECRET_ENC_KEY = 'sv_totp_secret_enc';

export function isTotpEnabled(): boolean {
  try {
    return localStorage.getItem(TOTP_ENABLED_KEY) === '1';
  } catch {
    return false;
  }
}

export function setTotpEnabled(on: boolean) {
  try {
    if (on) localStorage.setItem(TOTP_ENABLED_KEY, '1');
    else localStorage.removeItem(TOTP_ENABLED_KEY);
  } catch {
    /* ignore */
  }
}

export function saveTotpSecretEncrypted(payload: EncryptedPayloadV1) {
  try {
    localStorage.setItem(TOTP_SECRET_ENC_KEY, JSON.stringify(payload));
  } catch {
    /* ignore */
  }
}

export function loadTotpSecretEncrypted(): EncryptedPayloadV1 | null {
  try {
    const raw = localStorage.getItem(TOTP_SECRET_ENC_KEY);
    if (!raw) return null;
    const o = JSON.parse(raw) as EncryptedPayloadV1;
    if (o && o.v === 1 && typeof o.ivB64 === 'string' && typeof o.ctB64 === 'string') return o;
    return null;
  } catch {
    return null;
  }
}

export function clearTotpSettings() {
  try {
    localStorage.removeItem(TOTP_ENABLED_KEY);
    localStorage.removeItem(TOTP_SECRET_ENC_KEY);
  } catch {
    /* ignore */
  }
}
