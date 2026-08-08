'use client';

import React from 'react';
import { cn } from '@/lib/utils';

const BADGES = [
  'DPDP Act 2023 Aligned',
  'AES-256-GCM',
  'Zero-Knowledge',
  '100% Offline',
] as const;

export default function ComplianceBadgeStrip({
  className,
  variant = 'light',
}: {
  className?: string;
  variant?: 'light' | 'dark';
}) {
  return (
    <ul
      className={cn(
        'flex flex-wrap items-center justify-center gap-2',
        className
      )}
      aria-label="Privacy and security highlights"
    >
      {BADGES.map((label) => (
        <li
          key={label}
          className={cn(
            'rounded-full px-3 py-1 text-[10px] font-bold tracking-wide sm:text-[11px]',
            variant === 'light'
              ? 'bg-[#4338C9]/10 text-[#4338C9] ring-1 ring-[#4338C9]/20'
              : 'bg-white/10 text-white/90 ring-1 ring-white/20'
          )}
        >
          {label}
        </li>
      ))}
    </ul>
  );
}
