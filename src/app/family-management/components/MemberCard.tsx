'use client';

import React from 'react';
import { Pencil, Trash2, FileText, ChevronRight } from 'lucide-react';
import { FamilyMember, Document } from '@/lib/storage';
import { CATEGORIES } from '@/lib/categories';
import type { PASTEL_LEDGER_TILES } from '@/lib/pastelLedgerPalette';
import { hexAlpha } from '@/lib/memberAvatarColors';

interface MemberCardProps {
  member: FamilyMember;
  documents: Document[];
  isSelected: boolean;
  tile: (typeof PASTEL_LEDGER_TILES)[number];
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

function formatDOB(dob: string): string {
  if (!dob) return '—';
  try {
    return new Date(dob).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dob;
  }
}

function getAge(dob: string): string {
  if (!dob) return '';
  try {
    const birth = new Date(dob);
    const today = new Date();
    const age = today.getFullYear() - birth.getFullYear();
    return `${age} yrs`;
  } catch {
    return '';
  }
}

export default function MemberCard({
  member,
  documents,
  isSelected,
  tile,
  onSelect,
  onEdit,
  onDelete,
}: MemberCardProps) {
  const docCount = documents.length;

  const categoryBreakdown = CATEGORIES.map((cat) => ({
    cat,
    count: documents.filter((d) => d.categoryId === cat.id).length,
  })).filter((x) => x.count > 0);

  return (
    <div
      className={`rounded-2xl cursor-pointer transition-all duration-200 overflow-hidden shadow-vault ${
        isSelected ? 'ring-2 ring-vault-warm ring-offset-2 ring-offset-vault-bg scale-[1.01]' : ''
      }`}
      style={{ background: tile.bg }}
      onClick={onSelect}
    >
      <div className="neo-card rounded-2xl relative z-0 border-0 bg-transparent shadow-none">
        {/* Color accent bar */}
        <div className="h-1 w-full" style={{ backgroundColor: member.avatarColor }} />

        <div className="p-5">
          {/* Avatar + actions row */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-700 text-base flex-shrink-0"
                style={{ backgroundColor: member.avatarColor }}
              >
                {getInitials(member.name)}
              </div>
              <div>
                <h3 className="text-base font-700 text-white">{member.name}</h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-xs text-vault-muted font-500">{member.relationship}</span>
                  {member.dob && (
                    <>
                      <span className="text-vault-faint">·</span>
                      <span className="text-xs text-vault-muted">{getAge(member.dob)}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={onEdit}
                className="p-1.5 rounded-[10px] text-vault-faint hover:text-vault-warm hover:bg-white/[0.05] transition-colors"
                title="Edit member"
              >
                <Pencil size={14} />
              </button>
              <button
                onClick={onDelete}
                className="p-1.5 rounded-[10px] text-vault-faint hover:text-red-400 hover:bg-red-500/10 transition-colors"
                title="Delete member — removes all their documents"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>

          {/* DOB */}
          {member.dob && (
            <p className="text-xs text-vault-muted mb-3">Born {formatDOB(member.dob)}</p>
          )}

          {/* Document count */}
          <div className="flex items-center gap-2 mb-3">
            <FileText size={14} className="text-vault-faint" />
            <span className="text-sm font-700 text-white">
              {docCount} document{docCount !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Category breakdown */}
          {categoryBreakdown.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {categoryBreakdown.map(({ cat, count }) => (
                <span
                  key={`member-cat-${member.id}-${cat.id}`}
                  className="inline-flex items-center gap-1 text-xs font-700 px-2 py-0.5 rounded-full border border-[rgba(255,255,255,0.08)]"
                  style={{
                    backgroundColor: hexAlpha(cat.color, 0.18),
                    color: cat.color,
                  }}
                >
                  {count} {cat.shortLabel}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-vault-faint">No documents yet</p>
          )}

          {/* View detail hint */}
          <div className="flex items-center justify-end mt-3 text-xs font-600 text-vault-warm hover:text-white transition-colors">
            <span>View documents</span>
            <ChevronRight size={12} className="ml-0.5" aria-hidden />
          </div>
        </div>
      </div>
    </div>
  );
}
