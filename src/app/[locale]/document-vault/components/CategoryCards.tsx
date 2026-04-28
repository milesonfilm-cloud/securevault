'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import {
  CreditCard,
  Landmark,
  Wallet,
  Building2,
  Car,
  Users,
  KeyRound,
  BookOpen,
  IdCard,
  Shield,
  Globe,
  BriefcaseMedical,
  ScrollText,
  FileText,
  Wrench,
  User,
  RefreshCw,
  BadgeCheck,
  File,
} from 'lucide-react';
import { CATEGORIES } from '@/lib/categories';
import { Document } from '@/lib/storage';
import { hexAlpha } from '@/lib/memberAvatarColors';

const ICON_MAP: Record<string, React.ReactNode> = {
  CreditCard: <CreditCard size={20} />,
  Landmark: <Landmark size={20} />,
  Wallet: <Wallet size={20} />,
  Building2: <Building2 size={20} />,
  Car: <Car size={20} />,
  Users: <Users size={20} />,
  KeyRound: <KeyRound size={20} />,
  BookOpen: <BookOpen size={20} />,
  IdCard: <IdCard size={20} />,
  Shield: <Shield size={20} />,
  Globe: <Globe size={20} />,
  BriefcaseMedical: <BriefcaseMedical size={20} />,
  ScrollText: <ScrollText size={20} />,
  FileText: <FileText size={20} />,
  Wrench: <Wrench size={20} />,
  User: <User size={20} />,
  RefreshCw: <RefreshCw size={20} />,
  BadgeCheck: <BadgeCheck size={20} />,
  File: <File size={20} />,
};

interface CategoryCardsProps {
  documents: Document[];
  activeCategory: string | null;
  onSelectCategory: (id: string | null) => void;
}

export default function CategoryCards({
  documents,
  activeCategory,
  onSelectCategory,
}: CategoryCardsProps) {
  const t = useTranslations('categories');

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
      {CATEGORIES.map((cat) => {
        const count = documents.filter((d) => d.categoryId === cat.id).length;
        const isActive = activeCategory === cat.id;
        return (
          <button
            key={`cat-card-${cat.id}`}
            type="button"
            onClick={() => onSelectCategory(isActive ? null : cat.id)}
            className={`text-left transition-all duration-200 active:scale-[0.98] rounded-[20px] p-[18px] border cursor-pointer shadow-vault ${
              isActive
                ? 'bg-vault-warm border-transparent scale-[1.02]'
                : 'bg-vault-panel border-[color:var(--color-border)] hover:bg-vault-elevated'
            }`}
          >
            <div
              className="w-9 h-9 rounded-[10px] flex items-center justify-center mb-0 border border-[color:var(--color-border)]"
              style={{
                backgroundColor: isActive
                  ? 'color-mix(in srgb, var(--vault-c-ink) 22%, transparent)'
                  : hexAlpha(cat.color, 0.14),
              }}
            >
              <span
                className="[&_svg]:stroke-[1.75]"
                style={{ color: isActive ? 'var(--vault-c-ink)' : cat.color }}
              >
                {ICON_MAP[cat.icon]}
              </span>
            </div>
            <div
              className={`text-[28px] font-bold tabular-nums tracking-tight leading-none mt-3 ${
                isActive ? 'text-vault-ink' : 'text-vault-text'
              }`}
            >
              {count}
            </div>
            <div
              className={`text-[10px] font-bold uppercase tracking-[2px] mt-1 ${
                isActive ? 'text-vault-ink' : 'text-vault-muted'
              }`}
            >
              {t(`${cat.id}.shortLabel` as Parameters<typeof t>[0])}
            </div>
          </button>
        );
      })}
    </div>
  );
}
