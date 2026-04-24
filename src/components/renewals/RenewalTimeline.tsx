'use client';

import React, { useMemo } from 'react';
import type { RenewalItem } from '@/lib/documentExpiry';
import type { FamilyMember } from '@/lib/storage';
import RenewalCard from './RenewalCard';

type GroupKey = 'expired' | 'd7' | 'd30' | 'upcoming';

function groupItem(item: RenewalItem): GroupKey {
  if (item.daysUntil < 0) return 'expired';
  if (item.daysUntil <= 7) return 'd7';
  if (item.daysUntil <= 30) return 'd30';
  return 'upcoming';
}

const GROUP_LABEL: Record<GroupKey, string> = {
  expired: 'Expired',
  d7: 'Expiring in 7 days',
  d30: 'Expiring in 30 days',
  upcoming: 'Upcoming (30–90 days)',
};

interface RenewalTimelineProps {
  items: RenewalItem[];
  members: FamilyMember[];
}

export default function RenewalTimeline({ items, members }: RenewalTimelineProps) {
  const names = useMemo(() => new Map(members.map((m) => [m.id, m.name])), [members]);

  const grouped = useMemo(() => {
    const g: Record<GroupKey, RenewalItem[]> = {
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

  const order: GroupKey[] = ['expired', 'd7', 'd30', 'upcoming'];

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-vault-panel p-10 text-center">
        <p className="text-sm font-600 text-vault-text">No renewal dates in the next 90 days</p>
        <p className="text-xs text-vault-muted mt-2">
          Add expiry fields to insurance, vehicle, or ID documents to see them here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {order.map((key) => {
        const list = grouped[key];
        if (list.length === 0) return null;
        return (
          <section key={key}>
            <h2 className="text-[11px] font-800 uppercase tracking-[0.2em] text-vault-faint mb-4">
              {GROUP_LABEL[key]}{' '}
              <span className="text-vault-muted font-700 normal-case tracking-normal">
                ({list.length})
              </span>
            </h2>
            <div className="space-y-3">
              {list.map((item) => (
                <RenewalCard
                  key={`${item.docId}-${item.fieldKey}`}
                  item={item}
                  memberName={names.get(item.memberId) ?? 'Member'}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
