'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { ChevronDown } from 'lucide-react';
import { usePathname, useRouter } from '@/i18n/navigation';
import { locales, type AppLocale, LOCALE_STORAGE_KEY } from '@/i18n/routing';
import { useAppLocaleSwitch } from '@/components/i18n/ClientLocaleProvider';
import { isNativeApp } from '@/lib/platform';

function setLocaleCookie(locale: string) {
  const maxAge = 60 * 60 * 24 * 365;
  document.cookie = `${LOCALE_STORAGE_KEY}=${locale}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

export default function LanguageSwitcher({ className = '' }: { className?: string }) {
  const t = useTranslations('language');
  const routeLocale = useLocale() as AppLocale;
  const switcher = useAppLocaleSwitch();
  const locale = switcher?.locale ?? routeLocale;
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const isMobileShell = process.env.NEXT_PUBLIC_MOBILE_BUILD === '1' || isNativeApp();

  useEffect(() => {
    setMounted(true);
  }, []);

  const labels: Record<AppLocale, string> = {
    en: t('en'),
    hi: t('hi'),
    ta: t('ta'),
    te: t('te'),
    kn: t('kn'),
    ml: t('ml'),
  };

  return (
    <div className={`relative ${className}`.trim()}>
      <select
        aria-label={t('label')}
        className="w-full appearance-none rounded-xl border border-border bg-vault-elevated py-2.5 pl-3 pr-10 text-sm text-vault-text focus:outline-none focus-visible:ring-2 focus-visible:ring-vault-warm/40"
        value={locale}
        disabled={!mounted}
        onChange={(e) => {
          const next = e.target.value as AppLocale;
          localStorage.setItem(LOCALE_STORAGE_KEY, next);
          setLocaleCookie(next);
          void switcher?.setAppLocale(next);
          if (!isMobileShell) {
            router.replace(pathname, { locale: next });
          }
        }}
      >
        {locales.map((loc) => (
          <option key={loc} value={loc}>
            {labels[loc]}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-vault-muted"
        strokeWidth={2.25}
        aria-hidden
      />
    </div>
  );
}
