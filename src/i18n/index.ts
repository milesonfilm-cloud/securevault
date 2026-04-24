import { getRequestConfig } from 'next-intl/server';
import { mergeMessages } from '@/i18n/mergeMessages';
import { defaultLocale, locales, type AppLocale } from '@/i18n/routing';
import type en from '../../messages/en.json';

export { locales, defaultLocale, LOCALE_STORAGE_KEY, routing, type AppLocale } from '@/i18n/routing';

type Messages = typeof en;

async function loadMessages(locale: string): Promise<Messages> {
  const base = (await import('../../messages/en.json')).default as Messages;
  if (locale === 'en') return base;
  let overlay: Partial<Messages> = {};
  switch (locale) {
    case 'hi':
      overlay = (await import('../../messages/hi.json')).default;
      break;
    case 'ta':
      overlay = (await import('../../messages/ta.json')).default;
      break;
    case 'te':
      overlay = (await import('../../messages/te.json')).default;
      break;
    case 'kn':
      overlay = (await import('../../messages/kn.json')).default;
      break;
    case 'bn':
      overlay = (await import('../../messages/bn.json')).default;
      break;
    default:
      overlay = {};
  }
  return mergeMessages(base, overlay as Record<string, unknown>);
}

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  if (!locale || !locales.includes(locale as AppLocale)) {
    locale = defaultLocale;
  }
  return {
    locale,
    messages: await loadMessages(locale),
  };
});
