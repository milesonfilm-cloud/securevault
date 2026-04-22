'use client';

import React from 'react';
import {
  ArrowLeft,
  Bell,
  ThumbsDown,
  ThumbsUp,
  SkipBack,
  Rewind,
  Play,
  FastForward,
  SkipForward,
} from 'lucide-react';
import WellnessBottomNav from './WellnessBottomNav';
import { StretchIllustration, MoodThumbPlaceholder } from './WellnessIllustrations';

export default function PlaylistScreen() {
  const progress = 119 / 279;

  return (
    <div className="relative h-[812px] w-[375px] shrink-0 overflow-hidden rounded-[32px] bg-wellness-bg shadow-[0_8px_40px_rgba(0,0,0,0.1)]">
      <div className="h-full overflow-y-auto pb-28 pl-4 pr-4 pt-4">
        <header className="mb-4 flex items-center justify-between">
          <button type="button" className="p-1 text-wellness-ink" aria-label="Back">
            <ArrowLeft size={22} strokeWidth={2} />
          </button>
          <h1 className="font-wellness-sans text-[16px] font-semibold text-wellness-ink">
            Playlist
          </h1>
          <button type="button" className="p-1 text-wellness-ink" aria-label="Notifications">
            <Bell size={20} strokeWidth={2} />
          </button>
        </header>

        <div
          className="mb-5 flex h-[200px] items-center justify-center overflow-hidden rounded-[20px] shadow-wellness-card"
          style={{ backgroundColor: '#D6E8F0' }}
        >
          <StretchIllustration className="h-[160px] w-[200px]" />
        </div>

        <div className="mb-4 flex items-start justify-between gap-2">
          <button type="button" className="pt-1 text-wellness-muted" aria-label="Thumbs down">
            <ThumbsDown size={22} strokeWidth={1.75} />
          </button>
          <h2 className="font-wellness-serif flex-1 text-center text-[22px] leading-tight text-wellness-ink">
            Night Mood 🌙
          </h2>
          <button type="button" className="pt-1 text-wellness-muted" aria-label="Thumbs up">
            <ThumbsUp size={22} strokeWidth={1.75} />
          </button>
        </div>

        <div className="mb-1 flex justify-between font-wellness-sans text-[11px] text-wellness-muted">
          <span>1:59</span>
          <span>4:39</span>
        </div>
        <div className="relative mb-8 h-[3px] w-full rounded-full bg-[#E0E0E0]">
          <div
            className="absolute left-0 top-0 h-full rounded-full bg-wellness-coral"
            style={{ width: `${progress * 100}%` }}
          />
          <div
            className="absolute top-1/2 h-[10px] w-[10px] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-wellness-coral shadow-sm"
            style={{ left: `${progress * 100}%` }}
          />
        </div>

        <div className="mb-8 flex items-center justify-center gap-5">
          <button type="button" className="text-wellness-ink" aria-label="Skip back">
            <SkipBack size={22} strokeWidth={2} />
          </button>
          <button type="button" className="text-wellness-ink" aria-label="Rewind 10 seconds">
            <Rewind size={24} strokeWidth={2} />
          </button>
          <button
            type="button"
            className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-wellness-teal text-white shadow-wellness-card"
            aria-label="Play"
          >
            <Play size={26} className="ml-0.5 fill-white" strokeWidth={0} />
          </button>
          <button type="button" className="text-wellness-ink" aria-label="Forward 10 seconds">
            <FastForward size={24} strokeWidth={2} />
          </button>
          <button type="button" className="text-wellness-ink" aria-label="Skip forward">
            <SkipForward size={22} strokeWidth={2} />
          </button>
        </div>

        <div className="flex gap-3">
          <div className="flex flex-1 flex-col rounded-[20px] bg-wellness-pink p-3 shadow-wellness-card">
            <div className="mb-2 h-12 w-full overflow-hidden rounded-xl bg-white/40">
              <MoodThumbPlaceholder variant="pink" />
            </div>
            <div className="flex items-center justify-between">
              <span className="font-wellness-sans text-[12px] font-medium text-wellness-ink">
                Morning Mood
              </span>
              <button type="button" className="text-wellness-ink" aria-label="Play Morning Mood">
                <Play size={18} className="fill-wellness-ink" strokeWidth={0} />
              </button>
            </div>
          </div>
          <div className="flex flex-1 flex-col rounded-[20px] bg-wellness-yellow p-3 shadow-wellness-card">
            <div className="mb-2 h-12 w-full overflow-hidden rounded-xl bg-white/40">
              <MoodThumbPlaceholder variant="yellow" />
            </div>
            <div className="flex items-center justify-between">
              <span className="font-wellness-sans text-[12px] font-medium text-wellness-ink">
                Day Mood 🌻
              </span>
              <button type="button" className="text-wellness-ink" aria-label="Play Day Mood">
                <Play size={18} className="fill-wellness-ink" strokeWidth={0} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <WellnessBottomNav active="music" />
    </div>
  );
}
