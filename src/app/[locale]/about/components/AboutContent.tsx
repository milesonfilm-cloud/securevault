'use client';

import React from 'react';
import { Shield, Scale, Lock, FileText } from 'lucide-react';
import { useTranslations } from 'next-intl';
import BrandMarkSvg from '@/components/ui/BrandMarkSvg';
import VaultPageHeading from '@/components/ui/VaultPageHeading';

export default function AboutContent() {
  const t = useTranslations('aboutPage');

  const strongEm = (chunks: React.ReactNode) => (
    <strong className="font-semibold text-vault-text">{chunks}</strong>
  );

  const strongPlain = (chunks: React.ReactNode) => (
    <strong className="text-vault-text">{chunks}</strong>
  );

  return (
    <div className="vault-page">
      <VaultPageHeading
        className="mb-8"
        icon={<BrandMarkSvg size={72} title="Strong Vault" />}
        title={t('title')}
        description={t('intro')}
      />

      <section className="neo-card mb-5 rounded-2xl p-5 text-left sm:p-6">
        <div className="mb-4 flex items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-vault-elevated text-vault-warm">
            <Shield size={18} aria-hidden />
          </div>
          <h2 className="text-lg font-bold text-vault-text">{t('whatHeading')}</h2>
        </div>
        <div className="space-y-3 text-sm leading-relaxed text-vault-muted">
          <p className="text-vault-text">
            {t('whatP1a')}
            <strong className="font-semibold text-vault-text">{t('whatP1b')}</strong>
            {t('whatP1c')}
          </p>
          <p>
            {t('whatP2a')}
            <strong className="text-vault-text">{t('whatP2b')}</strong>
            {t('whatP2c')}
          </p>
        </div>
      </section>

      <section className="neo-card mb-5 rounded-2xl p-5 text-left sm:p-6">
        <div className="mb-4 flex items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-vault-elevated text-vault-warm">
            <Lock size={18} aria-hidden />
          </div>
          <h2 className="text-lg font-bold text-vault-text">{t('securityHeading')}</h2>
        </div>
        <div className="space-y-3 text-sm leading-relaxed text-vault-muted">
          <p className="text-vault-text">
            {t.rich('securityP1', {
              wca: strongEm,
              newv: strongEm,
              argon: strongEm,
              oldv: strongEm,
            })}
          </p>
          <p>{t('securityP2')}</p>
        </div>
      </section>

      <section className="neo-card mb-5 rounded-2xl p-5 text-left sm:p-6">
        <div className="mb-4 flex items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-vault-elevated text-vault-warm">
            <FileText size={18} aria-hidden />
          </div>
          <h2 className="text-lg font-bold text-vault-text">{t('termsHeading')}</h2>
        </div>
        <div className="space-y-4 text-sm leading-relaxed text-vault-muted">
          <p className="text-xs font-semibold uppercase tracking-wide text-vault-faint">
            {t('termsEffective')}
          </p>
          <div className="space-y-3">
            <h3 className="text-base font-bold text-vault-text">{t('t1Title')}</h3>
            <p>{t('t1Body')}</p>
            <h3 className="text-base font-bold text-vault-text">{t('t2Title')}</h3>
            <p>{t('t2Body')}</p>
            <h3 className="text-base font-bold text-vault-text">{t('t3Title')}</h3>
            <p>{t('t3Body')}</p>
            <h3 className="text-base font-bold text-vault-text">{t('t4Title')}</h3>
            <p>{t('t4Body')}</p>
            <h3 className="text-base font-bold text-vault-text">{t('t5Title')}</h3>
            <p>
              {t.rich('t5Body', {
                asis: strongPlain,
                asavail: strongPlain,
              })}
            </p>
            <h3 className="text-base font-bold text-vault-text">{t('t6Title')}</h3>
            <p>{t('t6Body')}</p>
            <h3 className="text-base font-bold text-vault-text">{t('t7Title')}</h3>
            <p>{t('t7Body')}</p>
            <h3 className="text-base font-bold text-vault-text">{t('t8Title')}</h3>
            <p>{t('t8Body')}</p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-vault-coral/35 bg-vault-elevated/40 p-5 text-left sm:p-6">
        <div className="mb-4 flex items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-vault-coral/15 text-vault-coral">
            <Scale size={18} aria-hidden />
          </div>
          <h2 className="text-lg font-bold text-vault-text">{t('disclaimerHeading')}</h2>
        </div>
        <div className="space-y-3 text-xs leading-relaxed text-vault-muted sm:text-sm">
          <p className="font-semibold uppercase tracking-wide text-vault-coral">
            {t('disclaimerReadCarefully')}
          </p>
          <p>
            {t.rich('disclaimerP1', {
              asis: strongPlain,
              asavail: strongPlain,
              noliab: strongPlain,
            })}
          </p>
          <p>{t('disclaimerP2')}</p>
        </div>
      </section>
    </div>
  );
}
