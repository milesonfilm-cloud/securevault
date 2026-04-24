'use client';

import React from 'react';
import { BADGE_DEFINITIONS, type Badge } from '@/lib/gamification/badges';
import { cn } from '@/lib/utils';

interface BadgeDisplayProps {
  /** Earned badge ids (e.g. from `vaultData.streakData.badges`). */
  earnedIds: Set<string> | string[];
  /** Optional highlight for newly unlocked (pulse). */
  highlightIds?: Set<string>;
  className?: string;
}

function toSet(ids: Set<string> | string[]): Set<string> {
  return ids instanceof Set ? ids : new Set(ids);
}

export default function BadgeDisplay({ earnedIds, highlightIds, className }: BadgeDisplayProps) {
  const earned = toSet(earnedIds);

  return (
    <div
      className={cn(
        'grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5',
        className
      )}
    >
      {BADGE_DEFINITIONS.map((def) => {
        const unlocked = earned.has(def.id);
        const pulse = highlightIds?.has(def.id);
        const b: Badge = { id: def.id, name: def.name, description: def.description, icon: def.icon };
        return (
          <div
            key={def.id}
            title={b.description}
            className={cn(
              'rounded-2xl border p-4 text-center transition-all duration-300',
              unlocked
                ? 'border-vault-warm/45 bg-gradient-to-b from-vault-warm/15 to-vault-panel shadow-[0_0_24px_rgba(250,204,21,0.12)]'
                : 'border-border bg-vault-elevated/40 opacity-75',
              pulse && 'animate-pulse ring-2 ring-vault-warm/50'
            )}
          >
            <div
              className={cn(
                'mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-2xl text-3xl',
                unlocked ? 'bg-vault-warm/20' : 'bg-vault-elevated grayscale blur-[0.5px]'
              )}
            >
              <span className={cn(!unlocked && 'opacity-40')}>{b.icon}</span>
            </div>
            <p className={cn('text-xs font-800 leading-tight', unlocked ? 'text-vault-text' : 'text-vault-muted')}>
              {b.name}
            </p>
            <p className="mt-1 line-clamp-2 text-[10px] leading-snug text-vault-muted">{b.description}</p>
            {!unlocked ? (
              <p className="mt-2 text-[9px] font-700 uppercase tracking-wider text-vault-faint">Locked</p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
