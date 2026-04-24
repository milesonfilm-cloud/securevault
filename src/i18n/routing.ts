import { defineRouting } from 'next-intl/routing';

export const locales = ['en', 'hi', 'ta', 'te', 'kn', 'bn'] as const;
export type AppLocale = (typeof locales)[number];

export const defaultLocale: AppLocale = 'en';

/** Cookie + localStorage key (keep in sync with LanguageSwitcher). */
export const LOCALE_STORAGE_KEY = 'sv_language';

export const routing = defineRouting({
  locales: [...locales],
  defaultLocale,
  localePrefix: 'never',
  localeCookie: {
    name: LOCALE_STORAGE_KEY,
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  },
});
