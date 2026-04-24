import type { EmergencyContact } from '@/lib/storage';

export function checkIn(contact: EmergencyContact): EmergencyContact {
  return { ...contact, lastCheckInAt: new Date().toISOString() };
}

export function getLastCheckIn(contact: EmergencyContact | null): string | null {
  return contact?.lastCheckInAt?.trim() ? contact.lastCheckInAt : null;
}

/** True if last check-in is older than configured inactivity window. */
export function isTimerExpired(contact: EmergencyContact | null): boolean {
  if (!contact?.lastCheckInAt) return false;
  const last = Date.parse(contact.lastCheckInAt);
  if (!Number.isFinite(last)) return false;
  const ms = contact.inactivityDays * 86400000;
  return Date.now() - last > ms;
}

/** Milliseconds until timer expiry from last check-in (negative if expired). */
export function msUntilDeadline(contact: EmergencyContact | null): number | null {
  if (!contact?.lastCheckInAt) return null;
  const last = Date.parse(contact.lastCheckInAt);
  if (!Number.isFinite(last)) return null;
  const deadline = last + contact.inactivityDays * 86400000;
  return deadline - Date.now();
}

/**
 * MVP: schedule a one-shot alert flag in localStorage when timer crosses (checked on app open).
 * Server email should be triggered from `/api/emergency/notify` when UI detects expiry.
 */
export function scheduleAlertFlag(contact: EmergencyContact | null): void {
  if (!contact?.email) return;
  try {
    localStorage.setItem(
      'sv_emergency_due',
      JSON.stringify({ at: Date.now(), email: contact.email, name: contact.name })
    );
  } catch {
    /* ignore */
  }
}

export function consumeEmergencyDueFlag(): { email: string; name: string } | null {
  try {
    const raw = localStorage.getItem('sv_emergency_due');
    if (!raw) return null;
    localStorage.removeItem('sv_emergency_due');
    const o = JSON.parse(raw) as { email?: string; name?: string };
    if (!o.email) return null;
    return { email: o.email, name: o.name ?? 'Contact' };
  } catch {
    return null;
  }
}
