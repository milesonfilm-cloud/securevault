import { NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rateLimit';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const rl = await checkRateLimit(req, 'digilocker');
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'rate_limited', retryAfter: rl.retryAfter },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfter ?? 60) } }
    );
  }

  return NextResponse.json(
    {
      error: 'digilocker_unavailable',
      message: 'DigiLocker OAuth is not configured in this build.',
    },
    { status: 501 }
  );
}
