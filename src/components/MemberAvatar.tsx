'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { resolveMemberColor } from '@/lib/memberAvatarColors';

export interface MemberAvatarProps {
  name: string;
  avatarColor: string;
  photoDataUrl?: string | null;
  className?: string;
  textClassName?: string;
}

/** Square avatar: photo when set, otherwise initials on color. */
export default function MemberAvatar({
  name,
  avatarColor,
  photoDataUrl,
  className,
  textClassName,
}: MemberAvatarProps) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  const mc = resolveMemberColor(avatarColor);

  if (photoDataUrl) {
    return (
      <div className={cn('relative overflow-hidden shadow-inner', className)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photoDataUrl} alt="" className="h-full w-full object-cover" draggable={false} />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center font-800 shadow-inner',
        textClassName,
        className
      )}
      style={{ backgroundColor: mc.bg, color: mc.text }}
    >
      {initials || '?'}
    </div>
  );
}
