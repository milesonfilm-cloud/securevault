'use client';

import React from 'react';
import { VaultData } from '@/lib/storage';
import { cn } from '@/lib/utils';

export interface VaultDashboardStatsProps {
  vaultData: VaultData;
}

/** Pastel vault tiles follow the selected family member accent (CSS vars from PastelAccentCssSync). */
const VAULT_TILES = [
  { bg: 'rgba(255,255,255,0.72)' },
  { bg: 'rgba(255,255,255,0.78)' },
  { bg: 'rgba(255,255,255,0.68)' },
  { bg: 'rgba(255,255,255,0.74)' },
] as const;

/**
 * Overview tiles: total members, documents, member with most docs, category breadth.
 * Lives on the Document Vault page (moved from Family Members).
 */
export default function VaultDashboardStats({ vaultData }: VaultDashboardStatsProps) {
  const docSource = vaultData.documents;

  const stats = [
    { label: 'Total Members', value: vaultData.members.length },
    { label: 'Total Documents', value: docSource.length },
    {
      label: 'Most Documents',
      value: vaultData.members.reduce(
        (best, m) => {
          const count = docSource.filter((d) => d.memberId === m.id).length;
          return count > (best.count || 0) ? { name: m.name.split(' ')[0], count } : best;
        },
        { name: '—', count: 0 }
      ).name,
    },
    {
      label: 'Categories Used',
      value: new Set(docSource.map((d) => d.categoryId)).size,
    },
  ];

  return (
    <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map((stat, i) => {
        const tile = VAULT_TILES[i % VAULT_TILES.length];
        return (
          <div
            key={`vault-dash-stat-${i}`}
            className={cn(
              'sv-icon-card rounded-2xl border p-4',
              'border-white/80'
            )}
            style={{ background: tile.bg }}
          >
            <p className="mb-1 text-[11px] font-800 uppercase tracking-widest text-vault-muted">
              {stat.label}
            </p>
            <p className="text-xl font-800 tabular-nums leading-tight text-vault-text">
              {stat.value}
            </p>
          </div>
        );
      })}
    </div>
  );
}
