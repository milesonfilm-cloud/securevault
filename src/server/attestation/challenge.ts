import 'server-only';

import crypto from 'node:crypto';
import { getAttestationConfig } from './config';
import type { AttestationChallenge } from './types';

function sign(payload: string, secret: string) {
  return crypto.createHmac('sha256', secret).update(payload).digest('base64url');
}

export function issueAttestationChallenge(ttlMs = 2 * 60 * 1000): AttestationChallenge {
  const { challengeSecret } = getAttestationConfig();
  if (!challengeSecret) {
    throw new Error('ATTESTATION_CHALLENGE_HMAC_SECRET is not set');
  }

  const issuedAt = Date.now();
  const expiresAt = issuedAt + ttlMs;
  const challenge = crypto.randomBytes(32).toString('base64url');
  const payload = JSON.stringify({ challenge, issuedAt, expiresAt });
  const signature = sign(payload, challengeSecret);

  return { challenge, issuedAt, expiresAt, signature };
}

export function validateAttestationChallenge(
  ch: AttestationChallenge
): { ok: true } | { ok: false; reason: string } {
  const { challengeSecret } = getAttestationConfig();
  if (!challengeSecret) return { ok: false, reason: 'server_not_configured' };
  if (!ch?.challenge || !ch.signature || !ch.issuedAt || !ch.expiresAt)
    return { ok: false, reason: 'invalid_shape' };
  if (Date.now() > ch.expiresAt) return { ok: false, reason: 'expired' };

  const payload = JSON.stringify({
    challenge: ch.challenge,
    issuedAt: ch.issuedAt,
    expiresAt: ch.expiresAt,
  });
  const expected = sign(payload, challengeSecret);
  const a = Buffer.from(expected);
  const b = Buffer.from(ch.signature);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b))
    return { ok: false, reason: 'bad_signature' };
  return { ok: true };
}
