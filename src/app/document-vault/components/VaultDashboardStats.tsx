'use client';

import React from 'react';
import { VaultData } from '@/lib/storage';
import { getPastelLedgerTile, type LedgerTileTheme } from '@/lib/pastelLedgerPalette';
import { useTheme } from '@/context/ThemeContext';

export interface VaultDashboardStatsProps {
  vaultData: VaultData;
}

/**
 * Overview tiles: total members, documents, member with most docs, category breadth.
 * Lives on the Document Vault page (moved from Family Members).
 */
export default function VaultDashboardStats({ vaultData }: VaultDashboardStatsProps) {
  const { theme } = useTheme();
  const ledgerTheme: LedgerTileTheme =
    theme === 'pastel'
      ? 'pastel'
      : theme === 'wellness'
        ? 'wellness'
        : theme === 'voyager'
          ? 'voyager'
          : theme === 'neon'
            ? 'neon'
            : 'vault';

  const stats = [
    { label: 'Total Members', value: vaultData.members.length },
    { label: 'Total Documents', value: vaultData.documents.length },
    {
      label: 'Most Documents',
      value: vaultData.members.reduce(
        (best, m) => {
          const count = vaultData.documents.filter((d) => d.memberId === m.id).length;
          return count > (best.count || 0) ? { name: m.name.split(' ')[0], count } : best;
        },
        { name: '—', count: 0 }
      ).name,
    },
    {
      label: 'Categories Used',
      value: new Set(vaultData.documents.map((d) => d.categoryId)).size,
    },
  ];

  return (
    <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map((stat, i) => {
        const tile = getPastelLedgerTile(i, ledgerTheme);
        return (
          <div
            key={`vault-dash-stat-${i}`}
            className="rounded-2xl border border-[color:var(--color-border)] p-4 shadow-vault"
            style={{ background: tile.bg }}
          >
            <p className="mb-1 text-[11px] font-700 uppercase tracking-widest text-vault-muted">
              {stat.label}
            </p>
            <p className="text-xl font-800 tabular-nums text-vault-text">{stat.value}</p>
          </div>
        );
      })}
    </div>
  );
}
