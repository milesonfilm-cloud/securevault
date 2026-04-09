import { NextResponse } from 'next/server';
import { verifyAttestation } from '@/server/attestation/verify';
import type { VerifyAttestationRequest } from '@/server/attestation/types';

export const runtime = 'nodejs';

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

  return NextResponse.json(
    { ok: true, platform: result.platform, details: result.details || null },
    { status: 200 }
  );
}
