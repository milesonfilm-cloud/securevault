import 'server-only';

import type { VerifyAttestationRequest, VerifyAttestationResult } from './types';
import { getAttestationConfig } from './config';

/**
 * Minimal placeholder verifier.
 *
 * Proper Play Integrity verification requires:
 * - fetching an access token using a Google service account (OAuth)
 * - calling the Play Integrity verdict endpoint
 * - validating package name, app version, device integrity, and binding to challenge/nonce
 *
 * This function is structured so you can drop in the real implementation when credentials are available.
 */
export async function verifyAndroidAttestation(
  _req: VerifyAttestationRequest
): Promise<VerifyAttestationResult> {
  const cfg = getAttestationConfig();
  const configured =
    Boolean(cfg.android.serviceAccountJson) &&
    Boolean(cfg.android.packageName) &&
    Boolean(cfg.android.cloudProjectNumber);

  if (!configured) {
    return {
      ok: false,
      platform: 'android',
      reason: 'android_attestation_not_configured',
    };
  }

  // Intentionally not implemented without credentials and a concrete policy.
  return {
    ok: false,
    platform: 'android',
    reason: 'android_attestation_verification_not_implemented',
  };
}
