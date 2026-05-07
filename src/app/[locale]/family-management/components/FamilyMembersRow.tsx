'use client';

import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { FamilyMember, Document } from '@/lib/storage';
import FamilyMemberWatchCard from './FamilyMemberWatchCard';
import {
  COVERFLOW_PERSPECTIVE_MEMBERS,
  coverflowOffset,
  coverflowWrapperStyle,
  coverflowZIndex,
} from '@/lib/coverflowCarousel';
import { subscribeMatchMedia } from '@/lib/matchMediaSubscribe';
import { cn } from '@/lib/utils';

const CARD_W = 340;
const CARD_H = 400;
const SCENE_H = 520;

const CARD_W_NARROW = 240;
/** Slightly taller than strict aspect ratio so flip-card back fits without scrolling on phones. */
const CARD_H_NARROW = 308;
/** Enough vertical room for card + 3D depth without clipping. */
const SCENE_H_NARROW = 400;

export interface FamilyMembersRowProps {
  members: FamilyMember[];
  documentsByMemberId: (id: string) => Document[];
  onEdit: (member: FamilyMember) => void;
  onDelete: (member: FamilyMember) => void;
  /** Coverflow carousel vs grid of cards */
  layout?: 'carousel' | 'grid';
}

/** 3D coverflow of smartwatch-style member cards (side tap = focus, center tap = flip). */
export default function FamilyMembersRow({
  members,
  documentsByMemberId,
  onEdit,
  onDelete,
  layout = 'carousel',
}: FamilyMembersRowProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isNarrow, setIsNarrow] = useState(false);
  const n = members.length;

  useEffect(() => {
    return subscribeMatchMedia('(max-width: 639px)', setIsNarrow);
  }, []);

  const cardW = isNarrow ? CARD_W_NARROW : CARD_W;
  const cardH = isNarrow ? CARD_H_NARROW : CARD_H;
  const sceneH = isNarrow ? SCENE_H_NARROW : SCENE_H;
  const coverPreset = isNarrow ? ('membersNarrow' as const) : ('members' as const);
  const memberPerspective = isNarrow ? '1100px' : COVERFLOW_PERSPECTIVE_MEMBERS;

  useEffect(() => {
    if (n === 0) return;
    setActiveIndex((i) => Math.min(Math.max(i, 0), n - 1));
  }, [n]);

  useEffect(() => {
    if (layout !== 'carousel' || n <= 1) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setActiveIndex((i) => (i - 1 + n) % n);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setActiveIndex((i) => (i + 1) % n);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [n, layout]);

  if (n === 0) {
    return null;
  }

  if (layout === 'grid') {
    const itemW = isNarrow ? 'min(88vw, 240px)' : 'min(92vw, 340px)';

    return (
      <div className="relative -mx-4 w-[calc(100%+2rem)] min-w-0 overflow-y-visible sm:-mx-6 sm:w-[calc(100%+3rem)] lg:-mx-8 lg:w-[calc(100%+4rem)]">
        <div
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto overflow-y-visible overscroll-x-contain pb-3 pt-1 pl-4 pr-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:pl-6 sm:pr-6 lg:pl-8 lg:pr-8"
          style={{ WebkitOverflowScrolling: 'touch' }}
          role="region"
          aria-label="Family members — swipe horizontally"
        >
          {members.map((member, index) => (
            <div
              key={member.id}
              className="flex shrink-0 snap-center justify-center"
              style={{ width: itemW }}
            >
              <FamilyMemberWatchCard
                member={member}
                documents={documentsByMemberId(member.id)}
                accentIndex={index}
                onEdit={() => onEdit(member)}
                onDelete={() => onDelete(member)}
                isCarouselCenter
                coverflowChild={false}
                frontTapOpensVault={layout === 'grid'}
                cardWidth={isNarrow ? CARD_W_NARROW : CARD_W}
                cardHeight={isNarrow ? CARD_H_NARROW : CARD_H}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative -mx-4 w-[calc(100%+2rem)] min-w-0 overflow-x-hidden overflow-y-visible sm:-mx-6 sm:w-[calc(100%+3rem)] lg:-mx-8 lg:w-[calc(100%+4rem)]">
      <div
        className="carousel-scene relative mx-auto w-full max-w-[min(100%,1480px)] overflow-x-hidden overflow-y-visible px-2 outline-none sm:px-6"
        style={{
          height: sceneH,
          perspective: memberPerspective,
          perspectiveOrigin: isNarrow ? '50% 45%' : '50% 42%',
        }}
        tabIndex={0}
        role="region"
        aria-label="Family members"
      >
        <div className="carousel-track absolute inset-0" style={{ transformStyle: 'preserve-3d' }}>
          {members.map((member, index) => {
            const offset = coverflowOffset(index, activeIndex, n);
            const isCenter = index === activeIndex;
            return (
              <div
                key={member.id}
                className={`absolute left-1/2 top-1/2 [transform-style:preserve-3d] will-change-[transform,opacity] ${
                  isCenter ? 'cursor-default' : 'cursor-pointer'
                }`}
                style={{
                  width: cardW,
                  height: cardH,
                  zIndex: coverflowZIndex(offset),
                  ...coverflowWrapperStyle(offset, coverPreset),
                }}
                role="presentation"
              >
                <FamilyMemberWatchCard
                  member={member}
                  documents={documentsByMemberId(member.id)}
                  accentIndex={index}
                  onEdit={() => onEdit(member)}
                  onDelete={() => onDelete(member)}
                  isCarouselCenter={isCenter}
                  onCarouselSelect={() => setActiveIndex(index)}
                  coverflowChild
                  cardWidth={cardW}
                  cardHeight={cardH}
                />
              </div>
            );
          })}
        </div>
      </div>

      {n > 1 ? (
        <div
          className={cn(
            'flex flex-wrap items-center justify-center gap-2 sm:gap-3',
            isNarrow ? 'mt-0' : 'mt-1 sm:mt-1.5'
          )}
        >
          <button
            type="button"
            aria-label="Previous member"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[color:var(--color-border)] bg-vault-elevated/50 text-vault-muted transition-colors hover:bg-vault-panel hover:text-vault-text active:scale-[0.97]"
            onClick={() => setActiveIndex((i) => (i - 1 + n) % n)}
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={2} aria-hidden />
          </button>

          <div className="flex min-w-0 max-w-[min(100%,320px)] flex-col items-center gap-2 sm:max-w-none sm:flex-row sm:gap-4">
            <p
              className="shrink-0 tabular-nums text-sm font-700 text-vault-text sm:text-base"
              aria-live="polite"
            >
              {activeIndex + 1}
              <span className="font-600 text-vault-muted"> / </span>
              {n}
            </p>
            <div
              className="flex flex-wrap justify-center gap-2"
              role="tablist"
              aria-label="Choose member"
            >
              {members.map((member, i) => (
                <button
                  key={member.id}
                  type="button"
                  role="tab"
                  aria-selected={i === activeIndex}
                  aria-label={`Focus ${member.name}`}
                  className={`h-2 rounded-full transition-all ${
                    i === activeIndex
                      ? 'w-6 bg-vault-warm'
                      : 'w-2 bg-vault-faint/60 hover:bg-vault-muted'
                  }`}
                  onClick={() => setActiveIndex(i)}
                />
              ))}
            </div>
          </div>

          <button
            type="button"
            aria-label="Next member"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[color:var(--color-border)] bg-vault-elevated/50 text-vault-muted transition-colors hover:bg-vault-panel hover:text-vault-text active:scale-[0.97]"
            onClick={() => setActiveIndex((i) => (i + 1) % n)}
          >
            <ChevronRight className="h-5 w-5" strokeWidth={2} aria-hidden />
          </button>
        </div>
      ) : null}
    </div>
  );
}
