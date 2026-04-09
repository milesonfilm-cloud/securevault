import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAttestation } from '@/server/attestation/verify';
import type { VerifyAttestationRequest } from '@/server/attestation/types';
import { issueAttestedSessionCookieValue } from '@/server/attestation/session';

export const runtime = 'nodejs';

/**
 * Exchanges a successful platform attestation for a short-lived, signed session cookie
 * used to gate sensitive API routes.\n+ */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const parsed = body as Partial<VerifyAttestationRequest>;
  if (!parsed?.platform || !parsed?.token || !parsed?.challenge) {
    return NextResponse.json({ error: 'invalid_request' }, { status: 400 });
  }

  const result = await verifyAttestation(parsed as VerifyAttestationRequest);
  if (result.ok === false) {
    return NextResponse.json({ ok: false, reason: result.reason }, { status: 401 });
  }

  const cookieValue = issueAttestedSessionCookieValue({ subject: parsed.subject });
  const cookieStore = await cookies();
  cookieStore.set('sv_attested', cookieValue, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 15 * 60, // seconds
  });

  return NextResponse.json({ ok: true }, { status: 200 });
}
