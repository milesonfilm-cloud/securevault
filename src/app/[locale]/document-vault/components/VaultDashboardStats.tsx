'use client';

import React from 'react';
import { VaultData } from '@/lib/storage';
import { cn } from '@/lib/utils';

export interface VaultDashboardStatsProps {
  vaultData: VaultData;
}

/**
 * Vault-wide summary tiles — neutral cards (not member-colored).
 */
export default function VaultDashboardStats({ vaultData }: VaultDashboardStatsProps) {
  const docSource = vaultData.documents;

  const stats = [
    { label: 'Total members', value: vaultData.members.length },
    { label: 'Total documents', value: docSource.length },
    {
      label: 'Most documents',
      value: vaultData.members.reduce(
        (best, m) => {
          const count = docSource.filter((d) => d.memberId === m.id).length;
          return count > (best.count || 0) ? { name: m.name.split(' ')[0], count } : best;
        },
        { name: '—', count: 0 }
      ).name,
    },
    {
      label: 'Categories used',
      value: new Set(docSource.map((d) => d.categoryId)).size,
    },
  ];

  return (
    <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map((stat, i) => (
        <div
          key={`vault-dash-stat-${i}`}
          className={cn(
            'rounded-2xl border border-[color:var(--color-border)] bg-vault-panel p-4 shadow-vault',
            i === 0 && 'border-l-[3px] border-l-vault-warm'
          )}
        >
          <p className="mb-1 text-xs font-medium text-vault-muted">{stat.label}</p>
          <p className="text-xl font-800 tabular-nums leading-tight text-vault-warm">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}
