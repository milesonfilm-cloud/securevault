'use client';

import React, { useState } from 'react';
import { ArrowLeft, MoreHorizontal, Play, Pause } from 'lucide-react';
import WellnessBottomNav from './WellnessBottomNav';
import { SleepNightIllustration, ListThumbPlaceholder } from './WellnessIllustrations';

const CHIPS = ['Tails', 'Nature', 'Balades'] as const;

const LIST = [
  { title: 'Sleeping playlist', subtitle: 'Original songs', active: false },
  { title: 'Sleeping playlist', subtitle: 'Original songs', active: false },
  { title: 'Sleeping playlist', subtitle: 'Original songs', active: false },
  { title: 'Sleeping playlist', subtitle: 'Original songs', active: true },
];

export default function SleepScreen() {
  const [chip, setChip] = useState<(typeof CHIPS)[number]>('Tails');

  return (
    <div className="relative h-[812px] w-[375px] shrink-0 overflow-hidden rounded-[32px] bg-wellness-bg shadow-[0_8px_40px_rgba(0,0,0,0.1)]">
      <div className="h-full overflow-y-auto pb-28 pl-4 pr-4 pt-4">
        <header className="mb-4 flex items-center justify-between">
          <button type="button" className="p-1 text-wellness-ink" aria-label="Back">
            <ArrowLeft size={22} strokeWidth={2} />
          </button>
          <h1 className="font-wellness-sans text-[16px] font-semibold text-wellness-ink">Sleep</h1>
          <button type="button" className="p-1 text-wellness-ink" aria-label="Menu">
            <MoreHorizontal size={22} strokeWidth={2} />
          </button>
        </header>

        <div className="mb-5 flex h-[200px] items-center justify-center overflow-hidden rounded-[20px] bg-wellness-teal shadow-wellness-card">
          <SleepNightIllustration className="h-[170px] w-[200px]" />
        </div>

        <div className="mb-5 flex flex-wrap gap-2">
          {CHIPS.map((c) => {
            const isActive = chip === c;
            return (
              <button
                key={c}
                type="button"
                onClick={() => setChip(c)}
                className={`rounded-full px-[18px] py-2 font-wellness-sans text-[13px] font-medium transition-colors ${
                  isActive
                    ? 'bg-wellness-teal text-white'
                    : 'border border-[#E0E0E0] bg-transparent text-wellness-ink'
                }`}
              >
                {c}
              </button>
            );
          })}
        </div>

        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="font-wellness-sans text-[15px] font-semibold text-wellness-ink">
            Mood offers
          </h2>
          <button
            type="button"
            className="font-wellness-sans text-[12px] font-medium text-wellness-coral"
          >
            See more
          </button>
        </div>

        <ul className="space-y-3">
          {LIST.map((row, i) => (
            <li
              key={i}
              className="flex items-center gap-3 rounded-[20px] bg-white p-3 shadow-wellness-card"
            >
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl">
                <ListThumbPlaceholder />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-wellness-sans text-[14px] font-bold text-wellness-ink">
                  {row.title}
                </p>
                <p className="font-wellness-sans text-[11px] text-wellness-muted">{row.subtitle}</p>
              </div>
              {row.active ? (
                <button
                  type="button"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-wellness-teal text-white shadow-sm"
                  aria-label="Pause"
                >
                  <Pause size={18} fill="white" strokeWidth={0} />
                </button>
              ) : (
                <button type="button" className="shrink-0 p-2 text-wellness-ink" aria-label="Play">
                  <Play size={20} className="fill-wellness-ink" strokeWidth={0} />
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>

      <WellnessBottomNav active="home" />
    </div>
  );
}
