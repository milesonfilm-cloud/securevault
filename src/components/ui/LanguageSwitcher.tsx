'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { locales, type AppLocale, LOCALE_STORAGE_KEY } from '@/i18n/routing';

function setLocaleCookie(locale: string) {
  const maxAge = 60 * 60 * 24 * 365;
  document.cookie = `${LOCALE_STORAGE_KEY}=${locale}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

export default function LanguageSwitcher({ className = '' }: { className?: string }) {
  const t = useTranslations('language');
  const locale = useLocale() as AppLocale;
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY) as AppLocale | null;
    if (stored && locales.includes(stored) && stored !== locale) {
      setLocaleCookie(stored);
      router.refresh();
    }
  }, [locale, router]);

  const labels: Record<AppLocale, string> = {
    en: t('en'),
    hi: t('hi'),
    ta: t('ta'),
    te: t('te'),
    kn: t('kn'),
    bn: t('bn'),
  };

  return (
    <div className={className}>
      <select
        aria-label={t('label')}
        className="w-full rounded-xl border border-border bg-vault-elevated px-3 py-2.5 text-sm text-vault-text focus:outline-none focus-visible:ring-2 focus-visible:ring-vault-warm/40"
        value={locale}
        disabled={!mounted}
        onChange={(e) => {
          const next = e.target.value as AppLocale;
          localStorage.setItem(LOCALE_STORAGE_KEY, next);
          setLocaleCookie(next);
          router.refresh();
        }}
      >
        {locales.map((loc) => (
          <option key={loc} value={loc}>
            {labels[loc]}
          </option>
        ))}
      </select>
    </div>
  );
}
