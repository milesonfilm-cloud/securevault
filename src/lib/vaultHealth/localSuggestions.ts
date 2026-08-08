import type { VaultData } from '@/lib/storage';
import { EXPIRY_FIELD_KEYS, parseExpiryValue } from '@/lib/documentExpiry';
import { getMissingCriticalDocs } from './scoreCalculator';

const MS_DAY = 86400000;

function startOfLocalDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** On-device checklist tips (no network). */
export function buildLocalHealthSuggestions(data: VaultData): string[] {
  const tips: string[] = [];

  for (const { memberName, missing } of getMissingCriticalDocs(data)) {
    const list = missing.slice(0, 3).join(', ');
    tips.push(`Add ${list}${missing.length > 3 ? '…' : ''} for ${memberName}.`);
  }

  const today = startOfLocalDay(new Date());
  for (const doc of data.documents) {
    for (const key of EXPIRY_FIELD_KEYS) {
      const raw = doc.fields[key];
      if (!raw?.trim()) continue;
      const exp = parseExpiryValue(raw);
      if (!exp) continue;
      const days = Math.round((startOfLocalDay(exp).getTime() - today.getTime()) / MS_DAY);
      if (days >= 0 && days <= 60) {
        tips.push(
          `${doc.title} expires in ${days} day${days === 1 ? '' : 's'} — plan renewal.`
        );
        break;
      }
    }
    if (tips.length >= 8) break;
  }

  if (data.members.length === 0) {
    tips.push('Add a family member profile to start your vault.');
  } else if (data.documents.length === 0) {
    tips.push('Add your first document from the vault.');
  }

  if (tips.length === 0) {
    tips.push('Your checklist looks good — keep expiry dates up to date.');
  }

  return tips.slice(0, 8);
}
