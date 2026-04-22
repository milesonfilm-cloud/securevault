'use client';

import React from 'react';
import { FamilyMember, Document } from '@/lib/storage';
import { getPastelLedgerTile, type LedgerTileTheme } from '@/lib/pastelLedgerPalette';
import FamilyMemberFlipCard from './FamilyMemberFlipCard';

const CARD_W = 280;

export interface FamilyMembersRowProps {
  members: FamilyMember[];
  documentsByMemberId: (id: string) => Document[];
  ledgerTheme: LedgerTileTheme;
  onEdit: (member: FamilyMember) => void;
  onDelete: (member: FamilyMember) => void;
}

/** Horizontal row of formal flip cards — no coverflow / 3D stage. */
export default function FamilyMembersRow({
  members,
  documentsByMemberId,
  ledgerTheme,
  onEdit,
  onDelete,
}: FamilyMembersRowProps) {
  return (
    <div className="-mx-4 overflow-x-auto px-4 pb-1 [scrollbar-color:rgba(128,128,128,0.35)_transparent]">
      <div className="flex w-max gap-4 pb-2">
        {members.map((member, index) => (
          <div key={member.id} className="shrink-0" style={{ width: CARD_W }}>
            <FamilyMemberFlipCard
              member={member}
              documents={documentsByMemberId(member.id)}
              tile={getPastelLedgerTile(index, ledgerTheme)}
              onEdit={() => onEdit(member)}
              onDelete={() => onDelete(member)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
