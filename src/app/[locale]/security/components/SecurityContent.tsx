'use client';

import React from 'react';
import {
  Shield,
  KeyRound,
  EyeOff,
  Fingerprint,
  WifiOff,
  FileWarning,
  ArrowRight,
} from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import VaultPageHeading from '@/components/ui/VaultPageHeading';
import ComplianceBadgeStrip from '@/components/trust/ComplianceBadgeStrip';

export default function SecurityContent() {
  const t = useTranslations('securityPage');

  const sections = [
    {
      icon: Shield,
      title: t('encHeading'),
      body: t('encBody'),
    },
    {
      icon: KeyRound,
      title: t('kdfHeading'),
      body: t('kdfBody'),
    },
    {
      icon: EyeOff,
      title: t('zkHeading'),
      body: t('zkBody'),
    },
    {
      icon: Fingerprint,
      title: t('webauthnHeading'),
      body: t('webauthnBody'),
    },
    {
      icon: WifiOff,
      title: t('offlineHeading'),
      body: t('offlineBody'),
    },
    {
      icon: FileWarning,
      title: t('threatHeading'),
      body: t('threatBody'),
    },
  ] as const;

  return (
    <div className="vault-page">
      <VaultPageHeading
        className="mb-8"
        title={t('title')}
        description={t('intro')}
        meta={<ComplianceBadgeStrip className="mt-3" />}
      />

      <section className="neo-card mb-5 rounded-2xl border border-[#4338C9]/20 bg-[#4338C9]/05 p-5 sm:p-6">
        <h2 className="text-lg font-bold text-vault-text">{t('diffHeading')}</h2>
        <p className="mt-2 text-sm leading-relaxed text-vault-muted">{t('diffBody')}</p>
      </section>

      <div className="space-y-4">
        {sections.map(({ icon: Icon, title, body }) => (
          <section key={title} className="neo-card rounded-2xl p-5 sm:p-6">
            <div className="mb-3 flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-vault-elevated text-vault-warm">
                <Icon size={18} aria-hidden />
              </div>
              <h2 className="text-base font-bold text-vault-text sm:text-lg">{title}</h2>
            </div>
            <p className="text-sm leading-relaxed text-vault-muted">{body}</p>
          </section>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-sm">
        <Link
          href="/about"
          className="inline-flex items-center gap-1.5 font-700 text-vault-warm hover:text-vault-text"
        >
          {t('linkAbout')}
          <ArrowRight size={16} aria-hidden />
        </Link>
        <Link
          href="/privacy"
          className="inline-flex items-center gap-1.5 font-700 text-vault-warm hover:text-vault-text"
        >
          {t('linkPrivacy')}
          <ArrowRight size={16} aria-hidden />
        </Link>
      </div>
    </div>
  );
}
