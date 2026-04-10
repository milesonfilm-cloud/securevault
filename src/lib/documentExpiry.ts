import type { Document } from '@/lib/storage';
import { getCategoryById } from '@/lib/categories';

/** Alert when expiry falls on or before this many days from today (inclusive). */
export const DEFAULT_EXPIRY_WARN_DAYS = 30;

/** Field keys across categories that represent an expiry / maturity date */
export const EXPIRY_FIELD_KEYS = [
  'Expiry Date',
  'Expiry',
  'End / Maturity Date',
  'Insurance Expiry',
  'PUC Expiry',
] as const;

export type ExpiryFieldKey = (typeof EXPIRY_FIELD_KEYS)[number];

export interface DocumentExpiryAlert {
  docId: string;
  title: string;
  memberId: string;
  categoryId: Document['categoryId'];
  fieldKey: string;
  fieldLabel: string;
  rawValue: string;
  /** Calendar day of expiry (local) */
  expiryDay: Date;
  /** Negative = expired, 0 = today, positive = days remaining */
  daysUntil: number;
}

const MS_PER_DAY = 86400000;

function startOfLocalDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/**
 * Parse user-entered expiry values: ISO date, DD/MM/YYYY, MM/YYYY (card), etc.
 */
export function parseExpiryValue(raw: string): Date | null {
  const t = raw?.trim();
  if (!t) return null;

  if (/^\d{4}-\d{2}-\d{2}/.test(t)) {
    const iso = t.slice(0, 10);
    const [y, m, d] = iso.split('-').map(Number);
    const dt = new Date(y, m - 1, d);
    return Number.isNaN(dt.getTime()) ? null : dt;
  }

  const mmYyyy = t.match(/^(\d{1,2})[/-](\d{4})$/);
  if (mmYyyy) {
    const month = parseInt(mmYyyy[1], 10) - 1;
    const year = parseInt(mmYyyy[2], 10);
    if (month >= 0 && month <= 11 && year > 1900) {
      return new Date(year, month + 1, 0);
    }
  }

  const dmy = t.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (dmy) {
    const day = parseInt(dmy[1], 10);
    const month = parseInt(dmy[2], 10) - 1;
    const year = parseInt(dmy[3], 10);
    const dt = new Date(year, month, day);
    return Number.isNaN(dt.getTime()) ? null : dt;
  }

  const parsed = new Date(t);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function fieldLabelForKey(categoryId: Document['categoryId'], fieldKey: string): string {
  const cat = getCategoryById(categoryId);
  const f = cat?.fields.find((x) => x.key === fieldKey);
  return f?.label ?? fieldKey;
}

/**
 * Documents with expiry on or before `warnWithinDays` from today (local), or already expired.
 */
export function collectExpiryAlerts(
  documents: Document[],
  warnWithinDays: number
): DocumentExpiryAlert[] {
  const today = startOfLocalDay(new Date());
  const alerts: DocumentExpiryAlert[] = [];

  for (const doc of documents) {
    for (const key of EXPIRY_FIELD_KEYS) {
      const raw = doc.fields[key];
      if (!raw?.trim()) continue;

      const exp = parseExpiryValue(raw);
      if (!exp) continue;

      const expiryDay = startOfLocalDay(exp);
      const daysUntil = Math.round((expiryDay.getTime() - today.getTime()) / MS_PER_DAY);

      if (daysUntil <= warnWithinDays) {
        alerts.push({
          docId: doc.id,
          title: doc.title,
          memberId: doc.memberId,
          categoryId: doc.categoryId,
          fieldKey: key,
          fieldLabel: fieldLabelForKey(doc.categoryId, key),
          rawValue: raw,
          expiryDay,
          daysUntil,
        });
      }
    }
  }

  alerts.sort((a, b) => a.daysUntil - b.daysUntil);
  return alerts;
}

export function formatExpirySummary(daysUntil: number): string {
  if (daysUntil < 0)
    return `Expired ${Math.abs(daysUntil)} day${Math.abs(daysUntil) === 1 ? '' : 's'} ago`;
  if (daysUntil === 0) return 'Expires today';
  if (daysUntil === 1) return 'Expires tomorrow';
  return `Expires in ${daysUntil} days`;
}

/** Worst case among all expiry fields on this document (for list badges). */
export function getDocumentExpiryUrgency(
  doc: Document,
  warnWithinDays: number
): 'expired' | 'soon' | null {
  const today = startOfLocalDay(new Date());
  let worst: 'expired' | 'soon' | null = null;

  for (const key of EXPIRY_FIELD_KEYS) {
    const raw = doc.fields[key];
    if (!raw?.trim()) continue;
    const exp = parseExpiryValue(raw);
    if (!exp) continue;
    const expiryDay = startOfLocalDay(exp);
    const daysUntil = Math.round((expiryDay.getTime() - today.getTime()) / MS_PER_DAY);
    if (daysUntil < 0) worst = 'expired';
    else if (daysUntil <= warnWithinDays && worst !== 'expired') worst = 'soon';
  }

  return worst;
}

/** Unique document counts for icon badges (expired vs expiring within window). */
export function summarizeExpiryDocCounts(
  documents: Document[],
  warnWithinDays: number
): { expired: number; soon: number } {
  const alerts = collectExpiryAlerts(documents, warnWithinDays);
  const expiredIds = new Set<string>();
  const soonIds = new Set<string>();
  for (const a of alerts) {
    if (a.daysUntil < 0) expiredIds.add(a.docId);
    else soonIds.add(a.docId);
  }
  return { expired: expiredIds.size, soon: soonIds.size };
}

/**
 * Ordered unique doc ids for navigation (same order as collectExpiryAlerts: worst first).
 */
export function listDocIdsByExpirySeverity(
  documents: Document[],
  warnWithinDays: number
): { expired: string[]; soon: string[] } {
  const alerts = collectExpiryAlerts(documents, warnWithinDays);
  const expired: string[] = [];
  const soon: string[] = [];
  const seenE = new Set<string>();
  const seenS = new Set<string>();
  for (const a of alerts) {
    if (a.daysUntil < 0 && !seenE.has(a.docId)) {
      seenE.add(a.docId);
      expired.push(a.docId);
    }
  }
  for (const a of alerts) {
    if (a.daysUntil >= 0 && !seenS.has(a.docId)) {
      seenS.add(a.docId);
      soon.push(a.docId);
    }
  }
  return { expired, soon };
}
