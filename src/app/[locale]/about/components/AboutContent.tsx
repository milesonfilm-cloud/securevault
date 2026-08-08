'use client';

import React, { useState } from 'react';
import { Shield, Scale, Lock, FileText, ChevronDown, Landmark, ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import BrandLogoFull from '@/components/ui/BrandLogoFull';
import ComplianceBadgeStrip from '@/components/trust/ComplianceBadgeStrip';
import VaultIntegrityCard from '@/components/trust/VaultIntegrityCard';
import { cn } from '@/lib/utils';

function AccordionSection({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-border last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 py-3 text-left"
        aria-expanded={open}
      >
        <span className="text-base font-bold text-vault-text">{title}</span>
        <ChevronDown
          size={18}
          className={cn('shrink-0 text-vault-muted transition-transform', open && 'rotate-180')}
        />
      </button>
      {open ? <div className="pb-4 text-sm leading-relaxed text-vault-muted">{children}</div> : null}
    </div>
  );
}

export default function AboutContent() {
  const t = useTranslations('aboutPage');

  const strongEm = (chunks: React.ReactNode) => (
    <strong className="font-semibold text-vault-text">{chunks}</strong>
  );

  const strongPlain = (chunks: React.ReactNode) => (
    <strong className="text-vault-text">{chunks}</strong>
  );

  const termSections = [
    { title: t('t1Title'), body: t('t1Body') },
    { title: t('t2Title'), body: t('t2Body') },
    { title: t('t3Title'), body: t('t3Body') },
    { title: t('t4Title'), body: t('t4Body') },
    {
      title: t('t5Title'),
      body: t.rich('t5Body', { asis: strongPlain, asavail: strongPlain }),
    },
    { title: t('t6Title'), body: t('t6Body') },
    { title: t('t7Title'), body: t('t7Body') },
    { title: t('t8Title'), body: t('t8Body') },
  ];

  return (
    <div className="mx-auto min-h-full max-w-screen-lg bg-vault-bg p-4 lg:p-6">
      <div className="mb-10 flex flex-col items-center text-center">
        <BrandLogoFull iconSize={220} className="mb-6" />
        <h1 className="text-2xl font-extrabold tracking-tight text-vault-text sm:text-3xl">
          {t('title')}
        </h1>
        <p className="mt-2 max-w-md text-sm text-vault-muted">{t('intro')}</p>
        <ComplianceBadgeStrip className="mt-5" />
      </div>

      <section className="neo-card mb-5 rounded-2xl p-5 sm:p-6">
        <div className="mb-4 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-vault-elevated text-vault-warm">
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

      <section className="neo-card mb-5 rounded-2xl p-5 sm:p-6">
        <div className="mb-4 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-vault-elevated text-vault-warm">
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
          <Link
            href="/security"
            className="inline-flex items-center gap-1.5 pt-1 text-sm font-700 text-vault-warm hover:text-vault-text"
          >
            {t('securityPageLink')}
            <ArrowRight size={16} aria-hidden />
          </Link>
        </div>
      </section>

      <section className="neo-card mb-5 rounded-2xl p-5 sm:p-6">
        <div className="mb-4 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-vault-elevated text-vault-warm">
            <Landmark size={18} aria-hidden />
          </div>
          <h2 className="text-lg font-bold text-vault-text">{t('dpdpHeading')}</h2>
        </div>
        <div className="space-y-3 text-sm leading-relaxed text-vault-muted">
          <p className="text-vault-text font-medium">{t('dpdpLead')}</p>
          <p>{t('dpdpIntro')}</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>{t('dpdpMinimise')}</li>
            <li>{t('dpdpPurpose')}</li>
            <li>{t('dpdpStorage')}</li>
            <li>{t('dpdpAccess')}</li>
            <li>{t('dpdpErasure')}</li>
          </ul>
          <p className="rounded-xl bg-vault-elevated/60 px-3 py-2 text-vault-text">{t('dpdpLocal')}</p>
          <p className="text-xs text-vault-faint">{t('dpdpDisclaimer')}</p>
        </div>
      </section>

      <VaultIntegrityCard />

      <section className="neo-card mb-5 rounded-2xl p-5 sm:p-6">
        <div className="mb-2 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-vault-elevated text-vault-warm">
            <FileText size={18} aria-hidden />
          </div>
          <h2 className="text-lg font-bold text-vault-text">{t('termsHeading')}</h2>
        </div>
        <p className="mb-4 text-xs text-vault-faint">{t('termsEffective')}</p>
        <div className="divide-y divide-border rounded-xl border border-border px-4">
          {termSections.map((section) => (
            <AccordionSection key={section.title} title={section.title}>
              {section.body}
            </AccordionSection>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-vault-coral/35 bg-vault-elevated/40 p-5 sm:p-6">
        <div className="mb-2 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-vault-coral/15 text-vault-coral">
            <Scale size={18} aria-hidden />
          </div>
          <h2 className="text-lg font-bold text-vault-text">{t('disclaimerHeading')}</h2>
        </div>
        <div className="divide-y divide-border rounded-xl border border-vault-coral/20 px-4 mt-2">
          <AccordionSection title={t('disclaimerReadCarefully')} defaultOpen>
            <div className="space-y-3">
              <p>
                {t.rich('disclaimerP1', {
                  asis: strongPlain,
                  asavail: strongPlain,
                  noliab: strongPlain,
                })}
              </p>
              <p>{t('disclaimerP2')}</p>
            </div>
          </AccordionSection>
        </div>
      </section>
    </div>
  );
}
