'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { defaultLocale, locales, LOCALE_STORAGE_KEY, type AppLocale } from '@/i18n/routing';

type LocaleSwitchContextValue = {
  /** UI / message locale (can change in-app without navigating). */
  locale: AppLocale;
  /**
   * Locale baked into the URL / static routes. On the mobile shell only `en`
   * pages exist, so navigation must keep using this even when UI language changes.
   */
  routingLocale: AppLocale;
  setAppLocale: (locale: AppLocale) => Promise<void>;
};

const LocaleSwitchContext = createContext<LocaleSwitchContextValue | null>(null);

export function useAppLocaleSwitch() {
  return useContext(LocaleSwitchContext);
}

async function loadMessages(locale: AppLocale): Promise<Record<string, unknown>> {
  switch (locale) {
    case 'hi':
      return (await import('../../../messages/hi.json')).default;
    case 'ta':
      return (await import('../../../messages/ta.json')).default;
    case 'te':
      return (await import('../../../messages/te.json')).default;
    case 'kn':
      return (await import('../../../messages/kn.json')).default;
    case 'ml':
      return (await import('../../../messages/ml.json')).default;
    default:
      return (await import('../../../messages/en.json')).default;
  }
}

function persistLocale(locale: AppLocale) {
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    document.cookie = `${LOCALE_STORAGE_KEY}=${locale}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
    document.documentElement.lang = locale;
  } catch {
    /* ignore */
  }
}

export default function ClientLocaleProvider({
  children,
  initialLocale,
}: {
  children: React.ReactNode;
  initialLocale: string;
}) {
  const start = (
    locales.includes(initialLocale as AppLocale) ? initialLocale : defaultLocale
  ) as AppLocale;
  const [locale, setLocale] = useState<AppLocale>(start);
  const [messages, setMessages] = useState<Record<string, unknown> | null>(null);

  const setAppLocale = useCallback(async (next: AppLocale) => {
    const loaded = await loadMessages(next);
    persistLocale(next);
    setMessages(loaded);
    setLocale(next);
  }, []);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCALE_STORAGE_KEY) as AppLocale | null;
      if (stored && locales.includes(stored) && stored !== start) {
        void setAppLocale(stored);
      }
    } catch {
      /* ignore */
    }
  }, [setAppLocale, start]);

  const value = useMemo(
    () => ({ locale, routingLocale: start, setAppLocale }),
    [locale, start, setAppLocale]
  );

  return (
    <LocaleSwitchContext.Provider value={value}>
      {messages ? (
        /*
         * Keep provider `locale` on the route locale so next-intl Link/router
         * stay on existing static paths (e.g. /en/...). Messages still follow
         * the in-app language selection.
         */
        <NextIntlClientProvider locale={start} messages={messages}>
          {children}
        </NextIntlClientProvider>
      ) : (
        children
      )}
    </LocaleSwitchContext.Provider>
  );
}
