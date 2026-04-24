'use client';

import React, { useEffect, useState } from 'react';
import { getStreakData } from '@/lib/gamification/streaks';
import { cn } from '@/lib/utils';

interface StreakWidgetProps {
  className?: string;
  compact?: boolean;
}

export default function StreakWidget({ className, compact = false }: StreakWidgetProps) {
  const [streak, setStreak] = useState(() => getStreakData());

  useEffect(() => {
    setStreak(getStreakData());
  }, []);

  return (
    <div
      className={cn(
        'rounded-2xl border border-[color:var(--color-border)] bg-vault-elevated/40 px-4 py-3',
        className
      )}
    >
      <div className="flex items-center gap-3">
        <span
          className="motion-safe:animate-pulse text-3xl leading-none"
          aria-hidden
        >
          🔥
        </span>
        <div>
          <p className={cn('font-800 tabular-nums text-vault-text', compact ? 'text-2xl' : 'text-3xl')}>
            {streak.currentStreak}
          </p>
          <p className="text-xs font-600 text-vault-muted">day streak</p>
        </div>
      </div>
      {!compact ? (
        <p className="mt-2 text-[11px] text-vault-faint">
          Longest: {streak.longestStreak} · Open days logged: {streak.totalDaysUsed}
        </p>
      ) : null}
    </div>
  );
}
