import { NextResponse } from 'next/server';
import { DIGILOCKER_FILE_URI_BASE } from '@/lib/digilocker/constants';

export const runtime = 'nodejs';

/** Proxy download: GET ?uri=... with Authorization: Bearer */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const uri = searchParams.get('uri')?.trim();
  const auth = req.headers.get('authorization');
  if (!uri || !auth?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  }

  const url = `${DIGILOCKER_FILE_URI_BASE}?uri=${encodeURIComponent(uri)}`;
  const res = await fetch(url, { headers: { Authorization: auth } });

  if (!res.ok) {
    const t = await res.text();
    return new NextResponse(t, {
      status: res.status,
      headers: { 'Content-Type': res.headers.get('content-type') ?? 'text/plain' },
    });
  }

  const headers = new Headers();
  const ct = res.headers.get('content-type');
  const cl = res.headers.get('content-length');
  const hmac = res.headers.get('hmac');
  if (ct) headers.set('Content-Type', ct);
  if (cl) headers.set('Content-Length', cl);
  if (hmac) headers.set('x-digilocker-hmac', hmac);

  return new NextResponse(res.body, { status: res.status, headers });
}
