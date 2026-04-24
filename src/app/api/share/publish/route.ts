import { NextResponse } from 'next/server';
import { shareStorePut } from '@/server/shareStore';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      id?: string;
      cipherB64?: string;
      expiresAt?: string;
    };
    if (!body.id || !body.cipherB64 || !body.expiresAt) {
      return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
    }
    const exp = Date.parse(body.expiresAt);
    if (!Number.isFinite(exp)) {
      return NextResponse.json({ error: 'invalid_expiry' }, { status: 400 });
    }
    shareStorePut(body.id, body.cipherB64, exp);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
