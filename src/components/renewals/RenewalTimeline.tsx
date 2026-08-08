'use client';

import React, { useMemo } from 'react';
import type { RenewalItem } from '@/lib/documentExpiry';
import type { FamilyMember } from '@/lib/storage';
import { CheckCircle2 } from 'lucide-react';
import RenewalCard from './RenewalCard';

type GroupKey = 'expired' | 'd7' | 'd30' | 'upcoming' | 'clear';

function groupItem(item: RenewalItem): GroupKey {
  if (item.daysUntil < 0) return 'expired';
  if (item.daysUntil <= 7) return 'd7';
  if (item.daysUntil <= 30) return 'd30';
  return 'upcoming';
}

const GROUP_LABEL: Record<Exclude<GroupKey, 'clear'>, string> = {
  expired: 'Expired',
  d7: 'Expiring this week',
  d30: 'Expiring this month',
  upcoming: 'Expiring in 90 days',
};

const GROUP_EMPTY: Record<Exclude<GroupKey, 'clear'>, string> = {
  expired: 'No expired documents',
  d7: 'Nothing due this week',
  d30: 'Nothing due this month',
  upcoming: 'Nothing in the 30–90 day window',
};

interface RenewalTimelineProps {
  items: RenewalItem[];
  members: FamilyMember[];
}

export default function RenewalTimeline({ items, members }: RenewalTimelineProps) {
  const names = useMemo(() => new Map(members.map((m) => [m.id, m.name])), [members]);
  const memberById = useMemo(() => new Map(members.map((m) => [m.id, m])), [members]);

  const grouped = useMemo(() => {
    const g: Record<Exclude<GroupKey, 'clear'>, RenewalItem[]> = {
      expired: [],
      d7: [],
      d30: [],
      upcoming: [],
    };
    for (const item of items) {
      g[groupItem(item)].push(item);
    }
    return g;
  }, [items]);

  const order: Exclude<GroupKey, 'clear'>[] = ['expired', 'd7', 'd30', 'upcoming'];

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-vault-panel p-10 text-center">
        <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-emerald-400" aria-hidden />
        <p className="text-sm font-600 text-vault-text">All documents are current — nothing to renew</p>
        <p className="mt-2 text-xs text-vault-muted">
          Add expiry dates to insurance, vehicle, or ID documents to track renewals here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {order.map((key) => {
        const list = grouped[key];
        return (
          <section key={key}>
            <h2 className="mb-3 text-sm font-700 text-vault-text">
              {GROUP_LABEL[key]}{' '}
              <span className="font-normal text-vault-muted">({list.length})</span>
            </h2>
            {list.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border bg-vault-elevated/30 px-4 py-3 text-xs text-vault-muted">
                {GROUP_EMPTY[key]}
              </p>
            ) : (
              <div className="divide-y divide-border rounded-2xl border border-border bg-vault-panel overflow-hidden">
                {list.map((item) => (
                  <RenewalCard
                    key={`${item.docId}-${item.fieldKey}`}
                    item={item}
                    memberName={names.get(item.memberId) ?? 'Member'}
                    member={memberById.get(item.memberId)}
                    compact
                  />
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
