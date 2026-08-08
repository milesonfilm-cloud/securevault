'use client';

import React from 'react';
import { FileText } from 'lucide-react';
import type { RenewalItem } from '@/lib/documentExpiry';
import { getCategoryById } from '@/lib/categories';
import { CategoryLucideIcon } from '@/lib/categoryLucideIcons';
import { formatExpirySummary } from '@/lib/documentExpiry';
import type { FamilyMember } from '@/lib/storage';
import { resolveMemberColor } from '@/lib/memberAvatarColors';

function urgencyStyle(daysUntil: number): { label: string } {
  if (daysUntil < 0) return { label: 'text-red-300' };
  if (daysUntil <= 7) return { label: 'text-orange-200' };
  if (daysUntil <= 30) return { label: 'text-amber-200' };
  return { label: 'text-emerald-200' };
}

interface RenewalCardProps {
  item: RenewalItem;
  memberName: string;
  member?: FamilyMember;
  compact?: boolean;
}

export default function RenewalCard({ item, memberName, member, compact }: RenewalCardProps) {
  const cat = getCategoryById(item.categoryId);
  const u = urgencyStyle(item.daysUntil);
  const memberAccent = member ? resolveMemberColor(member.avatarColor).border : undefined;

  if (compact) {
    return (
      <div
        className="flex gap-3 px-4 py-3 hover:bg-vault-elevated/40 transition-colors"
        style={memberAccent ? { borderLeft: `4px solid ${memberAccent}` } : undefined}
      >
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border"
          style={{
            backgroundColor: cat ? `${cat.color}22` : 'var(--vault-c-elevated)',
            color: cat?.color ?? 'var(--vault-c-warm)',
          }}
        >
          {cat ? <CategoryLucideIcon name={cat.icon} size={18} /> : <FileText size={18} />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-vault-text">{item.title}</p>
          <p className="mt-0.5 truncate text-xs text-vault-muted">
            {memberName} · {cat?.label ?? item.categoryId}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className={`text-xs font-700 ${u.label}`}>
            {formatExpirySummary(item.daysUntil, item.expiryDay)}
          </p>
          <p className="mt-0.5 text-[10px] text-vault-faint">
            {item.expiryDay.toLocaleDateString(undefined, {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-2xl border border-border bg-vault-panel overflow-hidden shadow-vault ${
        item.daysUntil < 0 ? 'ring-1 ring-red-500/35' : ''
      }`}
      style={memberAccent ? { borderLeft: `4px solid ${memberAccent}` } : undefined}
    >
      <div className="flex gap-3 p-4">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border"
          style={{
            backgroundColor: cat ? `${cat.color}22` : 'var(--vault-c-elevated)',
            color: cat?.color ?? 'var(--vault-c-warm)',
          }}
        >
          {cat ? <CategoryLucideIcon name={cat.icon} size={18} /> : <FileText size={18} />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-bold leading-snug text-vault-text">{item.title}</p>
          <p className="mt-0.5 truncate text-xs text-vault-muted">
            {memberName} · {cat?.label ?? item.categoryId}
          </p>
          <p className={`mt-2 text-xs font-700 ${u.label}`}>
            {formatExpirySummary(item.daysUntil, item.expiryDay)}
          </p>
        </div>
      </div>
    </div>
  );
}
