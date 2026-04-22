'use client';

import React, { useCallback, useState } from 'react';
import { FamilyMember, Document } from '@/lib/storage';
import type { PastelLedgerTile } from '@/lib/pastelLedgerPalette';
import { useTheme } from '@/context/ThemeContext';
import MemberCardBackContent from './MemberCardBackContent';
import { isDemoMemberId } from '@/lib/demoFamilyMembers';
import MemberAvatar from '@/components/MemberAvatar';

export interface FamilyMemberFlipCardProps {
  member: FamilyMember;
  documents: Document[];
  tile: PastelLedgerTile;
  onEdit: () => void;
  onDelete: () => void;
}

export default function FamilyMemberFlipCard({
  member,
  documents,
  tile,
  onEdit,
  onDelete,
}: FamilyMemberFlipCardProps) {
  const { theme } = useTheme();
  const [flipped, setFlipped] = useState(false);
  const isPastel = theme === 'pastel';
  const isNeon = theme === 'neon';
  const isWellness = theme === 'wellness';
  const demo = isDemoMemberId(member.id);

  const handleBackSurfaceClick = useCallback((e: React.MouseEvent) => {
    const el = e.target as HTMLElement;
    if (el.closest('a[href], button')) return;
    setFlipped(false);
  }, []);

  const neonShell =
    isNeon ? 'shadow-[0_0_28px_rgba(0,255,65,0.14)] ring-1 ring-[rgba(0,255,65,0.28)]' : '';
  const frontWellnessExtra = isWellness ? 'ring-1 ring-black/[0.06]' : '';

  const classicFrontInner = (
    <>
      <MemberAvatar
        name={member.name}
        avatarColor={member.avatarColor}
        photoDataUrl={member.photoDataUrl}
        className="h-20 w-20 shrink-0 rounded-2xl text-2xl"
        textClassName="text-2xl"
      />
      <h2 className="max-w-full truncate px-1 text-xl font-800 text-vault-text">{member.name}</h2>
      <p className="text-sm font-600 text-vault-muted">{member.relationship}</p>
      <p className="mt-2 text-xs text-vault-faint">Tap to view details</p>
    </>
  );

  const classicFront = isPastel ? (
    <button
      type="button"
      onClick={() => setFlipped(true)}
      aria-expanded={flipped}
      aria-label={`View details for ${member.name}`}
      className="absolute inset-0 h-full w-full rounded-[24px] border border-border bg-vault-panel p-2 text-center shadow-pastel-card transition-all duration-200 hover:shadow-[0_16px_48px_rgba(15,23,42,0.11)] [backface-visibility:hidden] [transform:translateZ(1px)]"
    >
      <div
        className="flex h-full min-h-0 flex-col items-center justify-center gap-3 rounded-[20px] px-5 py-8"
        style={{ background: tile.bg }}
      >
        {classicFrontInner}
      </div>
    </button>
  ) : (
    <button
      type="button"
      onClick={() => setFlipped(true)}
      aria-expanded={flipped}
      aria-label={`View details for ${member.name}`}
      className={`absolute inset-0 h-full w-full overflow-hidden rounded-2xl text-center shadow-vault transition-all duration-200 [backface-visibility:hidden] [transform:translateZ(1px)] hover:brightness-[1.03] ${neonShell} ${frontWellnessExtra}`}
      style={{ background: tile.bg }}
    >
      <div className="flex h-full flex-col items-center justify-center gap-3 px-6 py-10">
        {classicFrontInner}
      </div>
    </button>
  );

  const backChrome = isPastel ? (
    <div
      role="presentation"
      onClick={handleBackSurfaceClick}
      className="absolute inset-0 h-full w-full rounded-[24px] border border-border bg-vault-panel p-2 shadow-pastel-card [backface-visibility:hidden] [transform:rotateY(180deg)_translateZ(1px)]"
    >
      <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-[20px] bg-vault-panel">
        <div className="neo-card relative z-0 flex min-h-0 flex-1 flex-col rounded-[20px] border-0 bg-vault-panel shadow-none">
          <div className="h-1 w-full shrink-0" style={{ backgroundColor: member.avatarColor }} />
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            <MemberCardBackContent
              member={member}
              documents={documents}
              onEdit={onEdit}
              onDelete={onDelete}
              isDemo={demo}
            />
          </div>
        </div>
      </div>
    </div>
  ) : (
    <div
      role="presentation"
      onClick={handleBackSurfaceClick}
      className={`absolute inset-0 h-full w-full overflow-hidden rounded-2xl shadow-vault [backface-visibility:hidden] [transform:rotateY(180deg)_translateZ(1px)] ${neonShell}`}
      style={{ background: tile.bg }}
    >
      <div className="neo-card relative z-0 flex h-full min-h-0 flex-col rounded-2xl border-0 bg-transparent shadow-none">
        <div className="h-1 w-full shrink-0" style={{ backgroundColor: member.avatarColor }} />
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <MemberCardBackContent
            member={member}
            documents={documents}
            onEdit={onEdit}
            onDelete={onDelete}
            isDemo={demo}
          />
        </div>
      </div>
    </div>
  );

  const shellClass = 'h-full w-full [perspective:1000px]';
  const sizeClass = 'h-[440px] w-[280px]';

  return (
    <div className={`${sizeClass} shrink-0 touch-manipulation`}>
      <div className={shellClass}>
        <div
          className={`relative h-full w-full transition-transform duration-500 ease-out [transform-style:preserve-3d] ${
            flipped ? '[transform:rotateY(180deg)]' : ''
          }`}
        >
          {classicFront}
          {backChrome}
        </div>
      </div>
    </div>
  );
}
