/**
 * Browser notifications for document expiry (30 / 7 / 1 days before).
 * Combines: persisted schedule + main-thread tick + best-effort service worker timers.
 */

import type { Document } from '@/lib/storage';
import type { VaultSettings } from '@/lib/storage';
import { EXPIRY_FIELD_KEYS, parseExpiryValue } from '@/lib/documentExpiry';

const SCHEDULE_KEY = 'sv_expiry_notif_schedule_v1';
const FIRED_KEY = 'sv_expiry_notif_fired_v1';
const HOUR_9 = 9 * 60 * 60 * 1000;

function startOfLocalDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function localNineAmOn(day: Date): number {
  const s = startOfLocalDay(day);
  return s.getTime() + HOUR_9;
}

type ScheduleEntry = {
  id: string;
  docId: string;
  title: string;
  when: number;
  kind: '30' | '7' | '1';
};

function loadSchedule(): ScheduleEntry[] {
  try {
    const raw = localStorage.getItem(SCHEDULE_KEY);
    if (!raw) return [];
    const p = JSON.parse(raw) as ScheduleEntry[];
    return Array.isArray(p) ? p : [];
  } catch {
    return [];
  }
}

function saveSchedule(entries: ScheduleEntry[]): void {
  try {
    localStorage.setItem(SCHEDULE_KEY, JSON.stringify(entries));
  } catch {
    /* ignore */
  }
}

function loadFired(): Set<string> {
  try {
    const raw = localStorage.getItem(FIRED_KEY);
    if (!raw) return new Set();
    const p = JSON.parse(raw) as string[];
    return new Set(Array.isArray(p) ? p : []);
  } catch {
    return new Set();
  }
}

function saveFired(s: Set<string>): void {
  try {
    localStorage.setItem(FIRED_KEY, JSON.stringify([...s]));
  } catch {
    /* ignore */
  }
}

/** Build fire timestamps at 9:00 local on (expiry - N days). */
export function rescheduleExpiryReminders(
  documents: Document[],
  settings: Pick<VaultSettings, 'notificationsEnabled'>
): void {
  if (typeof window === 'undefined' || !settings.notificationsEnabled) {
    saveSchedule([]);
    return;
  }

  const now = Date.now();
  const entries: ScheduleEntry[] = [];

  for (const doc of documents) {
    for (const key of EXPIRY_FIELD_KEYS) {
      const raw = doc.fields[key];
      if (!raw?.trim()) continue;
      const exp = parseExpiryValue(raw);
      if (!exp) continue;
      const expiryDay = startOfLocalDay(exp);

      for (const offset of [30, 7, 1] as const) {
        const fireDay = new Date(expiryDay);
        fireDay.setDate(fireDay.getDate() - offset);
        const when = localNineAmOn(fireDay);
        if (when <= now) continue;
        const kind = offset === 30 ? '30' : offset === 7 ? '7' : '1';
        entries.push({
          id: `${doc.id}:${key}:${kind}`,
          docId: doc.id,
          title: doc.title,
          when,
          kind,
        });
      }
    }
  }

  entries.sort((a, b) => a.when - b.when);
  saveSchedule(entries);

  void postSchedulesToServiceWorker(entries);
}

async function postSchedulesToServiceWorker(entries: ScheduleEntry[]): Promise<void> {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;
  try {
    const reg = await navigator.serviceWorker.ready;
    for (const e of entries.slice(0, 24)) {
      const days =
        e.kind === '30' ? 30 : e.kind === '7' ? 7 : 1;
      reg.active?.postMessage({
        type: 'SCHEDULE_NOTIFY',
        when: e.when,
        title: 'SecureVault',
        body: `Your ${e.title} expires in ${days} day${days === 1 ? '' : 's'} — Open SecureVault`,
      });
    }
  } catch {
    /* ignore */
  }
}

function showDueNotifications(): void {
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
  const entries = loadSchedule();
  if (entries.length === 0) return;
  const now = Date.now();
  const fired = loadFired();
  const remaining: ScheduleEntry[] = [];
  for (const e of entries) {
    if (e.when > now) {
      remaining.push(e);
      continue;
    }
    if (fired.has(e.id)) continue;
    fired.add(e.id);
    const days = e.kind === '30' ? 30 : e.kind === '7' ? 7 : 1;
    try {
      new Notification('SecureVault', {
        body: `Your ${e.title} expires in ${days} day${days === 1 ? '' : 's'} — Open SecureVault`,
        icon: '/brand/vault-mark.svg',
      });
    } catch {
      /* ignore */
    }
  }
  saveFired(fired);
  saveSchedule(remaining);
}

let tickerStarted = false;

export function ensureExpiryReminderTicker(): void {
  if (typeof window === 'undefined' || tickerStarted) return;
  tickerStarted = true;
  window.setInterval(() => showDueNotifications(), 60_000);
  showDueNotifications();
}

/** Call when user dismisses the expiry banner — one-time permission prompt. */
export function requestNotificationPermissionOnFirstExpiryDismiss(): void {
  try {
    if (typeof Notification === 'undefined') return;
    if (localStorage.getItem('sv_expiry_notif_prompted') === '1') return;
    localStorage.setItem('sv_expiry_notif_prompted', '1');
    if (Notification.permission === 'default') void Notification.requestPermission();
  } catch {
    /* ignore */
  }
}

export async function registerExpiryServiceWorker(): Promise<void> {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;
  try {
    await navigator.serviceWorker.register('/sw.js');
  } catch {
    /* ignore */
  }
}

/** For nav badge: docs expired or expiring within 30 days. */
export function countRenewalBadgeDocuments(
  documents: Document[],
  warnWithinDays: number
): number {
  const seen = new Set<string>();
  const today = startOfLocalDay(new Date());
  for (const doc of documents) {
    for (const key of EXPIRY_FIELD_KEYS) {
      const raw = doc.fields[key];
      if (!raw?.trim()) continue;
      const exp = parseExpiryValue(raw);
      if (!exp) continue;
      const expiryDay = startOfLocalDay(exp);
      const daysUntil = Math.round((expiryDay.getTime() - today.getTime()) / 86400000);
      if (daysUntil <= warnWithinDays) {
        seen.add(doc.id);
        break;
      }
    }
  }
  return seen.size;
}
