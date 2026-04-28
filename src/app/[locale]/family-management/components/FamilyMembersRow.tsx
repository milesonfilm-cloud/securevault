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
}

/** 3D coverflow of smartwatch-style member cards (side tap = focus, center tap = flip). */
export default function FamilyMembersRow({
  members,
  documentsByMemberId,
  onEdit,
  onDelete,
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
    if (n <= 1) return;
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
  }, [n]);

  if (n === 0) {
    return null;
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
            'flex items-center justify-center gap-2 sm:mt-3 sm:gap-4',
            isNarrow ? 'mt-1.5' : 'mt-3',
            isNarrow && '-translate-y-1.5 sm:translate-y-0'
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

          <div
            className="flex max-w-[min(100%,280px)] flex-wrap justify-center gap-2"
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
