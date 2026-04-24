'use client';

import React, { useEffect, useState } from 'react';
import type { FamilyMember } from '@/lib/storage';
import MemberAvatar from '@/components/MemberAvatar';
import { cn } from '@/lib/utils';

interface CompletenessRingProps {
  member: FamilyMember;
  /** 0–100 */
  percent: number;
  size?: number;
  stroke?: number;
  className?: string;
}

export default function CompletenessRing({
  member,
  percent,
  size = 120,
  stroke = 8,
  className,
}: CompletenessRingProps) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, percent));
  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    const t = requestAnimationFrame(() => setAnimated(clamped));
    return () => cancelAnimationFrame(t);
  }, [clamped]);

  const offset = c * (1 - animated / 100);

  return (
    <div className={cn('relative inline-flex flex-col items-center', className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90 transform">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            className="text-vault-elevated"
            stroke="currentColor"
            strokeWidth={stroke}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            className="text-vault-warm transition-[stroke-dashoffset] duration-1000 ease-out"
            stroke="currentColor"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center p-2">
          <MemberAvatar
            name={member.name}
            avatarColor={member.avatarColor}
            photoDataUrl={member.photoDataUrl}
            className="h-[52%] w-[52%] rounded-full border-2 border-vault-panel shadow-vault"
          />
        </div>
      </div>
      <p className="mt-1.5 text-lg font-800 tabular-nums text-vault-text">{Math.round(clamped)}%</p>
    </div>
  );
}
