import 'server-only';

import crypto from 'node:crypto';
import { getAttestationConfig } from './config';

type AttestedSessionPayload = {
  subject?: string;
  issuedAt: number;
  expiresAt: number;
};

function sign(payload: string, secret: string) {
  return crypto.createHmac('sha256', secret).update(payload).digest('base64url');
}

export function issueAttestedSessionCookieValue(
  payload: Omit<AttestedSessionPayload, 'issuedAt' | 'expiresAt'> & { ttlMs?: number }
) {
  const { challengeSecret } = getAttestationConfig();
  if (!challengeSecret) throw new Error('ATTESTATION_CHALLENGE_HMAC_SECRET is not set');

  const issuedAt = Date.now();
  const ttlMs = payload.ttlMs ?? 15 * 60 * 1000;
  const expiresAt = issuedAt + ttlMs;

  const data: AttestedSessionPayload = { subject: payload.subject, issuedAt, expiresAt };
  const body = Buffer.from(JSON.stringify(data)).toString('base64url');
  const sig = sign(body, challengeSecret);
  return `${body}.${sig}`;
}

export function verifyAttestedSessionCookieValue(
  value: string | null | undefined
): { ok: true; payload: AttestedSessionPayload } | { ok: false; reason: string } {
  const { challengeSecret } = getAttestationConfig();
  if (!challengeSecret) return { ok: false, reason: 'server_not_configured' };
  if (!value) return { ok: false, reason: 'missing' };

  const [body, sig] = value.split('.');
  if (!body || !sig) return { ok: false, reason: 'invalid_shape' };

  const expected = sign(body, challengeSecret);
  const a = Buffer.from(expected);
  const b = Buffer.from(sig);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b))
    return { ok: false, reason: 'bad_signature' };

  let payload: AttestedSessionPayload;
  try {
    payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as AttestedSessionPayload;
  } catch {
    return { ok: false, reason: 'bad_payload' };
  }
  if (!payload?.issuedAt || !payload?.expiresAt) return { ok: false, reason: 'bad_payload' };
  if (Date.now() > payload.expiresAt) return { ok: false, reason: 'expired' };
  return { ok: true, payload };
}
