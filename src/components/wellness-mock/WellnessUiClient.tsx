'use client';

import React from 'react';
import { Link } from '@/i18n/navigation';
import HomeScreen from './HomeScreen';
import PlaylistScreen from './PlaylistScreen';
import SleepScreen from './SleepScreen';

export default function WellnessUiClient() {
  return (
    <div className="min-h-full bg-wellness-bg p-6 lg:p-10">
      <div className="mb-6 rounded-2xl border border-wellness-teal/30 bg-white/60 px-4 py-3 font-wellness-sans text-sm text-wellness-ink">
        <span className="font-600">Concept UI</span> — this area is a separate mock theme for demos.
        Your vault lives under{' '}
        <Link
          href="/settings-export"
          className="font-600 text-wellness-teal underline underline-offset-2"
        >
          Settings
        </Link>
        .
      </div>
      <p className="mb-6 font-wellness-sans text-[13px] text-wellness-muted">
        Mobile mockups (375px) — sleep & wellness UI reference
      </p>
      <div className="flex flex-wrap items-start justify-center gap-8 lg:gap-10">
        <HomeScreen />
        <PlaylistScreen />
        <SleepScreen />
      </div>
    </div>
  );
}
