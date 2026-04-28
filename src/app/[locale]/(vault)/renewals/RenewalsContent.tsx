'use client';

import React, { useMemo } from 'react';
import { CalendarClock } from 'lucide-react';
import { useVaultData } from '@/context/VaultDataContext';
import { collectRenewalItems } from '@/lib/documentExpiry';
import RenewalTimeline from '@/components/renewals/RenewalTimeline';
import VaultPageHeading from '@/components/ui/VaultPageHeading';

const HORIZON_DAYS = 90;

export default function RenewalsContent() {
  const { vaultData, loading } = useVaultData();

  const items = useMemo(
    () => collectRenewalItems(vaultData.documents, HORIZON_DAYS),
    [vaultData.documents]
  );

  if (loading) {
    return (
      <div className="mx-auto max-w-screen-lg animate-pulse space-y-4 p-6">
        <div className="mx-auto h-10 w-48 rounded-lg bg-vault-elevated" />
        <div className="h-40 rounded-2xl bg-vault-panel" />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 max-w-screen-lg mx-auto bg-vault-bg min-h-full">
      <VaultPageHeading
        className="mb-8"
        icon={
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-vault-panel text-vault-warm">
            <CalendarClock size={24} aria-hidden />
          </div>
        }
        eyebrow="Planning"
        title="Renewals"
        description={`Timeline of document expiries in the next ${HORIZON_DAYS} days — with UPI shortcuts for eligible categories.`}
        titleClassName="mt-0.5 text-[28px] font-bold tracking-tight leading-tight text-vault-text sm:text-[32px]"
      />

      <RenewalTimeline items={items} members={vaultData.members} />
    </div>
  );
}
