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

/** Reference palette: lime, mint, coral, cyan — cycle for category grid */
const NEON_TILE_BG = ['#DFFF4F', '#A8FF78', '#FF7F50', '#40E0D0'] as const;

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
  const isNeon = theme === 'neon';
  const isPastel = theme === 'pastel';

  if (isNeon) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {CATEGORIES.map((cat, index) => {
          const count = documents.filter((d) => d.categoryId === cat.id).length;
          const isActive = activeCategory === cat.id;
          const bg = NEON_TILE_BG[index % NEON_TILE_BG.length];
          return (
            <button
              key={`cat-card-${cat.id}`}
              type="button"
              onClick={() => onSelectCategory(isActive ? null : cat.id)}
              className={`neon-folder-tile text-left transition-transform duration-200 active:scale-[0.98] ${
                isActive ? 'ring-2 ring-black/25 ring-offset-2 ring-offset-black scale-[1.02]' : ''
              }`}
              style={{ background: bg, color: '#0a0a0a' }}
            >
              <div className="neon-folder-tile-inner pt-1 px-4 pb-4">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                    style={{
                      background: 'rgba(0,0,0,0.12)',
                      color: '#0a0a0a',
                    }}
                  >
                    {ICON_MAP[cat.icon]}
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-800 tabular-nums tracking-tight leading-none mb-1">
                  {count}
                </div>
                <div className="text-xs font-700 uppercase tracking-wide opacity-90">{cat.shortLabel}</div>
              </div>
            </button>
          );
        })}
      </div>
    );
  }

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
              <div className="text-[11px] font-700 uppercase tracking-wide" style={{ color: tile.accent }}>
                {cat.shortLabel}
              </div>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
      {CATEGORIES.map((cat) => {
        const count = documents.filter((d) => d.categoryId === cat.id).length;
        const isActive = activeCategory === cat.id;
        return (
          <button
            key={`cat-card-${cat.id}`}
            onClick={() => onSelectCategory(isActive ? null : cat.id)}
            className={`rounded-2xl p-4 text-left transition-all duration-200 card-hover ${
              isActive ? 'shadow-lg' : ''
            }`}
            style={
              isActive
                ? {
                    background: `linear-gradient(135deg, ${cat.color}18 0%, ${cat.color}08 100%)`,
                    border: `1.5px solid ${cat.color}40`,
                    boxShadow: `0 4px 20px ${cat.color}20`,
                  }
                : {
                    background: 'rgba(255,255,255,0.7)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.9)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  }
            }
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center mb-3 shadow-sm"
              style={{
                background: `linear-gradient(135deg, ${cat.color}25 0%, ${cat.color}12 100%)`,
                color: cat.color,
                border: `1px solid ${cat.color}20`,
              }}
            >
              {ICON_MAP[cat.icon]}
            </div>
            <div
              className="text-2xl font-800 tabular-nums mb-0.5 tracking-tight"
              style={{ color: cat.color }}
            >
              {count}
            </div>
            <div className="text-xs font-600 text-slate-500 leading-tight">{cat.shortLabel}</div>
          </button>
        );
      })}
    </div>
  );
}
