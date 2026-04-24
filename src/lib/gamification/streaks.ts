export const STREAK_KEY = 'sv_streak';

/** Daily open streak (localStorage); distinct from `storage.StreakData`. */
export type AppStreakState = {
  currentStreak: number;
  longestStreak: number;
  /** Local calendar day key YYYY-MM-DD of last successful check-in. */
  lastCheckIn: string;
  totalDaysUsed: number;
};

function defaultStreakData(): AppStreakState {
  return {
    currentStreak: 0,
    longestStreak: 0,
    lastCheckIn: '',
    totalDaysUsed: 0,
  };
}

function localDayKey(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function prevLocalDayKey(dayKey: string): string {
  const [y, mo, da] = dayKey.split('-').map(Number);
  const d = new Date(y, mo - 1, da);
  d.setDate(d.getDate() - 1);
  return localDayKey(d);
}

function readState(): AppStreakState {
  if (typeof window === 'undefined') return defaultStreakData();
  try {
    const raw = localStorage.getItem(STREAK_KEY);
    if (!raw) return defaultStreakData();
    const p = JSON.parse(raw) as Partial<AppStreakState>;
    return {
      currentStreak: typeof p.currentStreak === 'number' ? p.currentStreak : 0,
      longestStreak: typeof p.longestStreak === 'number' ? p.longestStreak : 0,
      lastCheckIn: typeof p.lastCheckIn === 'string' ? p.lastCheckIn : '',
      totalDaysUsed: typeof p.totalDaysUsed === 'number' ? p.totalDaysUsed : 0,
    };
  } catch {
    return defaultStreakData();
  }
}

function writeState(s: AppStreakState) {
  try {
    localStorage.setItem(STREAK_KEY, JSON.stringify(s));
  } catch {
    /* private mode */
  }
}

/**
 * Call once per app open. Only advances streak once per local calendar day.
 */
export function checkInStreak(): AppStreakState {
  if (typeof window === 'undefined') return defaultStreakData();

  const today = localDayKey();
  let s = readState();

  if (s.lastCheckIn === today) {
    return s;
  }

  if (!s.lastCheckIn) {
    s = {
      currentStreak: 1,
      longestStreak: Math.max(1, s.longestStreak),
      lastCheckIn: today,
      totalDaysUsed: s.totalDaysUsed + 1,
    };
    writeState(s);
    return s;
  }

  const yesterday = prevLocalDayKey(today);
  if (s.lastCheckIn === yesterday) {
    s.currentStreak += 1;
  } else {
    s.currentStreak = 1;
  }

  s.longestStreak = Math.max(s.longestStreak, s.currentStreak);
  s.lastCheckIn = today;
  s.totalDaysUsed += 1;
  writeState(s);
  return s;
}

export function getStreakCount(): number {
  return readState().currentStreak;
}

export function getStreakData(): AppStreakState {
  return readState();
}
