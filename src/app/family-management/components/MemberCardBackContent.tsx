'use client';

import React from 'react';
import Link from 'next/link';
import { Pencil, Trash2, FileText, ChevronRight, Calendar, Clock, FolderOpen } from 'lucide-react';
import { FamilyMember, Document } from '@/lib/storage';
import { CATEGORIES } from '@/lib/categories';
import { hexAlpha } from '@/lib/memberAvatarColors';
import { isDemoMemberId } from '@/lib/demoFamilyMembers';
import MemberAvatar from '@/components/MemberAvatar';

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

function formatShortDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
}

export interface MemberCardBackContentProps {
  member: FamilyMember;
  documents: Document[];
  onEdit: () => void;
  onDelete: () => void;
  /** Hide edit/delete and vault link for demo cards */
  isDemo?: boolean;
}

/**
 * Full member detail block — used on the flip-card back (current card body style).
 */
export default function MemberCardBackContent({
  member,
  documents,
  onEdit,
  onDelete,
  isDemo = false,
}: MemberCardBackContentProps) {
  const docCount = documents.length;

  const categoryBreakdown = CATEGORIES.map((cat) => ({
    cat,
    count: documents.filter((d) => d.categoryId === cat.id).length,
  })).filter((x) => x.count > 0);

  const distinctCategories = categoryBreakdown.length;

  const lastActivity =
    documents.length > 0
      ? documents.reduce((latest, d) => {
          const t = new Date(d.updatedAt).getTime();
          return t > latest ? t : latest;
        }, 0)
      : null;

  const vaultHref = `/document-vault?member=${encodeURIComponent(member.id)}`;
  const demo = isDemo || isDemoMemberId(member.id);

  return (
    <div className="p-5">
      {demo ? (
        <p className="mb-3 rounded-lg border border-dashed border-vault-warm/40 bg-vault-warm/10 px-3 py-2 text-center text-[11px] font-600 text-vault-warm">
          Sample card — not saved to your vault
        </p>
      ) : null}

      <div className="mb-4 flex items-start justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <MemberAvatar
            name={member.name}
            avatarColor={member.avatarColor}
            photoDataUrl={member.photoDataUrl}
            className="h-14 w-14 flex-shrink-0 rounded-xl text-lg"
            textClassName="text-lg"
          />
          <div className="min-w-0">
            <h3 className="truncate text-lg font-semibold text-vault-text">{member.name}</h3>
            <div className="mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
              <span className="text-xs font-600 text-vault-muted">{member.relationship}</span>
              {member.dob ? (
                <>
                  <span className="text-vault-faint">·</span>
                  <span className="text-xs text-vault-muted">{getAge(member.dob)}</span>
                </>
              ) : null}
            </div>
          </div>
        </div>

        {!demo ? (
          <div className="flex shrink-0 items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={onEdit}
              className="rounded-[10px] p-2 text-vault-faint transition-colors hover:bg-vault-elevated/50 hover:text-vault-warm sm:p-1.5"
              title="Edit member"
            >
              <Pencil size={16} />
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="rounded-[10px] p-2 text-vault-faint transition-colors hover:bg-red-500/10 hover:text-red-400 sm:p-1.5"
              title="Delete member — removes all their documents"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ) : null}
      </div>

      <div className="mb-4 grid grid-cols-2 gap-2 text-[11px]">
        <div className="rounded-xl border border-[color:var(--color-border)] bg-vault-elevated/35 px-2.5 py-2">
          <div className="mb-0.5 flex items-center gap-1 text-vault-faint">
            <Calendar size={11} className="shrink-0 opacity-80" aria-hidden />
            <span className="font-700 uppercase tracking-wider">Profile added</span>
          </div>
          <p className="font-700 tabular-nums text-vault-text">{formatShortDate(member.createdAt)}</p>
        </div>
        <div className="rounded-xl border border-[color:var(--color-border)] bg-vault-elevated/35 px-2.5 py-2">
          <div className="mb-0.5 flex items-center gap-1 text-vault-faint">
            <Clock size={11} className="shrink-0 opacity-80" aria-hidden />
            <span className="font-700 uppercase tracking-wider">Last activity</span>
          </div>
          <p className="font-700 tabular-nums text-vault-text">
            {lastActivity ? formatShortDate(new Date(lastActivity).toISOString()) : '—'}
          </p>
        </div>
      </div>

      {member.dob ? (
        <p className="mb-3 text-xs text-vault-muted">
          <span className="font-600 text-vault-faint">Date of birth:</span> {formatDOB(member.dob)}
        </p>
      ) : null}

      <div className="mb-2 flex flex-wrap items-center gap-2">
        <FileText size={15} className="shrink-0 text-vault-faint" />
        <span className="text-sm font-800 text-vault-text">
          {docCount} document{docCount !== 1 ? 's' : ''}
        </span>
        <span className="text-vault-faint">·</span>
        <span className="inline-flex items-center gap-1 text-xs font-600 text-vault-muted">
          <FolderOpen size={12} className="opacity-80" aria-hidden />
          {distinctCategories} categor{distinctCategories !== 1 ? 'ies' : 'y'}
        </span>
      </div>

      {categoryBreakdown.length > 0 ? (
        <>
          <div
            className="mb-2 flex h-2 w-full overflow-hidden rounded-full ring-1 ring-black/10 [data-theme='neon']:ring-[rgba(0,255,65,0.25)]"
            aria-hidden
          >
            {categoryBreakdown.map(({ cat, count }) => (
              <div
                key={`bar-${member.id}-${cat.id}`}
                className="min-w-[6px]"
                style={{
                  flexGrow: Math.max(count, 1),
                  flexBasis: 0,
                  backgroundColor: cat.color,
                }}
              />
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {categoryBreakdown.map(({ cat, count }) => (
              <span
                key={`member-cat-${member.id}-${cat.id}`}
                className="inline-flex items-center gap-1 rounded-full border border-[color:var(--color-border)] px-2 py-0.5 text-[11px] font-700"
                style={{
                  backgroundColor: hexAlpha(cat.color, 0.18),
                  color: cat.color,
                }}
              >
                {count} {cat.shortLabel}
              </span>
            ))}
          </div>
        </>
      ) : (
        <p className="text-xs text-vault-faint">No documents yet</p>
      )}

      {!demo ? (
        <Link
          href={vaultHref}
          onClick={(e) => e.stopPropagation()}
          className="mt-4 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-[color:var(--color-border)] bg-vault-panel/80 py-2.5 text-sm font-800 text-vault-warm transition-colors hover:bg-vault-elevated hover:text-vault-text sm:min-h-0"
        >
          <span>View documents in vault</span>
          <ChevronRight size={16} className="shrink-0" aria-hidden />
        </Link>
      ) : (
        <p className="mt-4 rounded-xl border border-[color:var(--color-border)] bg-vault-elevated/40 py-3 text-center text-xs text-vault-muted">
          Add real family members to link documents and open the vault.
        </p>
      )}
    </div>
  );
}
