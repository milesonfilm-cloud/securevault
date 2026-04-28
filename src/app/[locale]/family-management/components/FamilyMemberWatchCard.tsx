'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FamilyMember, Document } from '@/lib/storage';
import MemberCardBackContent from './MemberCardBackContent';
import { isDemoMemberId } from '@/lib/demoFamilyMembers';
import MemberAvatar from '@/components/MemberAvatar';
import {
  loadWatchUiFonts,
  MEMBER_WATCH_ACCENTS,
  WATCH_UI_INTER,
  WATCH_UI_MONO,
  watchAccentGlow,
} from '@/lib/watchUiFonts';
import { cn } from '@/lib/utils';

function CardMenuDots({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={cn(
        'pointer-events-none z-[2] flex gap-0.5 select-none text-[#555]',
        compact ? 'right-3 top-3' : 'right-5 top-5'
      )}
      style={{
        fontFamily: WATCH_UI_INTER,
        letterSpacing: '0.15em',
        fontSize: compact ? 11 : 14,
        lineHeight: 1,
      }}
      aria-hidden
    >
      <span>•</span>
      <span>•</span>
      <span>•</span>
    </div>
  );
}

function formatShortAdded(iso: string): string {
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

export interface FamilyMemberWatchCardProps {
  member: FamilyMember;
  documents: Document[];
  accentIndex: number;
  onEdit: () => void;
  onDelete: () => void;
  /** When false, front tap focuses the card in a coverflow (no flip). Default true. */
  isCarouselCenter?: boolean;
  onCarouselSelect?: () => void;
  /** Nested under a coverflow wrapper (no local perspective/extra shell shadow). */
  coverflowChild?: boolean;
  /** Defaults match desktop coverflow. Pass smaller sizes for mobile carousel. */
  cardWidth?: number;
  cardHeight?: number;
}

const CARD_W = 340;
const CARD_H = 400;
/** Shared corner radius — front, back, and shell */
const CARD_ROUND = 'rounded-[2.25rem]';
const CARD_ROUND_COMPACT = 'rounded-[1.65rem]';
const AVATAR_ROUND = 'rounded-[1.75rem]';
const AVATAR_ROUND_COMPACT = 'rounded-[1.2rem]';

export default function FamilyMemberWatchCard({
  member,
  documents,
  accentIndex,
  onEdit,
  onDelete,
  isCarouselCenter = true,
  onCarouselSelect,
  coverflowChild = false,
  cardWidth = CARD_W,
  cardHeight = CARD_H,
}: FamilyMemberWatchCardProps) {
  const [flipped, setFlipped] = useState(false);
  const compact = cardWidth < 300;
  const cardRound = compact ? CARD_ROUND_COMPACT : CARD_ROUND;
  const shellPad = compact ? 12 : 20;
  const avatarRound = compact ? AVATAR_ROUND_COMPACT : AVATAR_ROUND;
  const demo = isDemoMemberId(member.id);
  const accent = MEMBER_WATCH_ACCENTS[accentIndex % MEMBER_WATCH_ACCENTS.length];
  const docCount = documents.length;

  const distinctCategories = new Set(documents.map((d) => d.categoryId)).size;

  useEffect(() => {
    loadWatchUiFonts();
  }, []);

  useEffect(() => {
    if (!isCarouselCenter) setFlipped(false);
  }, [isCarouselCenter]);

  const handleBackSurfaceClick = useCallback((e: React.MouseEvent) => {
    const el = e.target as HTMLElement;
    if (el.closest('a[href], button, input, select, textarea, [role="button"]')) return;
    setFlipped(false);
  }, []);

  const { shellShadow, shellShadowHover } = useMemo(() => {
    const g = (a: number) => watchAccentGlow(accent, a);
    const idleGlow = `0 0 0 1px ${g(0.14)}, 0 0 22px ${g(0.34)}, 0 0 48px ${g(0.19)}, 0 0 78px ${g(0.08)}`;
    const hoverGlow = `0 0 0 1px ${g(0.2)}, 0 0 30px ${g(0.5)}, 0 0 58px ${g(0.28)}, 0 0 92px ${g(0.11)}`;
    /** Coverflow (web + in-app WebView on iOS/Android): same neon shell as desktop carousel. */
    if (coverflowChild) {
      return {
        shellShadow: `${idleGlow}, 0 12px 30px rgba(0,0,0,0.55)`,
        shellShadowHover: `${hoverGlow}, 0 14px 34px rgba(0,0,0,0.5)`,
      };
    }
    return {
      shellShadow: `0 8px 40px rgba(0,0,0,0.6), ${idleGlow}`,
      shellShadowHover: `0 12px 52px ${g(0.42)}, ${hoverGlow}`,
    };
  }, [accent, coverflowChild]);

  const cardBg = '#0d0d0d';
  const bumpBg = '#141414';
  const pillTextColor = '#111';

  return (
    <div
      className={cn(
        'shrink-0 touch-manipulation ring-1 ring-inset ring-white/10 transition-transform transition-shadow duration-200 ease-out [isolation:isolate]',
        cardRound,
        coverflowChild ? '' : 'hover:scale-[1.02]'
      )}
      style={{
        width: cardWidth,
        height: cardHeight,
        perspective: coverflowChild ? undefined : 1000,
        boxShadow: shellShadow,
      }}
      onClick={() => {
        if (!isCarouselCenter) onCarouselSelect?.();
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = shellShadowHover;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = shellShadow;
      }}
    >
      <div
        className={`relative h-full w-full [transform-style:preserve-3d] transition-transform duration-500 ease-out ${
          flipped ? '[transform:rotateY(180deg)]' : ''
        }`}
      >
        {/* Front */}
        {isCarouselCenter ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setFlipped(true);
            }}
            aria-expanded={flipped}
            aria-label={`View details for ${member.name}`}
            className={`absolute inset-0 h-full w-full overflow-hidden ${cardRound} text-center [backface-visibility:hidden] [transform:translate3d(0,0,1px)]`}
            style={{
              backgroundColor: cardBg,
              padding: shellPad,
              fontFamily: WATCH_UI_INTER,
            }}
          >
            <div
              className={cn(
                'pointer-events-none absolute -right-px -top-px',
                compact ? 'h-6 w-8 rounded-bl-[1rem]' : 'h-7 w-10 rounded-bl-[1.35rem]'
              )}
              style={{ backgroundColor: bumpBg }}
              aria-hidden
            />
            <CardMenuDots compact={compact} />

            <div className="relative z-20 flex h-full min-h-0 flex-col items-center text-white [transform:translateZ(0)]">
              <div
                className={cn(
                  'flex w-full min-h-0 flex-col items-center',
                  compact ? 'gap-2 px-1 pt-0.5' : 'gap-3 px-2 pt-1'
                )}
              >
                <MemberAvatar
                  name={member.name}
                  avatarColor={member.avatarColor}
                  photoDataUrl={member.photoDataUrl}
                  className={cn(
                    'shrink-0 ring-1 ring-white/10',
                    compact ? 'h-[80px] w-[80px] text-2xl' : 'h-[118px] w-[118px] text-3xl',
                    avatarRound
                  )}
                  textClassName={compact ? 'text-2xl font-semibold' : 'text-3xl font-semibold'}
                />
                <div className="min-w-0 w-full max-w-full px-0.5 text-center">
                  <h2
                    className={cn(
                      'line-clamp-2 text-balance font-semibold leading-snug text-white',
                      compact ? 'text-[1.02rem]' : 'text-[22px] sm:text-2xl'
                    )}
                    style={{ fontFamily: WATCH_UI_INTER }}
                  >
                    {member.name}
                  </h2>
                  <p
                    className="mt-0.5 text-[10px] uppercase tracking-[0.1em] text-[#888] min-[400px]:text-[11px]"
                    style={{ fontFamily: WATCH_UI_INTER }}
                  >
                    {member.relationship}
                  </p>
                </div>
              </div>

              <div className={cn('flex min-h-0 w-full flex-1 flex-col', compact ? 'mt-2' : 'mt-4')}>
                <div className="flex w-full min-h-0 flex-1 flex-col items-center justify-end pb-1.5 sm:pb-2">
                  <p
                    className="text-[10px] uppercase tracking-[0.1em] text-[#888] min-[400px]:text-[11px]"
                    style={{ fontFamily: WATCH_UI_INTER }}
                  >
                    Documents
                  </p>
                  <p
                    className={cn(
                      'mt-0.5 font-bold leading-none tracking-[-1px] text-white',
                      compact ? 'text-3xl' : 'text-[40px]'
                    )}
                    style={{ fontFamily: WATCH_UI_MONO }}
                  >
                    {docCount}
                  </p>
                </div>

                <div
                  className={cn(
                    'relative z-10 w-full shrink-0',
                    compact
                      ? 'space-y-1.5 border-t border-white/[0.06] pt-2.5 px-0.5 pb-1.5'
                      : 'mt-0 space-y-1.5 border-t border-white/[0.08] pt-3 px-0.5'
                  )}
                >
                  <p
                    className={cn(
                      'text-center text-[#8a8a8a] tabular-nums',
                      compact
                        ? 'text-[9px] leading-tight min-[400px]:text-[10px]'
                        : 'text-[10px] min-[400px]:text-[11px]'
                    )}
                    style={{ fontFamily: WATCH_UI_INTER }}
                  >
                    Member since {formatShortAdded(member.createdAt)}
                  </p>

                  {/*
                  Single <span> + one string; pill is only the vault line (member line stays above on black).
                */}
                  <div className="w-full min-w-0 -translate-y-0.5">
                    <span
                      className={cn(
                        'mx-auto block w-full max-w-full text-center text-[#111] [text-rendering:geometricPrecision]',
                        'rounded-full font-bold uppercase tracking-wider [font-feature-settings:"tnum"]',
                        compact
                          ? 'px-2.5 py-1.5 text-[7px] leading-tight min-[380px]:text-[8px]'
                          : 'max-w-[260px] px-3 py-2.5 text-[10px] leading-tight'
                      )}
                      style={{
                        backgroundColor: accent,
                        color: '#111',
                        fontFamily: WATCH_UI_INTER,
                        boxShadow:
                          'inset 0 1px 0 rgba(255,255,255,0.1), 0 0 0 1px rgba(0,0,0,0.06)',
                        transform: 'translateZ(0)',
                        WebkitFontSmoothing: 'antialiased' as const,
                      }}
                    >
                      {`VAULT · ${distinctCategories} ${
                        distinctCategories === 1 ? 'CATEGORY' : 'CATEGORIES'
                      }`}
                    </span>
                  </div>

                  <p
                    className="text-center text-[9px] text-[#5c5c5c] min-[400px]:text-[10px]"
                    style={{ fontFamily: WATCH_UI_INTER }}
                  >
                    Tap for details
                  </p>
                </div>
              </div>
            </div>
          </button>
        ) : (
          <div
            className={`absolute inset-0 h-full w-full cursor-pointer overflow-hidden ${cardRound} text-center [backface-visibility:hidden] [transform:translate3d(0,0,1px)]`}
            style={{
              backgroundColor: cardBg,
              padding: shellPad,
              fontFamily: WATCH_UI_INTER,
            }}
          >
            <div
              className={cn(
                'pointer-events-none absolute -right-px -top-px',
                compact ? 'h-6 w-8 rounded-bl-[1rem]' : 'h-7 w-10 rounded-bl-[1.35rem]'
              )}
              style={{ backgroundColor: bumpBg }}
              aria-hidden
            />
            <CardMenuDots compact={compact} />

            <div className="relative z-20 flex h-full min-h-0 flex-col items-center text-white [transform:translateZ(0)]">
              <div
                className={cn(
                  'flex w-full min-h-0 flex-col items-center',
                  compact ? 'gap-2 px-1 pt-0.5' : 'gap-3 px-2 pt-1'
                )}
              >
                <MemberAvatar
                  name={member.name}
                  avatarColor={member.avatarColor}
                  photoDataUrl={member.photoDataUrl}
                  className={cn(
                    'shrink-0 ring-1 ring-white/10',
                    compact ? 'h-[80px] w-[80px] text-2xl' : 'h-[118px] w-[118px] text-3xl',
                    avatarRound
                  )}
                  textClassName={compact ? 'text-2xl font-semibold' : 'text-3xl font-semibold'}
                />
                <div className="min-w-0 w-full max-w-full px-0.5 text-center sm:px-0">
                  <h2
                    className={cn(
                      'line-clamp-2 text-balance font-semibold leading-snug text-white',
                      compact ? 'text-[1.02rem]' : 'text-[22px] sm:text-2xl'
                    )}
                    style={{ fontFamily: WATCH_UI_INTER }}
                  >
                    {member.name}
                  </h2>
                  <p
                    className="mt-0.5 text-[10px] uppercase tracking-[0.1em] text-[#888] min-[400px]:text-[11px]"
                    style={{ fontFamily: WATCH_UI_INTER }}
                  >
                    {member.relationship}
                  </p>
                </div>
              </div>

              <div className={cn('flex min-h-0 w-full flex-1 flex-col', compact ? 'mt-2' : 'mt-4')}>
                <div className="flex w-full min-h-0 flex-1 flex-col items-center justify-end pb-1.5 sm:pb-2">
                  <p
                    className="text-[10px] uppercase tracking-[0.1em] text-[#888] min-[400px]:text-[11px]"
                    style={{ fontFamily: WATCH_UI_INTER }}
                  >
                    Documents
                  </p>
                  <p
                    className={cn(
                      'mt-0.5 font-bold leading-none tracking-[-1px] text-white',
                      compact ? 'text-3xl' : 'text-[40px]'
                    )}
                    style={{ fontFamily: WATCH_UI_MONO }}
                  >
                    {docCount}
                  </p>
                </div>

                <div
                  className={cn(
                    'relative z-[1] w-full shrink-0',
                    compact
                      ? 'space-y-1.5 border-t border-white/[0.06] pt-2.5 px-0.5 pb-1.5'
                      : 'mt-0 space-y-1.5 border-t border-white/[0.08] pt-3 px-0.5'
                  )}
                >
                  <p
                    className={cn(
                      'text-center text-[#8a8a8a] tabular-nums',
                      compact
                        ? 'text-[9px] leading-tight min-[400px]:text-[10px]'
                        : 'text-[10px] min-[400px]:text-[11px]'
                    )}
                    style={{ fontFamily: WATCH_UI_INTER }}
                  >
                    Member since {formatShortAdded(member.createdAt)}
                  </p>

                  {/*
                   * Neighbor coverflow: neutral strip (no second accent “pill” in 3D).
                   */}
                  {compact ? (
                    <div
                      className="-translate-y-0.5 w-full max-w-full rounded-md border border-white/10 py-1.5 text-center text-[7px] font-semibold uppercase tracking-widest text-[#4b4b4b]"
                      style={{
                        fontFamily: WATCH_UI_INTER,
                        background: 'linear-gradient(180deg, #141414, #0e0e0e)',
                      }}
                    >
                      ···
                    </div>
                  ) : (
                    <div className="flex w-full min-w-0 -translate-y-0.5 justify-center">
                      <div
                        className="inline-flex max-w-[260px] min-w-0 items-center justify-center gap-4 rounded-full px-3 py-2.5 text-[10px] font-bold uppercase leading-tight tracking-wider text-[#111] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]"
                        style={{
                          backgroundColor: accent,
                          fontFamily: WATCH_UI_INTER,
                          color: pillTextColor,
                        }}
                      >
                        <span className="shrink-0">Vault</span>
                        <span className="tabular-nums" style={{ fontFamily: WATCH_UI_MONO }}>
                          {distinctCategories} categor{distinctCategories !== 1 ? 'ies' : 'y'}
                        </span>
                      </div>
                    </div>
                  )}

                  <p
                    className="text-center text-[9px] text-[#5c5c5c] min-[400px]:text-[10px]"
                    style={{ fontFamily: WATCH_UI_INTER }}
                  >
                    Tap to focus
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Back */}
        <div
          role="presentation"
          onClick={handleBackSurfaceClick}
          className={`absolute inset-0 h-full w-full overflow-hidden ${cardRound} [backface-visibility:hidden] [transform:rotateY(180deg)_translateZ(1px)]`}
          style={{
            backgroundColor: cardBg,
          }}
        >
          <div
            className={cn(
              'pointer-events-none absolute -right-px -top-px',
              compact ? 'h-6 w-8 rounded-bl-[1rem]' : 'h-7 w-10 rounded-bl-[1.35rem]'
            )}
            style={{ backgroundColor: bumpBg }}
            aria-hidden
          />
          <CardMenuDots compact={compact} />
          <div
            className={cn(
              'h-full min-h-0 pt-2',
              compact ? 'overflow-hidden' : 'overflow-y-auto overscroll-contain'
            )}
          >
            <MemberCardBackContent
              member={member}
              documents={documents}
              onEdit={onEdit}
              onDelete={onDelete}
              isDemo={demo}
              surface="watch"
              watchAccent={accent}
              compact={compact}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
