'use client';

import React from 'react';
import { CreditCard, Car, Wallet, Building2, KeyRound, FileText } from 'lucide-react';
import type { RenewalItem } from '@/lib/documentExpiry';
import { getCategoryById } from '@/lib/categories';
import { formatExpirySummary } from '@/lib/documentExpiry';

const ICON_MAP: Record<string, React.ReactNode> = {
  CreditCard: <CreditCard size={18} />,
  Car: <Car size={18} />,
  Landmark: <Building2 size={18} />,
  Wallet: <Wallet size={18} />,
  Building2: <Building2 size={18} />,
  KeyRound: <KeyRound size={18} />,
};

function urgencyStyle(daysUntil: number): { bar: string; label: string } {
  if (daysUntil < 0) return { bar: 'bg-red-500', label: 'text-red-300' };
  if (daysUntil <= 7) return { bar: 'bg-orange-500', label: 'text-orange-200' };
  if (daysUntil <= 30) return { bar: 'bg-amber-400', label: 'text-amber-200' };
  return { bar: 'bg-emerald-500', label: 'text-emerald-200' };
}

interface RenewalCardProps {
  item: RenewalItem;
  memberName: string;
}

export default function RenewalCard({ item, memberName }: RenewalCardProps) {
  const cat = getCategoryById(item.categoryId);
  const u = urgencyStyle(item.daysUntil);

  return (
    <div
      className={`sv-icon-card overflow-hidden rounded-2xl ${
        item.daysUntil < 0 ? 'ring-1 ring-red-500/35' : ''
      }`}
    >
      <div className={`h-1 w-full ${u.bar}`} />
      <div className="p-4 flex gap-3">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border border-border"
          style={{
            backgroundColor: cat ? `${cat.color}22` : 'var(--vault-c-elevated)',
            color: cat?.color ?? 'var(--vault-c-warm)',
          }}
        >
          {cat ? (ICON_MAP[cat.icon] ?? <FileText size={18} />) : <FileText size={18} />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-bold text-vault-text leading-snug truncate">{item.title}</p>
          <p className="text-xs text-vault-muted mt-0.5 truncate">
            {memberName} · {cat?.shortLabel ?? item.categoryId}
          </p>
          <p className={`text-xs font-700 mt-2 ${u.label}`}>{formatExpirySummary(item.daysUntil)}</p>
          <p className="text-[11px] text-vault-faint mt-0.5">
            {item.fieldLabel}:{' '}
            {item.expiryDay.toLocaleDateString(undefined, {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
          </p>
        </div>
      </div>
    </div>
  );
}
