import { NextResponse } from 'next/server';
import { EmergencyNotifySchema } from '@/lib/apiSchemas';
import { checkRateLimit } from '@/lib/rateLimit';

export const runtime = 'nodejs';

/**
 * MVP: trusted contact notification. Set RESEND_API_KEY and EMERGENCY_FROM_EMAIL for real delivery.
 */
export async function POST(req: Request) {
  const rl = await checkRateLimit(req, 'emergency');
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'rate_limited', retryAfter: rl.retryAfter },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfter ?? 60) } }
    );
  }

  try {
    let raw: unknown;
    try {
      raw = await req.json();
    } catch {
      return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
    }
    const parseResult = EmergencyNotifySchema.safeParse(raw);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'invalid_request', details: parseResult.error.flatten() },
        { status: 400 }
      );
    }
    const body = parseResult.data;

    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.EMERGENCY_FROM_EMAIL ?? 'onboarding@resend.dev';

    if (apiKey?.trim()) {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from,
          to: body.to,
          subject: body.subject ?? 'SecureVault — emergency access notice',
          text:
            body.message ??
            `This is an automated notice regarding SecureVault emergency access for ${body.name ?? 'a vault owner'}.\n\n${body.link ?? ''}`,
        }),
      });
      if (!res.ok) {
        const t = await res.text();
        return NextResponse.json(
          { error: 'mail_provider_error', detail: t.slice(0, 400) },
          { status: 502 }
        );
      }
      return NextResponse.json({ ok: true, sent: true });
    }

    console.info('[emergency/notify] dev mode — would email', body.to, body.subject);
    return NextResponse.json({ ok: true, sent: false, dev: true });
  } catch {
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
