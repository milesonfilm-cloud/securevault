import { NextResponse } from 'next/server';
import { EmergencyHandoverPublishSchema } from '@/lib/apiSchemas';
import { checkRateLimit } from '@/lib/rateLimit';
import { handoverStorePut } from '@/server/handoverStore';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const rl = await checkRateLimit(req, 'emergency');
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'rate_limited', retryAfter: rl.retryAfter },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfter ?? 60) } }
    );
  }

  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
    }
    const parseResult = EmergencyHandoverPublishSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'invalid_request', details: parseResult.error.flatten() },
        { status: 400 }
      );
    }
    const { id, cipherB64, expiresAt } = parseResult.data;
    const exp = Date.parse(expiresAt);
    handoverStorePut(id, cipherB64, exp);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
