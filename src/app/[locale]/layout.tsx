import React from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import ConditionalAuthGuard from '@/components/ConditionalAuthGuard';
import LocaleHtmlLang from '@/components/i18n/LocaleHtmlLang';
import ConsentBanner from '@/components/ConsentBanner';

export function generateStaticParams() {
  // Mobile build (Capacitor shell) is Android/iOS only. To keep the static export small
  // and avoid Windows heap-OOM, generate only the `en` locale routes.
  if (process.env.NEXT_PUBLIC_MOBILE_BUILD === '1') {
    return [{ locale: 'en' }];
  }
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <LocaleHtmlLang />
      <ConditionalAuthGuard>{children}</ConditionalAuthGuard>
      <ConsentBanner />
    </NextIntlClientProvider>
  );
}
