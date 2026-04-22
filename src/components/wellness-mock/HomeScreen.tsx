'use client';

import React, { useState } from 'react';
import { MoreHorizontal, Sun, Moon, Cloud } from 'lucide-react';
import WellnessBottomNav from './WellnessBottomNav';

const DAYS = [
  { label: 'Mon', n: '12' },
  { label: 'Tue', n: '13' },
  { label: 'Wed', n: '14' },
  { label: 'Thu', n: '15' },
  { label: 'Fri', n: '16' },
  { label: 'Sat', n: '17' },
  { label: 'Sun', n: '18' },
];

export default function HomeScreen() {
  const [selected, setSelected] = useState(2);
  const r = 28;
  const c = 2 * Math.PI * r;
  const dash = 0.64 * c;

  return (
    <div className="relative h-[812px] w-[375px] shrink-0 overflow-hidden rounded-[32px] bg-wellness-bg shadow-[0_8px_40px_rgba(0,0,0,0.1)]">
      <div className="h-full overflow-y-auto pb-28 pl-4 pr-4 pt-5">
        <header className="mb-4 flex items-start justify-between">
          <div>
            <p className="font-wellness-sans text-[12px] text-wellness-muted">Hi, Maks</p>
            <h1 className="font-wellness-serif mt-1 text-[24px] leading-tight text-wellness-ink">
              Have a nice day
            </h1>
          </div>
          <button type="button" className="p-1 text-wellness-ink" aria-label="Menu">
            <MoreHorizontal size={22} strokeWidth={2} />
          </button>
        </header>

        <div className="-mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-1">
          {DAYS.map((d, i) => {
            const isSel = i === selected;
            return (
              <button
                key={d.label}
                type="button"
                onClick={() => setSelected(i)}
                className={`flex min-w-[52px] flex-shrink-0 flex-col items-center rounded-full px-3 py-2 font-wellness-sans transition-colors ${
                  isSel ? 'bg-wellness-teal text-white' : 'bg-transparent text-wellness-ink'
                }`}
              >
                <span className={`text-[15px] font-bold ${isSel ? '' : 'text-wellness-ink'}`}>
                  {d.n}
                </span>
                <span className={`text-[11px] ${isSel ? 'text-white/90' : 'text-wellness-muted'}`}>
                  {d.label}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="font-wellness-sans text-[15px] font-semibold text-wellness-ink">
            Sleep Dashboard
          </h2>
          <button
            type="button"
            className="font-wellness-sans text-[12px] font-medium text-wellness-coral"
          >
            See more
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div
            className="rounded-[20px] p-4 shadow-wellness-card"
            style={{ backgroundColor: '#E8C4A0' }}
          >
            <div className="mb-2 flex justify-end text-wellness-ink">
              <Sun size={20} strokeWidth={1.75} />
            </div>
            <p className="font-wellness-sans text-[28px] font-bold leading-none text-wellness-ink">
              7:00
            </p>
            <p className="font-wellness-sans mt-2 text-[11px] text-wellness-muted">Wake up</p>
          </div>

          <div className="rounded-[20px] bg-wellness-blueCard p-4 shadow-wellness-card">
            <div className="mb-2 flex justify-end text-wellness-ink">
              <Moon size={20} strokeWidth={1.75} />
            </div>
            <p className="font-wellness-sans text-[28px] font-bold leading-none text-wellness-ink">
              43 h
            </p>
            <div className="mt-2 flex h-8 items-end gap-1">
              {[12, 20, 10, 24, 16].map((px, idx) => (
                <div
                  key={idx}
                  className="w-2 rounded-sm bg-wellness-teal"
                  style={{ height: `${px}px` }}
                />
              ))}
            </div>
            <p className="font-wellness-sans mt-2 text-[11px] text-wellness-muted">
              Sleep Regularity
            </p>
          </div>

          <div className="rounded-[20px] bg-wellness-pink p-4 shadow-wellness-card">
            <div className="mb-1 flex justify-end font-wellness-sans text-[12px] font-bold tracking-tight text-wellness-ink">
              Zzz
            </div>
            <div className="relative mx-auto h-[88px] w-[88px]">
              <svg
                className="absolute inset-0 -rotate-90"
                width="88"
                height="88"
                viewBox="0 0 80 80"
              >
                <circle
                  cx="40"
                  cy="40"
                  r={r}
                  fill="none"
                  stroke="rgba(26,26,46,0.08)"
                  strokeWidth="4"
                />
                <circle
                  cx="40"
                  cy="40"
                  r={r}
                  fill="none"
                  stroke="#E07070"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={`${dash} ${c}`}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center font-wellness-sans text-[13px] font-bold text-wellness-ink">
                64 / 100
              </span>
            </div>
            <p className="font-wellness-sans mt-1 text-center text-[11px] text-wellness-muted">
              Deep quality
            </p>
          </div>

          <div className="rounded-[20px] bg-wellness-blueCard p-4 shadow-wellness-card">
            <div className="mb-2 flex justify-end text-wellness-ink">
              <Cloud size={20} strokeWidth={1.75} />
            </div>
            <p className="font-wellness-sans text-[28px] font-bold leading-none text-wellness-ink">
              7 h
            </p>
            <svg
              className="mt-2 h-8 w-full text-wellness-teal"
              viewBox="0 0 120 32"
              preserveAspectRatio="none"
            >
              <path
                d="M0 24 C20 8 40 28 60 14 S100 22 120 6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <p className="font-wellness-sans mt-2 text-[11px] text-wellness-muted">
              Duration Sleep
            </p>
          </div>
        </div>
      </div>

      <WellnessBottomNav active="home" />
    </div>
  );
}
