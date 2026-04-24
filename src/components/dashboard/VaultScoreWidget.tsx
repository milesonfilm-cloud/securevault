'use client';

import React, { useMemo } from 'react';
import { Link } from '@/i18n/navigation';
import { ChevronRight, Sparkles } from 'lucide-react';
import type { VaultData } from '@/lib/storage';
import { calculateFamilyScore, topMissingCategories } from '@/lib/gamification/completenessScore';
import { getCategoryById } from '@/lib/categories';
import { cn } from '@/lib/utils';

interface VaultScoreWidgetProps {
  vaultData: VaultData;
  className?: string;
}

export default function VaultScoreWidget({ vaultData, className }: VaultScoreWidgetProps) {
  const score = useMemo(
    () => calculateFamilyScore(vaultData.members, vaultData.documents),
    [vaultData.members, vaultData.documents]
  );

  const missingLabels = useMemo(() => {
    const top = topMissingCategories(vaultData.members, vaultData.documents, 2);
    return top
      .map((id) => getCategoryById(id)?.shortLabel ?? id)
      .filter(Boolean);
  }, [vaultData.members, vaultData.documents]);

  return (
    <Link
      href="/progress"
      className={cn(
        'group flex flex-col rounded-2xl border border-[color:var(--color-border)] bg-vault-panel p-4 shadow-vault transition-all hover:border-vault-warm/35 hover:shadow-[0_8px_28px_rgba(0,0,0,0.12)]',
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-vault-warm/15 text-vault-warm">
            <Sparkles size={20} strokeWidth={2} />
          </div>
          <div>
            <p className="text-[10px] font-800 uppercase tracking-wider text-vault-muted">Vault completeness</p>
            <p className="text-2xl font-800 tabular-nums text-vault-text">{score}%</p>
          </div>
        </div>
        <ChevronRight
          size={20}
          className="shrink-0 text-vault-faint transition-transform group-hover:translate-x-0.5 group-hover:text-vault-warm"
        />
      </div>
      {missingLabels.length > 0 ? (
        <p className="mt-3 text-xs leading-snug text-vault-muted">
          <span className="font-700 text-vault-text">Top gaps: </span>
          {missingLabels.join(' · ')}
        </p>
      ) : vaultData.members.length === 0 ? (
        <p className="mt-3 text-xs text-vault-muted">Add members to start your completeness score.</p>
      ) : (
        <p className="mt-3 text-xs font-600 text-vault-warm">All critical categories covered — nice work.</p>
      )}
    </Link>
  );
}
