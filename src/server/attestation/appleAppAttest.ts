import 'server-only';

import type { VerifyAttestationRequest, VerifyAttestationResult } from './types';
import { getAttestationConfig } from './config';

/**
 * Minimal placeholder verifier.
 *
 * Proper App Attest verification requires:
 * - verifying Apple attestation objects/assertions
 * - tracking keyId/public key per device
 * - validating nonce binding to server challenge
 *
 * This function is structured so you can add the real implementation when you have
 * Apple key material + a persistence layer.
 */
export async function verifyIosAttestation(
  _req: VerifyAttestationRequest
): Promise<VerifyAttestationResult> {
  const cfg = getAttestationConfig();
  const configured = Boolean(cfg.ios.teamId) && Boolean(cfg.ios.bundleId);

  if (!configured) {
    return {
      ok: false,
      platform: 'ios',
      reason: 'ios_attestation_not_configured',
    };
  }

  return {
    ok: false,
    platform: 'ios',
    reason: 'ios_attestation_verification_not_implemented',
  };
}
