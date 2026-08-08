import { defineRouting } from 'next-intl/routing';

// Full locale list (typesafe). Mobile builds may still generate fewer routes.
export const locales = ['en', 'hi', 'ta', 'te', 'kn', 'ml'] as const;
export type AppLocale = (typeof locales)[number];

export const defaultLocale: AppLocale = 'en';

/** Cookie + localStorage key (keep in sync with LanguageSwitcher). */
export const LOCALE_STORAGE_KEY = 'sv_language';

export const routing = defineRouting({
  locales: [...locales],
  defaultLocale,
  /** Required for Capacitor static export (no Next middleware in the mobile shell). */
  localePrefix: 'always',
  localeCookie: {
    name: LOCALE_STORAGE_KEY,
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  },
});
