'use client';

import React from 'react';
import { CreditCard, Landmark, Wallet, Building2, Car, Users, KeyRound } from 'lucide-react';
import { CATEGORIES } from '@/lib/categories';
import { Document } from '@/lib/storage';
import { useTheme } from '@/context/ThemeContext';
import { hexAlpha } from '@/lib/memberAvatarColors';

const ICON_MAP: Record<string, React.ReactNode> = {
  CreditCard: <CreditCard size={20} />,
  Landmark: <Landmark size={20} />,
  Wallet: <Wallet size={20} />,
  Building2: <Building2 size={20} />,
  Car: <Car size={20} />,
  Users: <Users size={20} />,
  KeyRound: <KeyRound size={20} />,
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
  const { theme } = useTheme();
  const isVault = theme === 'vault';

  if (isVault) {
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
                  : 'bg-vault-panel border-[rgba(255,255,255,0.07)] hover:bg-vault-elevated'
              }`}
            >
              <div
                className="w-9 h-9 rounded-[10px] flex items-center justify-center mb-0 border border-[rgba(255,255,255,0.06)]"
                style={{
                  backgroundColor: isActive ? 'rgba(49,44,81,0.2)' : hexAlpha(cat.color, 0.14),
                }}
              >
                <span
                  className="[&_svg]:stroke-[1.75]"
                  style={{ color: isActive ? '#312C51' : cat.color }}
                >
                  {ICON_MAP[cat.icon]}
                </span>
              </div>
              <div
                className={`text-[28px] font-bold tabular-nums tracking-tight leading-none mt-3 ${
                  isActive ? 'text-vault-ink' : 'text-white'
                }`}
              >
                {count}
              </div>
              <div
                className={`text-[10px] font-bold uppercase tracking-[2px] mt-1 ${
                  isActive ? 'text-vault-ink' : 'text-white/78'
                }`}
              >
                {cat.shortLabel}
              </div>
            </button>
          );
        })}
      </div>
    );
  }

  return null;
}
