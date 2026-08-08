'use client';

import React, { useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useVaultData } from '@/context/VaultDataContext';
import {
  calculateMemberScore,
  criticalCategoriesForMember,
} from '@/lib/gamification/completenessScore';
import { getCategoryById } from '@/lib/categories';
import CompletenessRing from '@/components/gamification/CompletenessRing';
import BadgeDisplay from '@/components/gamification/BadgeDisplay';
import OnboardingChecklist, {
  markProgressChecklistVisited,
} from '@/components/gamification/OnboardingChecklist';
import VaultHealthCard from '@/components/dashboard/VaultHealthCard';
import VaultPageHeading from '@/components/ui/VaultPageHeading';
import type { VaultData } from '@/lib/storage';

function formatVaultAge(members: VaultData['members'], documents: VaultData['documents']): string {
  const stamps = [
    ...members.map((m) => m.createdAt),
    ...documents.map((d) => d.updatedAt ?? d.createdAt),
  ].filter(Boolean);
  if (stamps.length === 0) return 'Not started yet';
  const earliest = Math.min(...stamps.map((s) => new Date(s).getTime()));
  const months = Math.max(
    1,
    Math.round((Date.now() - earliest) / (1000 * 60 * 60 * 24 * 30))
  );
  if (months < 12) return `Vault age: ${months} month${months === 1 ? '' : 's'}`;
  const years = Math.floor(months / 12);
  return `Vault age: ${years} year${years === 1 ? '' : 's'}`;
}

function formatLastUpdated(documents: VaultData['documents']): string {
  if (documents.length === 0) return 'No documents yet';
  const latest = Math.max(
    ...documents.map((d) => new Date(d.updatedAt ?? d.createdAt).getTime())
  );
  const days = Math.round((Date.now() - latest) / 86400000);
  if (days === 0) return 'Last updated: today';
  if (days === 1) return 'Last updated: yesterday';
  if (days < 30) return `Last updated: ${days} days ago`;
  const months = Math.round(days / 30);
  return `Last updated: ${months} month${months === 1 ? '' : 's'} ago`;
}

export default function ProgressContent() {
  const { vaultData, loading } = useVaultData();
  const tp = useTranslations('progressPage');
  const tm = useTranslations('memberCard');

  useEffect(() => {
    markProgressChecklistVisited();
  }, []);

  const memberRows = useMemo(() => {
    return vaultData.members.map((m) => {
      const docs = vaultData.documents.filter((d) => d.memberId === m.id);
      return { member: m, ...calculateMemberScore(m, docs) };
    });
  }, [vaultData.members, vaultData.documents]);

  const earned = useMemo(() => new Set(vaultData.streakData.badges), [vaultData.streakData.badges]);

  const vaultAge = useMemo(
    () => formatVaultAge(vaultData.members, vaultData.documents),
    [vaultData.members, vaultData.documents]
  );
  const lastUpdated = useMemo(
    () => formatLastUpdated(vaultData.documents),
    [vaultData.documents]
  );

  if (loading) {
    return (
      <div className="mx-auto max-w-screen-xl animate-pulse space-y-6 p-4 lg:p-6">
        <div className="mx-auto h-10 w-64 rounded-xl bg-vault-elevated" />
        <div className="h-40 rounded-2xl bg-vault-panel" />
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-full max-w-screen-xl bg-vault-bg p-4 lg:p-6">
      <VaultPageHeading
        className="mb-8"
        eyebrow={tp('eyebrow')}
        title={tp('title')}
        description={tp('description')}
      />

      <div className="mb-8 grid gap-4 lg:grid-cols-2">
        <VaultHealthCard vaultData={vaultData} loading={loading} />
        <OnboardingChecklist vaultData={vaultData} />
      </div>

      <div className="mb-10 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-border bg-vault-panel px-4 py-3 shadow-vault">
          <p className="text-xs font-medium text-vault-muted">{vaultAge}</p>
        </div>
        <div className="rounded-2xl border border-border bg-vault-panel px-4 py-3 shadow-vault">
          <p className="text-xs font-medium text-vault-muted">{lastUpdated}</p>
        </div>
      </div>

      <section className="mb-10">
        <h2 className="mb-4 text-sm font-700 text-vault-text">{tp('perMember')}</h2>
        {memberRows.length === 0 ? (
          <p className="text-sm text-vault-muted">{tp('addMembersForRings')}</p>
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
                  {tp('criticalCategories', {
                    count: criticalCategoriesForMember(member).length,
                  })}
                </p>
                {missing.length > 0 ? (
                  <ul className="mt-3 w-full space-y-1 text-left text-[11px] text-vault-muted">
                    {missing.map((catId) => (
                      <li key={`${member.id}-${catId}`} className="flex items-center gap-2">
                        <span
                          className="h-1.5 w-1.5 shrink-0 rounded-full"
                          style={{ backgroundColor: member.avatarColor }}
                        />
                        {tm('missingCategory', {
                          label: getCategoryById(catId)?.label ?? catId,
                        })}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-center text-xs font-600 text-vault-warm">{tp('complete')}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-sm font-700 text-vault-text">{tp('badges')}</h2>
        <BadgeDisplay earnedIds={earned} />
      </section>
    </div>
  );
}
