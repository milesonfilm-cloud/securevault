'use client';

import React from 'react';

/** Soft orbs behind glass UI — colors follow the selected member card. */
export default function GlassThemeBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div
        className="absolute -right-8 top-[12%] h-44 w-44 rounded-full opacity-70 blur-[6px] transition-[background-color] duration-500"
        style={{ backgroundColor: 'var(--glass-orb-1, #9b8cf5)' }}
      />
      <div
        className="absolute -left-10 top-[38%] h-40 w-40 rounded-full opacity-60 blur-[8px] transition-[background-color] duration-500"
        style={{ backgroundColor: 'var(--glass-orb-2, #6f63d8)' }}
      />
      <div
        className="absolute bottom-[18%] right-[18%] h-28 w-28 rounded-full opacity-70 blur-[5px] transition-[background-color] duration-500"
        style={{ backgroundColor: 'var(--glass-orb-3, #c9b6f7)' }}
      />
    </div>
  );
}
