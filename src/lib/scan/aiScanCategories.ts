import type { CategoryId } from '@/lib/storage';

/** Categories supported by AI scan → field extraction (India-first docs). */
export const AI_SCAN_CATEGORY_IDS: CategoryId[] = [
  'government-ids',
  'passport',
  'drivers-license',
  'institutional-docs',
  'insurance',
  'bank-accounts',
  'vehicle-documents',
];

export function isAiScanCategory(id: CategoryId): boolean {
  return (AI_SCAN_CATEGORY_IDS as readonly string[]).includes(id);
}
