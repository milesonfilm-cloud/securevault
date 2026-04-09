'use client';

import React from 'react';
import { CreditCard, Landmark, Wallet, Building2, Car, Users, KeyRound } from 'lucide-react';
import { CATEGORIES } from '@/lib/categories';
import { PASTEL_LEDGER_TILES } from '@/lib/pastelLedgerPalette';
import { Document } from '@/lib/storage';
import { useTheme } from '@/context/ThemeContext';

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
  const isPastel = theme === 'pastel';

  if (isPastel) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
        {CATEGORIES.map((cat) => {
          const count = documents.filter((d) => d.categoryId === cat.id).length;
          const isActive = activeCategory === cat.id;
          const idx = CATEGORIES.findIndex((c) => c.id === cat.id);
          const tile = PASTEL_LEDGER_TILES[(idx >= 0 ? idx : 0) % PASTEL_LEDGER_TILES.length];
          return (
            <button
              key={`cat-card-${cat.id}`}
              type="button"
              onClick={() => onSelectCategory(isActive ? null : cat.id)}
              className={`text-left transition-all duration-200 active:scale-[0.98] rounded-[1.35rem] px-4 py-4 border ${
                isActive ? 'ring-2 ring-black/15 ring-offset-2 ring-offset-white scale-[1.02]' : ''
              }`}
              style={{
                background: tile.bg,
                borderColor: isActive ? `${tile.accent}40` : `${tile.accent}18`,
                boxShadow: isActive ? `0 8px 28px ${tile.accent}14` : '0 2px 12px rgba(0,0,0,0.04)',
              }}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center mb-3"
                style={{
                  background: 'rgba(0,0,0,0.07)',
                  color: tile.accent,
                }}
              >
                {ICON_MAP[cat.icon]}
              </div>
              <div
                className="text-2xl sm:text-3xl font-800 tabular-nums tracking-tight leading-none mb-1"
                style={{ color: '#0a0a0a' }}
              >
                {count}
              </div>
              <div
                className="text-[11px] font-700 uppercase tracking-wide"
                style={{ color: tile.accent }}
              >
                {cat.shortLabel}
              </div>
            </button>
          );
        })}
      </div>
    );
  }

  // Single-theme mode (pastel)
  return null;
}
