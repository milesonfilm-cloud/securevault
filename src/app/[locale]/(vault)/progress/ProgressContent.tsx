'use client';

import React, { useEffect, useMemo } from 'react';
import { useVaultData } from '@/context/VaultDataContext';
import { calculateFamilyScore, calculateMemberScore, criticalCategoriesForMember } from '@/lib/gamification/completenessScore';
import { getCategoryById } from '@/lib/categories';
import CompletenessRing from '@/components/gamification/CompletenessRing';
import BadgeDisplay from '@/components/gamification/BadgeDisplay';
import StreakWidget from '@/components/gamification/StreakWidget';
import { markProgressChecklistVisited } from '@/components/gamification/OnboardingChecklist';
import { getStreakData } from '@/lib/gamification/streaks';

export default function ProgressContent() {
  const { vaultData, loading } = useVaultData();

  useEffect(() => {
    markProgressChecklistVisited();
  }, []);

  const streak = getStreakData();

  const familyScore = useMemo(
    () => calculateFamilyScore(vaultData.members, vaultData.documents),
    [vaultData.members, vaultData.documents]
  );

  const memberRows = useMemo(() => {
    return vaultData.members.map((m) => {
      const docs = vaultData.documents.filter((d) => d.memberId === m.id);
      return { member: m, ...calculateMemberScore(m, docs) };
    });
  }, [vaultData.members, vaultData.documents]);

  const earned = useMemo(() => new Set(vaultData.streakData.badges), [vaultData.streakData.badges]);

  if (loading) {
    return (
      <div className="mx-auto max-w-screen-xl animate-pulse space-y-6 p-4 lg:p-6">
        <div className="h-10 w-64 rounded-xl bg-vault-elevated" />
        <div className="h-40 rounded-2xl bg-vault-panel" />
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-full max-w-screen-xl bg-vault-bg p-4 lg:p-6">
      <div className="mb-8">
        <p className="text-xs font-medium text-vault-faint">Gamification</p>
        <h1 className="mt-0.5 text-[32px] font-bold tracking-tight text-vault-text">Progress</h1>
        <p className="mt-2 max-w-xl text-[13px] text-vault-muted">
          Completeness scores use critical document categories per member (adults vs children). Badges unlock as you
          use the vault.
        </p>
      </div>

      <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-[color:var(--color-border)] bg-vault-panel p-5 shadow-vault sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[10px] font-800 uppercase tracking-wider text-vault-muted">Family completeness</p>
          <p className="mt-1 text-5xl font-800 tabular-nums text-vault-text">{familyScore}%</p>
        </div>
        <StreakWidget className="sm:max-w-xs sm:flex-1" />
      </div>

      <section className="mb-10">
        <h2 className="mb-4 text-sm font-800 uppercase tracking-wider text-vault-muted">Per member</h2>
        {memberRows.length === 0 ? (
          <p className="text-sm text-vault-muted">Add family members to see individual rings.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {memberRows.map(({ member, score, missing }) => (
              <div
                key={member.id}
                className="flex flex-col items-center rounded-2xl border border-border bg-vault-elevated/30 p-5"
              >
                <CompletenessRing member={member} percent={score} />
                <p className="mt-2 text-center text-sm font-700 text-vault-text">{member.name}</p>
                <p className="mt-1 text-center text-[11px] text-vault-faint">
                  {criticalCategoriesForMember(member).length} critical categories
                </p>
                {missing.length > 0 ? (
                  <ul className="mt-3 w-full space-y-1 text-left text-[11px] text-vault-muted">
                    {missing.map((catId) => (
                      <li key={`${member.id}-${catId}`} className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-vault-coral" />
                        Missing: {getCategoryById(catId)?.shortLabel ?? catId}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-center text-xs font-600 text-vault-warm">Complete</p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mb-10">
        <h2 className="mb-4 text-sm font-800 uppercase tracking-wider text-vault-muted">Badges</h2>
        <BadgeDisplay earnedIds={earned} />
      </section>

      <section>
        <h2 className="mb-4 text-sm font-800 uppercase tracking-wider text-vault-muted">Streak stats</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-vault-elevated/40 px-4 py-3">
            <p className="text-[10px] font-700 uppercase text-vault-faint">Current</p>
            <p className="text-2xl font-800 tabular-nums text-vault-text">{streak.currentStreak}</p>
          </div>
          <div className="rounded-xl border border-border bg-vault-elevated/40 px-4 py-3">
            <p className="text-[10px] font-700 uppercase text-vault-faint">Longest</p>
            <p className="text-2xl font-800 tabular-nums text-vault-text">{streak.longestStreak}</p>
          </div>
          <div className="rounded-xl border border-border bg-vault-elevated/40 px-4 py-3">
            <p className="text-[10px] font-700 uppercase text-vault-faint">Days used</p>
            <p className="text-2xl font-800 tabular-nums text-vault-text">{streak.totalDaysUsed}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
