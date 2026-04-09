import 'server-only';

import type { VerifyAttestationRequest, VerifyAttestationResult } from './types';
import { validateAttestationChallenge } from './challenge';
import { verifyAndroidAttestation } from './googlePlayIntegrity';
import { verifyIosAttestation } from './appleAppAttest';

export async function verifyAttestation(
  req: VerifyAttestationRequest
): Promise<VerifyAttestationResult> {
  const ch = validateAttestationChallenge(req.challenge);
  if (ch.ok === false)
    return { ok: false, platform: req.platform, reason: `challenge_${ch.reason}` };

  if (req.platform === 'android') return await verifyAndroidAttestation(req);
  if (req.platform === 'ios') return await verifyIosAttestation(req);

  return { ok: false, platform: req.platform, reason: 'unsupported_platform' };
}
