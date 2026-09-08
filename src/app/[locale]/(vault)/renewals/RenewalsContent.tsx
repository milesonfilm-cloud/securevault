'use client';

import React, { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useVaultData } from '@/context/VaultDataContext';
import { collectRenewalItems } from '@/lib/documentExpiry';
import RenewalTimeline from '@/components/renewals/RenewalTimeline';
import VaultPageHeading from '@/components/ui/VaultPageHeading';

const HORIZON_DAYS = 90;

export default function RenewalsContent() {
  const t = useTranslations('renewalsPage');
  const { vaultData, loading } = useVaultData();

  const items = useMemo(
    () => collectRenewalItems(vaultData.documents, HORIZON_DAYS),
    [vaultData.documents]
  );

  if (loading) {
    return (
      <div className="vault-page animate-pulse space-y-4">
        <div className="mx-auto h-10 w-48 rounded-lg bg-vault-elevated" />
        <div className="h-40 rounded-2xl bg-vault-panel" />
      </div>
    );
  }

  return (
    <div className="vault-page">
      <VaultPageHeading
        className="mb-6 sm:mb-8"
        title={t('title')}
        description={t('description', { days: HORIZON_DAYS })}
      />

      <RenewalTimeline items={items} members={vaultData.members} />
    </div>
  );
}
