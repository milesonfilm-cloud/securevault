import { NextResponse } from 'next/server';
import { DIGILOCKER_ISSUED_DEFAULT } from '@/lib/digilocker/constants';

export const runtime = 'nodejs';

/** Server-side proxy: browser cannot call DigiLocker directly (CORS). */
export async function GET(req: Request) {
  const auth = req.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'missing_bearer' }, { status: 401 });
  }

  const upstream =
    process.env.DIGILOCKER_ISSUED_URL?.trim() || DIGILOCKER_ISSUED_DEFAULT;

  const res = await fetch(upstream, {
    headers: {
      Authorization: auth,
      Accept: 'application/json',
    },
  });

  const text = await res.text();
  return new NextResponse(text, {
    status: res.status,
    headers: {
      'Content-Type': res.headers.get('content-type') ?? 'application/json',
      'Cache-Control': 'no-store',
    },
  });
}
