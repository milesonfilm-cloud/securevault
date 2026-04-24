import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { DIGILOCKER_TOKEN_URL } from '@/lib/digilocker/constants';

export const runtime = 'nodejs';

function redirectUri(): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, '');
  if (!base) throw new Error('NEXT_PUBLIC_SITE_URL missing');
  return `${base}/api/digilocker/callback`;
}

function htmlPage(body: string): NextResponse {
  return new NextResponse(body, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const err = searchParams.get('error');
  const errDesc = searchParams.get('error_description');

  const cookieStore = await cookies();
  const storedState = cookieStore.get('sv_dl_state')?.value;
  const verifier = cookieStore.get('sv_dl_pkce')?.value;

  cookieStore.delete('sv_dl_state');
  cookieStore.delete('sv_dl_pkce');

  if (err) {
    return htmlPage(`<!DOCTYPE html><html><body><p>Authorization failed: ${escapeHtml(err)}</p>
      <p>${escapeHtml(errDesc ?? '')}</p><script>if(window.opener)window.close();</script></body></html>`);
  }

  if (!code || !state || !storedState || state !== storedState || !verifier) {
    return htmlPage(
      `<!DOCTYPE html><html><body><p>Invalid or expired OAuth state. Close this window and try again.</p>
      <script>if(window.opener)window.close();</script></body></html>`
    );
  }

  const clientId = process.env.NEXT_PUBLIC_DIGILOCKER_CLIENT_ID?.trim();
  const clientSecret = process.env.DIGILOCKER_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) {
    return htmlPage(
      `<!DOCTYPE html><html><body><p>Server misconfiguration: missing DigiLocker client credentials.</p></body></html>`
    );
  }

  let ru: string;
  try {
    ru = redirectUri();
  } catch {
    return htmlPage(`<!DOCTYPE html><html><body><p>NEXT_PUBLIC_SITE_URL is not set.</p></body></html>`);
  }

  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: ru,
    client_id: clientId,
    client_secret: clientSecret,
    code_verifier: verifier,
  });

  const tokenRes = await fetch(DIGILOCKER_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: body.toString(),
  });

  const rawText = await tokenRes.text();
  let json: { access_token?: string; error?: string; error_description?: string };
  try {
    json = JSON.parse(rawText) as typeof json;
  } catch {
    return htmlPage(
      `<!DOCTYPE html><html><body><p>Token exchange failed (invalid JSON).</p><pre>${escapeHtml(rawText.slice(0, 500))}</pre></body></html>`
    );
  }

  if (!tokenRes.ok || !json.access_token) {
    return htmlPage(
      `<!DOCTYPE html><html><body><p>Token exchange failed.</p>
      <p>${escapeHtml(json.error ?? String(tokenRes.status))}</p>
      <p>${escapeHtml(json.error_description ?? '')}</p></body></html>`
    );
  }

  const accessToken = json.access_token;
  const tokenJson = JSON.stringify(accessToken);
  return htmlPage(`<!DOCTYPE html><html><head><title>DigiLocker</title></head><body>
    <p style="font-family:system-ui;padding:1rem">Connecting to SecureVault…</p>
    <script>
      (function () {
        var t = ${tokenJson};
        try {
          sessionStorage.setItem('sv_digilocker_token', t);
          sessionStorage.setItem('sv_digilocker_token_at', String(Date.now()));
        } catch (e) {}
        if (window.opener) {
          try {
            window.opener.postMessage({ type: 'digilocker-auth', ok: true }, window.location.origin);
          } catch (e) {}
          window.close();
        } else {
          window.location.href = '/settings-export?digilocker=connected';
        }
      })();
    </script>
  </body></html>`);
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
