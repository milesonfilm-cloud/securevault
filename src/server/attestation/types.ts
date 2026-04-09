export type AttestationPlatform = 'android' | 'ios';

export type AttestationChallenge = {
  /**
   * Opaque challenge string sent to device SDK.
   * Must be echoed/embedded in platform attestation.
   */
  challenge: string;
  /** Unix ms */
  issuedAt: number;
  /** Unix ms */
  expiresAt: number;
  /**
   * HMAC signature over the challenge payload.
   * Used to prevent client-side fabrication of challenges.
   */
  signature: string;
};

export type VerifyAttestationRequest = {
  platform: AttestationPlatform;
  /** Platform-provided attestation token/assertion */
  token: string;
  /** The challenge received from the server */
  challenge: AttestationChallenge;
  /** Optional app/user binding identifier decided by your backend */
  subject?: string;
};

export type VerifyAttestationResult =
  | { ok: true; platform: AttestationPlatform; details?: Record<string, unknown> }
  | { ok: false; platform: AttestationPlatform; reason: string };
