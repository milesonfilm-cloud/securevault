'use client';

import React, { useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useVaultData } from '@/context/VaultDataContext';
import {
  calculateFamilyScore,
  calculateMemberScore,
  criticalCategoriesForMember,
} from '@/lib/gamification/completenessScore';
import { getCategoryById } from '@/lib/categories';
import CompletenessRing from '@/components/gamification/CompletenessRing';
import BadgeDisplay from '@/components/gamification/BadgeDisplay';
import StreakWidget from '@/components/gamification/StreakWidget';
import OnboardingChecklist, {
  markProgressChecklistVisited,
} from '@/components/gamification/OnboardingChecklist';
import { getStreakData } from '@/lib/gamification/streaks';
import VaultScoreWidget from '@/components/dashboard/VaultScoreWidget';
import VaultHealthCard from '@/components/dashboard/VaultHealthCard';
import VaultPageHeading from '@/components/ui/VaultPageHeading';

export default function ProgressContent() {
  const { vaultData, loading } = useVaultData();
  const tp = useTranslations('progressPage');
  const tm = useTranslations('memberCard');

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
      <div className="vault-page mx-auto animate-pulse space-y-6">
        <div className="mx-auto h-10 w-64 rounded-xl bg-vault-elevated" />
        <div className="h-40 rounded-2xl bg-vault-panel" />
      </div>
    );
  }

  return (
    <div className="vault-page">
      <VaultPageHeading className="mb-6 sm:mb-8" title={tp('title')} description={tp('description')} />

      <div className="mb-5 grid gap-4 sm:mb-8 lg:grid-cols-2">
        <VaultScoreWidget vaultData={vaultData} />
        <OnboardingChecklist vaultData={vaultData} />
      </div>

      <div className="mb-6 sm:mb-10">
        <VaultHealthCard vaultData={vaultData} loading={loading} />
      </div>

      <div className="neo-card mb-5 grid gap-4 rounded-2xl p-4 sm:mb-8 sm:grid-cols-[auto_1fr] sm:items-center sm:p-5">
        <div>
          <p className="text-[10px] font-800 uppercase tracking-wider text-vault-muted">
            {tp('familyCompleteness')}
          </p>
          <p className="mt-1 text-[2.25rem] font-800 tabular-nums leading-none text-vault-text sm:text-5xl">{familyScore}%</p>
        </div>
        <StreakWidget className="w-full sm:max-w-none" />
      </div>

      <section className="mb-10">
        <h2 className="mb-4 text-sm font-800 uppercase tracking-wider text-vault-muted">
          {tp('perMember')}
        </h2>
        {memberRows.length === 0 ? (
          <p className="text-sm text-vault-muted">{tp('addMembersForRings')}</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {memberRows.map(({ member, score, missing }) => (
              <div
                key={member.id}
                className="flex items-start gap-4 rounded-2xl border border-border bg-vault-elevated/30 p-4"
              >
                <CompletenessRing member={member} percent={score} size={88} stroke={7} />
                <div className="min-w-0 flex-1 pt-1">
                  <p className="truncate text-sm font-700 text-vault-text">{member.name}</p>
                  <p className="mt-0.5 text-[11px] text-vault-faint">
                    {tp('criticalCategories', {
                      count: criticalCategoriesForMember(member).length,
                    })}
                  </p>
                  {missing.length > 0 ? (
                    <ul className="mt-2 space-y-1 text-[11px] text-vault-muted">
                      {missing.map((catId) => (
                        <li key={`${member.id}-${catId}`} className="flex items-center gap-2">
                          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-vault-coral" />
                          {tm('missingCategory', {
                            label: getCategoryById(catId)?.shortLabel ?? catId,
                          })}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-2 text-xs font-600 text-vault-warm">{tp('complete')}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mb-10">
        <h2 className="mb-4 text-sm font-800 uppercase tracking-wider text-vault-muted">{tp('badges')}</h2>
        <BadgeDisplay earnedIds={earned} />
      </section>

      <section>
        <h2 className="mb-4 text-sm font-800 uppercase tracking-wider text-vault-muted">
          {tp('streakStats')}
        </h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-vault-elevated/40 px-4 py-3">
            <p className="text-[10px] font-700 uppercase text-vault-faint">{tp('streakCurrent')}</p>
            <p className="text-2xl font-800 tabular-nums text-vault-text">{streak.currentStreak}</p>
          </div>
          <div className="rounded-xl border border-border bg-vault-elevated/40 px-4 py-3">
            <p className="text-[10px] font-700 uppercase text-vault-faint">{tp('streakLongest')}</p>
            <p className="text-2xl font-800 tabular-nums text-vault-text">{streak.longestStreak}</p>
          </div>
          <div className="rounded-xl border border-border bg-vault-elevated/40 px-4 py-3">
            <p className="text-[10px] font-700 uppercase text-vault-faint">{tp('streakDaysUsed')}</p>
            <p className="text-2xl font-800 tabular-nums text-vault-text">{streak.totalDaysUsed}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
