import { NativeBiometric } from '@capgo/capacitor-native-biometric';
import { isNativeApp } from '@/lib/platform';
import {
  authenticateWithBiometric as webAuthenticate,
  clearBiometricCredential,
  hasBiometricCredential,
  isBiometricSupported,
  isPlatformAuthenticatorAvailable,
  registerBiometric as webRegister,
} from '@/lib/webauthn';

const NATIVE_FLAG = 'native';

export type BiometricSetupResult =
  | { ok: true }
  | { ok: false; reason: 'unavailable' | 'cancelled' | 'failed' };

/**
 * Whether Settings should offer the biometric toggle.
 * On native we always show it (plugin path); enrollment is checked when enabling.
 */
export async function isBiometricAvailable(): Promise<boolean> {
  if (isNativeApp()) {
    try {
      // Probe the plugin; even if biometrics aren't enrolled yet, keep the toggle usable.
      await NativeBiometric.isAvailable({ useFallback: true });
      return true;
    } catch {
      // Capacitor shell without a working bridge — still show the control.
      return true;
    }
  }
  if (!isBiometricSupported()) return false;
  try {
    return await isPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
}

export { clearBiometricCredential, hasBiometricCredential };

function mapNativeError(err: unknown): BiometricSetupResult['reason'] {
  const code =
    err && typeof err === 'object' && 'code' in err
      ? Number((err as { code?: number }).code)
      : NaN;
  // Capgo BiometricAuthError: USER_CANCEL=16, USER_FALLBACK=17, BIOMETRICS_*=1/3, …
  if (code === 16 || code === 17) return 'cancelled';
  if (code === 1 || code === 3 || code === 14) return 'unavailable';
  const message = err instanceof Error ? err.message : String(err ?? '');
  if (/cancel/i.test(message)) return 'cancelled';
  if (/not enrolled|unavailable|passcode|lock screen/i.test(message)) return 'unavailable';
  return 'failed';
}

export async function registerBiometric(): Promise<BiometricSetupResult> {
  if (isNativeApp()) {
    try {
      const result = await NativeBiometric.isAvailable({ useFallback: true });
      if (!result.isAvailable) {
        return { ok: false, reason: 'unavailable' };
      }
      await NativeBiometric.verifyIdentity({
        reason: 'Enable biometric login for Strong Vault',
        title: 'Biometric login',
        subtitle: 'Verify to turn on biometric unlock',
        description: 'Use fingerprint, face unlock, or your device screen lock',
        negativeButtonText: 'Cancel',
        useFallback: true,
        maxAttempts: 5,
      });
      localStorage.setItem('sv_biometric_credential', NATIVE_FLAG);
      return { ok: true };
    } catch (err) {
      return { ok: false, reason: mapNativeError(err) };
    }
  }

  try {
    const ok = await webRegister();
    return ok ? { ok: true } : { ok: false, reason: 'failed' };
  } catch (err) {
    return { ok: false, reason: mapNativeError(err) };
  }
}

export async function authenticateWithBiometric(): Promise<boolean> {
  const stored = typeof window !== 'undefined' ? localStorage.getItem('sv_biometric_credential') : null;
  if (isNativeApp() || stored === NATIVE_FLAG) {
    try {
      const result = await NativeBiometric.isAvailable({ useFallback: true });
      if (!result.isAvailable) return false;
      await NativeBiometric.verifyIdentity({
        reason: 'Unlock Strong Vault',
        title: 'Biometric login',
        subtitle: 'Verify your identity',
        description: 'Use fingerprint, face unlock, or your device screen lock',
        negativeButtonText: 'Cancel',
        useFallback: true,
        maxAttempts: 5,
      });
      return true;
    } catch {
      return false;
    }
  }
  return webAuthenticate();
}
