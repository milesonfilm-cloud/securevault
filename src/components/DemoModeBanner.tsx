'use client';

import React, { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { isDemoMode } from '@/lib/demoMode';

export const EXIT_DEMO_EVENT = 'sv-exit-demo';

export default function DemoModeBanner() {
  const [active, setActive] = useState(false);

  useEffect(() => {
    setActive(isDemoMode());
  }, []);

  if (!active) return null;

  return (
    <div
      className="sticky top-0 z-40 flex flex-wrap items-center justify-between gap-3 border-b border-amber-400/35 bg-amber-100/80 px-4 py-2.5 text-amber-950 backdrop-blur-xl"
      role="status"
    >
      <div className="flex min-w-0 items-center gap-2">
        <Sparkles className="h-4 w-4 shrink-0 text-amber-600" aria-hidden />
        <p className="text-xs font-semibold leading-snug sm:text-sm">
          Demo mode — sample family data only. Nothing is encrypted or saved permanently.
        </p>
      </div>
      <button
        type="button"
        onClick={() => {
          window.dispatchEvent(new Event(EXIT_DEMO_EVENT));
        }}
        className="shrink-0 rounded-full bg-[#4338C9] px-3.5 py-1.5 text-[11px] font-bold text-white shadow-sm transition-all hover:bg-[#372fb0] active:scale-[0.98]"
      >
        Create passcode
      </button>
    </div>
  );
}
