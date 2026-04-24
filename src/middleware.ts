import createMiddleware from 'next-intl/middleware';
import { routing, LOCALE_STORAGE_KEY, locales, defaultLocale } from '@/i18n/routing';
import { NextRequest } from 'next/server';

const handleI18n = createMiddleware(routing);

/** Minimal Accept-Language → locale (no extra deps). */
function negotiateFromHeader(request: NextRequest): string {
  const header = request.headers.get('accept-language');
  if (!header) return defaultLocale;
  const parts = header.split(',').map((p) => p.trim().split(';')[0]?.toLowerCase() ?? '');
  for (const p of parts) {
    const base = p.split('-')[0];
    if (locales.includes(base as (typeof locales)[number])) return base as (typeof locales)[number];
  }
  return defaultLocale;
}

/**
 * next-intl negotiates locale from cookie `sv_language` (set by LanguageSwitcher + mirrored from localStorage).
 * If the cookie is missing, we set it from Accept-Language once so SSR matches the browser; the client can
 * still override via LanguageSwitcher (writes cookie + localStorage).
 */
export default function middleware(request: NextRequest) {
  const hasCookie = request.cookies.has(LOCALE_STORAGE_KEY);
  const res = handleI18n(request);

  if (!hasCookie && res.ok) {
    const guess = negotiateFromHeader(request);
    res.cookies.set(LOCALE_STORAGE_KEY, guess, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
    });
  }

  return res;
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
