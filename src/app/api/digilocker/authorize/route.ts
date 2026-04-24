import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createHash, randomBytes } from 'crypto';
import {
  DIGILOCKER_AUTHORIZE_URL,
  DIGILOCKER_SCOPE,
} from '@/lib/digilocker/constants';

export const runtime = 'nodejs';

function looksLikePlaceholderClientId(id: string): boolean {
  const t = id.trim().toLowerCase();
  if (t.length < 8) return true;
  if (t === 'your-digilocker-client-id') return true;
  if (t.includes('your-digilocker') || t.includes('replace-me')) return true;
  return false;
}

function base64Url(buf: Buffer): string {
  return buf
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function redirectUri(): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, '');
  if (!base) {
    throw new Error('NEXT_PUBLIC_SITE_URL is required for DigiLocker redirect_uri');
  }
  return `${base}/api/digilocker/callback`;
}

/**
 * Starts OAuth: PKCE verifier + state stored in httpOnly cookies (short-lived session).
 * Redirects the browser to DigiLocker authorize.
 */
export async function GET() {
  const clientId = process.env.NEXT_PUBLIC_DIGILOCKER_CLIENT_ID?.trim();
  if (!clientId) {
    return NextResponse.json(
      { error: 'missing_client_id', detail: 'Set NEXT_PUBLIC_DIGILOCKER_CLIENT_ID' },
      { status: 503 }
    );
  }
  if (looksLikePlaceholderClientId(clientId)) {
    return NextResponse.json(
      {
        error: 'placeholder_client_id',
        detail:
          'Replace NEXT_PUBLIC_DIGILOCKER_CLIENT_ID in .env with the real app key from the DigiLocker / API Setu partner registration (not the example placeholder).',
      },
      { status: 503 }
    );
  }

  const verifier = base64Url(randomBytes(32));
  const challenge = base64Url(createHash('sha256').update(verifier).digest());
  const state = base64Url(randomBytes(16));

  let ru: string;
  try {
    ru = redirectUri();
  } catch (e) {
    return NextResponse.json(
      { error: 'missing_site_url', detail: e instanceof Error ? e.message : 'config' },
      { status: 503 }
    );
  }

  const url = new URL(DIGILOCKER_AUTHORIZE_URL);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('redirect_uri', ru);
  url.searchParams.set('scope', DIGILOCKER_SCOPE);
  url.searchParams.set('state', state);
  url.searchParams.set('code_challenge', challenge);
  url.searchParams.set('code_challenge_method', 'S256');

  const res = NextResponse.redirect(url.toString());
  const secure = process.env.NODE_ENV === 'production';
  const cookieOpts = {
    httpOnly: true,
    secure,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 600,
  };
  res.cookies.set('sv_dl_pkce', verifier, cookieOpts);
  res.cookies.set('sv_dl_state', state, cookieOpts);
  return res;
}
