import { NextResponse } from 'next/server';
import { requireAttestedSession } from '@/server/attestation/requireAttestation';

export const runtime = 'nodejs';

export async function GET() {
  const session = await requireAttestedSession();
  return NextResponse.json(
    { ok: true, subject: session.subject || null, expiresAt: session.expiresAt },
    { status: 200 }
  );
}
