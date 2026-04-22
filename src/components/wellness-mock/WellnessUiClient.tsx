'use client';

import React from 'react';
import HomeScreen from './HomeScreen';
import PlaylistScreen from './PlaylistScreen';
import SleepScreen from './SleepScreen';

export default function WellnessUiClient() {
  return (
    <div className="min-h-full bg-wellness-bg p-6 lg:p-10">
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
