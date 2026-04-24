'use client';

import React, { useMemo } from 'react';
import { CalendarClock } from 'lucide-react';
import { useVaultData } from '@/context/VaultDataContext';
import { useVaultPermissions } from '@/hooks/useVaultPermissions';
import { collectRenewalItems } from '@/lib/documentExpiry';
import RenewalTimeline from '@/components/renewals/RenewalTimeline';

const HORIZON_DAYS = 90;

export default function RenewalsContent() {
  const { vaultData, loading } = useVaultData();
  const { visibleDocuments } = useVaultPermissions();

  const items = useMemo(
    () => collectRenewalItems(visibleDocuments, HORIZON_DAYS),
    [visibleDocuments]
  );

  if (loading) {
    return (
      <div className="p-6 max-w-screen-lg mx-auto animate-pulse space-y-4">
        <div className="h-10 w-48 rounded-lg bg-vault-elevated" />
        <div className="h-40 rounded-2xl bg-vault-panel" />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 max-w-screen-lg mx-auto bg-vault-bg min-h-full">
      <div className="flex items-start gap-4 mb-8">
        <div className="w-12 h-12 rounded-2xl border border-border bg-vault-panel flex items-center justify-center text-vault-warm shrink-0">
          <CalendarClock size={24} />
        </div>
        <div>
          <p className="text-xs text-vault-faint font-medium">Planning</p>
          <h1 className="text-[28px] font-bold text-vault-text tracking-tight leading-tight mt-0.5">
            Renewals
          </h1>
          <p className="text-[13px] text-vault-muted mt-2">
            Timeline of document expiries in the next {HORIZON_DAYS} days — with UPI shortcuts for
            eligible categories.
          </p>
        </div>
      </div>

      <RenewalTimeline items={items} members={vaultData.members} />
    </div>
  );
}
