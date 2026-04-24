'use client';

import { useEffect } from 'react';
import { checkInStreak } from '@/lib/gamification/streaks';

/** Runs daily open streak check once per app session mount. */
export default function GamificationCheckIn() {
  useEffect(() => {
    checkInStreak();
  }, []);
  return null;
}
