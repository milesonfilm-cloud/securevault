import type { Document, VaultData } from '@/lib/storage';
import { getCategoryById } from '@/lib/categories';
import { EXPIRY_FIELD_KEYS, parseExpiryValue } from '@/lib/documentExpiry';

const MS_DAY = 86400000;

function startOfLocalDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function memberDocs(memberId: string, documents: Document[]): Document[] {
  return documents.filter((d) => d.memberId === memberId);
}

/** Critical coverage slots (0–1 per member). */
function criticalSlotFilled(slot: string, docs: Document[]): boolean {
  const t = (d: Document) => `${d.title} ${JSON.stringify(d.fields)}`.toLowerCase();
  switch (slot) {
    case 'aadhaar':
      return docs.some(
        (d) =>
          d.categoryId === 'government-ids' &&
          (/aadhaar/i.test(d.title) || /aadhaar/i.test(d.fields['Document Type'] ?? ''))
      );
    case 'pan':
      return docs.some(
        (d) =>
          d.categoryId === 'government-ids' &&
          (/pan/i.test(d.title) || /pan card/i.test(d.fields['Document Type'] ?? ''))
      );
    case 'passport':
      return docs.some(
        (d) =>
          d.categoryId === 'passport' ||
          (d.categoryId === 'government-ids' && /passport/i.test(d.fields['Document Type'] ?? ''))
      );
    case 'dl':
      return docs.some((d) => d.categoryId === 'drivers-license');
    case 'health_insurance':
      return docs.some(
        (d) =>
          d.categoryId === 'insurance' &&
          /health|medical|mediclaim/i.test(`${d.title} ${d.fields['Policy Type'] ?? ''}`)
      );
    case 'bank':
      return docs.some((d) => d.categoryId === 'bank-accounts');
    default:
      return false;
  }
}

const CRITICAL_SLOTS = [
  'aadhaar',
  'pan',
  'passport',
  'dl',
  'health_insurance',
  'bank',
] as const;

export function getMissingCriticalDocs(data: VaultData): { memberId: string; memberName: string; missing: string[] }[] {
  const out: { memberId: string; memberName: string; missing: string[] }[] = [];
  for (const m of data.members) {
    const docs = memberDocs(m.id, data.documents);
    const missing: string[] = [];
    for (const slot of CRITICAL_SLOTS) {
      if (!criticalSlotFilled(slot, docs)) missing.push(slot.replace(/_/g, ' '));
    }
    if (missing.length) out.push({ memberId: m.id, memberName: m.name, missing });
  }
  return out;
}

function fieldsFilledRatio(documents: Document[]): number {
  if (documents.length === 0) return 1;
  let total = 0;
  let filled = 0;
  for (const d of documents) {
    const cat = getCategoryById(d.categoryId);
    if (!cat) continue;
    for (const f of cat.fields) {
      if (!f.required) continue;
      total += 1;
      const v = d.fields[f.key];
      if (v != null && String(v).trim() !== '') filled += 1;
    }
  }
  return total === 0 ? 1 : filled / total;
}

function hasAnyExpiredDoc(documents: Document[]): boolean {
  const today = startOfLocalDay(new Date());
  for (const doc of documents) {
    for (const key of EXPIRY_FIELD_KEYS) {
      const raw = doc.fields[key];
      if (!raw?.trim()) continue;
      const exp = parseExpiryValue(raw);
      if (!exp) continue;
      const expiryDay = startOfLocalDay(exp);
      const days = Math.round((expiryDay.getTime() - today.getTime()) / MS_DAY);
      if (days < 0) return true;
    }
  }
  return false;
}

function photosRatio(documents: Document[], withPhotos: Set<string>): number {
  if (documents.length === 0) return 1;
  let n = 0;
  for (const d of documents) {
    if (withPhotos.has(d.id)) n += 1;
  }
  return n / documents.length;
}

export type VaultHealthScoreResult = {
  score: number;
  criticalAvg: number;
  fieldsFilledPct: number;
  expiredPenalty: number;
  photosPct: number;
};

/**
 * Score 0–100: critical coverage (40) + fields filled (30) + no expired (20) + photos (10).
 */
export function calculateVaultHealthScore(
  data: VaultData,
  docIdsWithPhotos: Set<string>
): VaultHealthScoreResult {
  const members = data.members;
  let criticalSum = 0;
  if (members.length === 0) {
    criticalSum = 1;
  } else {
    for (const m of members) {
      const docs = memberDocs(m.id, data.documents);
      let filled = 0;
      for (const slot of CRITICAL_SLOTS) {
        if (criticalSlotFilled(slot, docs)) filled += 1;
      }
      criticalSum += filled / CRITICAL_SLOTS.length;
    }
    criticalSum /= members.length;
  }

  const fieldsFilledPct = fieldsFilledRatio(data.documents);
  const noExpired = !hasAnyExpiredDoc(data.documents);
  const photosPct = photosRatio(data.documents, docIdsWithPhotos);

  const partCritical = criticalSum * 40;
  const partFields = fieldsFilledPct * 30;
  const partExpiry = noExpired ? 20 : 0;
  const partPhotos = photosPct * 10;

  const score = Math.round(
    Math.min(100, Math.max(0, partCritical + partFields + partExpiry + partPhotos))
  );

  return {
    score,
    criticalAvg: criticalSum,
    fieldsFilledPct,
    expiredPenalty: noExpired ? 0 : 20,
    photosPct,
  };
}
