// WebAuthn utility for biometric (fingerprint / Face ID) authentication

const CREDENTIAL_KEY = 'sv_biometric_credential';

export function isBiometricSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.PublicKeyCredential !== undefined &&
    typeof window.PublicKeyCredential === 'function'
  );
}

export async function isPlatformAuthenticatorAvailable(): Promise<boolean> {
  if (!isBiometricSupported()) return false;
  try {
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
}

function base64urlEncode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let str = '';
  for (const b of bytes) str += String.fromCharCode(b);
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function base64urlDecode(str: string): ArrayBuffer {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

export function hasBiometricCredential(): boolean {
  return !!localStorage.getItem(CREDENTIAL_KEY);
}

export function clearBiometricCredential(): void {
  localStorage.removeItem(CREDENTIAL_KEY);
}

export async function registerBiometric(): Promise<boolean> {
  try {
    const challenge = crypto.getRandomValues(new Uint8Array(32));
    const userId = crypto.getRandomValues(new Uint8Array(16));

    const credential = (await navigator.credentials.create({
      publicKey: {
        challenge,
        rp: { name: 'SecureVault', id: window.location.hostname },
        user: {
          id: userId,
          name: 'vault-user',
          displayName: 'Vault User',
        },
        pubKeyCredParams: [
          { alg: -7, type: 'public-key' }, // ES256
          { alg: -257, type: 'public-key' }, // RS256
        ],
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          userVerification: 'required',
          residentKey: 'preferred',
        },
        timeout: 60000,
        attestation: 'none',
      },
    })) as PublicKeyCredential | null;

    if (!credential) return false;

    // Store credential ID for future authentication
    const credentialId = base64urlEncode(credential.rawId);
    localStorage.setItem(CREDENTIAL_KEY, credentialId);
    return true;
  } catch (err) {
    console.error('Biometric registration failed:', err);
    return false;
  }
}

export async function authenticateWithBiometric(): Promise<boolean> {
  try {
    const storedId = localStorage.getItem(CREDENTIAL_KEY);
    if (!storedId) return false;

    const challenge = crypto.getRandomValues(new Uint8Array(32));

    const assertion = (await navigator.credentials.get({
      publicKey: {
        challenge,
        rpId: window.location.hostname,
        allowCredentials: [
          {
            id: base64urlDecode(storedId),
            type: 'public-key',
            transports: ['internal'],
          },
        ],
        userVerification: 'required',
        timeout: 60000,
      },
    })) as PublicKeyCredential | null;

    return !!assertion;
  } catch (err) {
    console.error('Biometric authentication failed:', err);
    return false;
  }
}
