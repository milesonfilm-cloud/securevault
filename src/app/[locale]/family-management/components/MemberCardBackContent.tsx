'use client';

import React from 'react';
import Link from 'next/link';
import { Pencil, Trash2, FileText, ChevronRight, Calendar, Clock, FolderOpen } from 'lucide-react';
import { FamilyMember, Document } from '@/lib/storage';
import { CATEGORIES } from '@/lib/categories';
import { hexAlpha } from '@/lib/memberAvatarColors';
import { isDemoMemberId } from '@/lib/demoFamilyMembers';
import MemberAvatar from '@/components/MemberAvatar';
import { cn } from '@/lib/utils';
import { WATCH_UI_INTER, WATCH_UI_MONO } from '@/lib/watchUiFonts';
import { CategoryLucideIcon } from '@/lib/categoryLucideIcons';

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
  /** Dark smartwatch-style panel (family member watch cards) */
  surface?: 'vault' | 'watch';
  /** Accent hex for watch CTAs / chips */
  watchAccent?: string;
  /** Tighter layout for small watch cards (avoids back-face scroll) */
  compact?: boolean;
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
  surface = 'vault',
  watchAccent = '#39FF14',
  compact = false,
}: MemberCardBackContentProps) {
  const watch = surface === 'watch';
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
    <div
      className={cn(watch && compact ? 'px-2.5 py-2 pt-2' : 'p-5 pt-6', watch && 'min-h-0')}
      style={watch ? { fontFamily: WATCH_UI_INTER } : undefined}
    >
      {demo ? (
        <p
          className={
            watch
              ? compact
                ? 'mb-2 text-center text-[10px] font-600 leading-snug text-[#888]'
                : 'mb-3 rounded-2xl border border-dashed px-3 py-2 text-center text-[11px] font-600'
              : 'mb-3 rounded-2xl border border-dashed border-vault-warm/40 bg-vault-warm/10 px-3 py-2 text-center text-[11px] font-600 text-vault-warm'
          }
          style={
            watch && !compact
              ? {
                  borderColor: `${watchAccent}55`,
                  backgroundColor: `${watchAccent}14`,
                  color: watchAccent,
                }
              : undefined
          }
        >
          Sample card — not saved to your vault
        </p>
      ) : null}

      <div
        className={cn(
          watch ? cn('relative', compact ? 'mb-2' : 'mb-4') : 'mb-4 flex items-start justify-between'
        )}
      >
        {watch ? (
          <>
            {!demo ? (
              <div
                className="absolute right-0 top-0 z-10 flex shrink-0 items-center gap-0.5"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={onEdit}
                  className={
                    compact
                      ? 'rounded-lg p-1.5 text-[#888] transition-colors hover:bg-white/10 hover:text-white'
                      : 'rounded-xl p-2 text-[#888] transition-colors hover:bg-white/10 hover:text-white sm:p-1.5'
                  }
                  title="Edit member"
                >
                  <Pencil size={compact ? 14 : 16} />
                </button>
                <button
                  type="button"
                  onClick={onDelete}
                  className={
                    compact
                      ? 'rounded-lg p-1.5 text-[#888] transition-colors hover:bg-red-500/15 hover:text-red-400'
                      : 'rounded-xl p-2 text-[#888] transition-colors hover:bg-red-500/15 hover:text-red-400 sm:p-1.5'
                  }
                  title="Delete member — removes all their documents"
                >
                  <Trash2 size={compact ? 14 : 16} />
                </button>
              </div>
            ) : null}
            <div className={cn('flex flex-col items-center text-center', compact ? 'px-4' : 'px-6')}>
              <MemberAvatar
                name={member.name}
                avatarColor={member.avatarColor}
                photoDataUrl={member.photoDataUrl}
                className={
                  compact
                    ? 'h-11 w-11 shrink-0 rounded-xl text-base ring-1 ring-white/10'
                    : 'h-14 w-14 shrink-0 rounded-2xl text-lg ring-1 ring-white/10'
                }
                textClassName={compact ? 'text-base' : 'text-lg'}
              />
              <h3
                className={cn(
                  'mt-2 line-clamp-2 text-balance font-semibold text-white',
                  compact ? 'text-base leading-snug' : 'text-lg'
                )}
                style={{ fontFamily: WATCH_UI_INTER }}
              >
                {member.name}
              </h3>
              <div className="mt-1 flex flex-wrap items-center justify-center gap-x-1.5 gap-y-0.5">
                <span className="text-xs font-600 text-[#888]">{member.relationship}</span>
                {member.dob ? (
                  <>
                    <span className="text-[#555]">·</span>
                    <span className="text-xs text-[#888]">{getAge(member.dob)}</span>
                  </>
                ) : null}
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
              <MemberAvatar
                name={member.name}
                avatarColor={member.avatarColor}
                photoDataUrl={member.photoDataUrl}
                className="h-14 w-14 flex-shrink-0 rounded-2xl text-lg"
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
              <div className="flex shrink-0 items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={onEdit}
                  className="rounded-xl p-2 text-vault-faint transition-colors hover:bg-vault-elevated/50 hover:text-vault-warm sm:p-1.5"
                  title="Edit member"
                >
                  <Pencil size={16} />
                </button>
                <button
                  type="button"
                  onClick={onDelete}
                  className="rounded-xl p-2 text-vault-faint transition-colors hover:bg-red-500/10 hover:text-red-400 sm:p-1.5"
                  title="Delete member — removes all their documents"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ) : null}
          </>
        )}
      </div>

      {!watch ? (
        <div className="mb-4 grid grid-cols-2 gap-2 text-[11px]">
          <div className="rounded-2xl border border-[color:var(--color-border)] bg-vault-elevated/35 px-2.5 py-2">
            <div className="mb-0.5 flex items-center gap-1 text-vault-faint">
              <Calendar size={11} className="shrink-0 opacity-80" aria-hidden />
              <span className="font-700 uppercase tracking-wider">Profile added</span>
            </div>
            <p className="font-700 tabular-nums text-vault-text">
              {formatShortDate(member.createdAt)}
            </p>
          </div>
          <div className="rounded-2xl border border-[color:var(--color-border)] bg-vault-elevated/35 px-2.5 py-2">
            <div className="mb-0.5 flex items-center gap-1 text-vault-faint">
              <Clock size={11} className="shrink-0 opacity-80" aria-hidden />
              <span className="font-700 uppercase tracking-wider">Last activity</span>
            </div>
            <p className="font-700 tabular-nums text-vault-text">
              {lastActivity ? formatShortDate(new Date(lastActivity).toISOString()) : '—'}
            </p>
          </div>
        </div>
      ) : null}

      {member.dob ? (
        <p
          className={cn(
            watch && compact ? 'mb-1.5 text-[10px] leading-tight' : 'mb-3 text-xs',
            watch ? 'text-center text-[#888]' : 'text-vault-muted'
          )}
        >
          <span className={`font-600 ${watch ? 'text-[#666]' : 'text-vault-faint'}`}>
            Date of birth:
          </span>{' '}
          {formatDOB(member.dob)}
        </p>
      ) : null}

      <div
        className={cn(
          'flex flex-wrap items-center gap-1.5 sm:gap-2',
          watch && compact ? 'mb-1.5' : 'mb-2',
          watch && 'justify-center text-center'
        )}
      >
        <FileText
          size={watch && compact ? 13 : 15}
          className={`shrink-0 ${watch ? 'text-[#666]' : 'text-vault-faint'}`}
        />
        <span
          className={cn(
            'font-800',
            watch && compact ? 'text-xs' : 'text-sm',
            watch ? 'text-white' : 'text-vault-text'
          )}
          style={watch ? { fontFamily: WATCH_UI_MONO } : undefined}
        >
          {docCount} document{docCount !== 1 ? 's' : ''}
        </span>
        <span className={watch ? 'text-[#555]' : 'text-vault-faint'}>·</span>
        <span
          className={cn(
            'inline-flex items-center gap-1 font-600',
            watch && compact ? 'text-[10px]' : 'text-xs',
            watch ? 'text-[#888]' : 'text-vault-muted'
          )}
        >
          <FolderOpen size={watch && compact ? 10 : 12} className="opacity-80" aria-hidden />
          {distinctCategories} categor{distinctCategories !== 1 ? 'ies' : 'y'}
        </span>
      </div>

      {categoryBreakdown.length > 0 ? (
        <>
          <div
            className={cn(
              'mb-2 flex flex-wrap items-center justify-center gap-1',
              watch && compact ? 'gap-0.5' : 'gap-1'
            )}
            aria-label="Categories with documents"
          >
            {categoryBreakdown.map(({ cat, count }) => (
              <span
                key={`cat-ico-${member.id}-${cat.id}`}
                title={`${cat.shortLabel} (${count})`}
                className={cn(
                  'inline-flex items-center justify-center rounded-lg border shadow-sm',
                  watch && compact ? 'h-6 w-6' : 'h-7 w-7',
                  watch
                    ? 'border-white/12 bg-white/[0.07]'
                    : 'border-[color:var(--color-border)] bg-vault-elevated/50'
                )}
                style={{ color: cat.color }}
              >
                <CategoryLucideIcon name={cat.icon} size={watch && compact ? 11 : 13} />
              </span>
            ))}
          </div>
          <div
            className={cn(
              'flex w-full overflow-hidden rounded-full ring-1',
              watch && compact ? 'mb-1 h-1' : 'mb-2 h-2',
              watch
                ? 'ring-white/10'
                : "ring-black/10 [data-theme='neon']:ring-[rgba(0,255,65,0.25)]"
            )}
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
          <div
            className={cn('flex flex-wrap', watch && compact ? 'gap-1' : 'gap-1.5')}
            onClick={(e) => e.stopPropagation()}
            role="presentation"
          >
            {categoryBreakdown.map(({ cat, count }) => (
              <span
                key={`member-cat-${member.id}-${cat.id}`}
                className={cn(
                  'inline-flex items-center gap-0.5 rounded-full border font-700',
                  watch && compact ? 'px-1.5 py-px text-[9px]' : 'gap-1 px-2 py-0.5 text-[11px]',
                  watch ? 'border-white/10' : 'border-[color:var(--color-border)]'
                )}
                style={{
                  backgroundColor: watch ? hexAlpha(cat.color, 0.22) : hexAlpha(cat.color, 0.18),
                  color: cat.color,
                }}
              >
                {count} {cat.shortLabel}
              </span>
            ))}
          </div>
        </>
      ) : (
        <p
          className={cn(
            watch && compact ? 'text-[10px]' : 'text-xs',
            watch ? 'text-[#666]' : 'text-vault-faint'
          )}
        >
          No documents yet
        </p>
      )}

      {!demo ? (
        <Link
          href={vaultHref}
          onClick={(e) => e.stopPropagation()}
          className={
            watch
              ? compact
                ? 'mt-2 flex w-full items-center justify-center gap-1.5 rounded-[999px] py-2 text-xs font-800 transition-all hover:brightness-110 active:scale-[0.99]'
                : 'mt-4 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-[999px] py-2.5 text-sm font-800 transition-all hover:brightness-110 active:scale-[0.99] sm:min-h-0'
              : 'mt-4 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-2xl border border-[color:var(--color-border)] bg-vault-panel/80 py-2.5 text-sm font-800 text-vault-warm transition-colors hover:bg-vault-elevated hover:text-vault-text sm:min-h-0'
          }
          style={
            watch
              ? {
                  backgroundColor: watchAccent,
                  color: '#111',
                  fontFamily: WATCH_UI_INTER,
                }
              : undefined
          }
        >
          <span>{compact && watch ? 'View in vault' : 'View documents in vault'}</span>
          <ChevronRight size={watch && compact ? 14 : 16} className="shrink-0" aria-hidden />
        </Link>
      ) : (
        <p
          className={
            watch
              ? compact
                ? 'mt-2 text-center text-[10px] leading-snug text-[#888]'
                : 'mt-4 rounded-2xl border border-white/10 bg-white/[0.04] py-3 text-center text-xs text-[#888]'
              : 'mt-4 rounded-2xl border border-[color:var(--color-border)] bg-vault-elevated/40 py-3 text-center text-xs text-vault-muted'
          }
        >
          Add real family members to link documents and open the vault.
        </p>
      )}
    </div>
  );
}
