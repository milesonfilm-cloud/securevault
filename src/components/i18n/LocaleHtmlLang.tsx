'use client';

import { useLocale } from 'next-intl';
import { useEffect } from 'react';
import { useAppLocaleSwitch } from '@/components/i18n/ClientLocaleProvider';

/** Syncs `<html lang>` with the active UI language (in-app switch or route locale). */
export default function LocaleHtmlLang() {
  const routeLocale = useLocale();
  const switcher = useAppLocaleSwitch();
  const locale = switcher?.locale ?? routeLocale;

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return null;
}
