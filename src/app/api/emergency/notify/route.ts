import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

/**
 * MVP: trusted contact notification. Set RESEND_API_KEY and EMERGENCY_FROM_EMAIL for real delivery.
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      to?: string;
      name?: string;
      subject?: string;
      message?: string;
      link?: string;
    };
    if (!body.to?.includes('@')) {
      return NextResponse.json({ error: 'invalid_to' }, { status: 400 });
    }

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
