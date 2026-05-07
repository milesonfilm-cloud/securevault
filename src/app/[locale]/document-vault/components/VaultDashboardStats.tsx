'use client';

import React from 'react';
import { VaultData } from '@/lib/storage';
import { getPastelLedgerTile } from '@/lib/pastelLedgerPalette';
import { useTheme } from '@/context/ThemeContext';
import { cn } from '@/lib/utils';

export interface VaultDashboardStatsProps {
  vaultData: VaultData;
}

/** Pastel vault tiles follow the selected family member accent (CSS vars from PastelAccentCssSync). */
const VAULT_TILES_PASTEL = [
  { bg: 'var(--pastel-member-ghost1)' },
  { bg: 'var(--pastel-member-ghost2)' },
  { bg: 'var(--pastel-member-avatar-bg)' },
  { bg: '#ffffff' },
] as const;

/**
 * Overview tiles: total members, documents, member with most docs, category breadth.
 * Lives on the Document Vault page (moved from Family Members).
 */
export default function VaultDashboardStats({ vaultData }: VaultDashboardStatsProps) {
  const { theme } = useTheme();
  const docSource = vaultData.documents;
  const pastel = theme === 'pastel';

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
        const tileNeon = getPastelLedgerTile(i);
        const tilePastel = VAULT_TILES_PASTEL[i % VAULT_TILES_PASTEL.length];
        return (
          <div
            key={`vault-dash-stat-${i}`}
            className={cn(
              'rounded-2xl border p-4',
              pastel
                ? 'border-[#212121]/12 shadow-[0_8px_24px_rgba(33,33,33,0.08)]'
                : 'border-[color:var(--color-border)] shadow-vault'
            )}
            style={{
              background: pastel ? tilePastel.bg : tileNeon.bg,
            }}
          >
            <p
              className={cn(
                'mb-1 text-[11px] font-800 uppercase tracking-widest',
                pastel ? 'text-[#212121]/72' : 'text-white/82'
              )}
            >
              {stat.label}
            </p>
            <p
              className={cn(
                'text-xl font-800 tabular-nums leading-tight',
                pastel ? 'text-[#212121]' : 'text-white'
              )}
            >
              {stat.value}
            </p>
          </div>
        );
      })}
    </div>
  );
}
