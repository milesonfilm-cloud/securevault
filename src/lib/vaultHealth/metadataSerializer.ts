import type { Document, VaultData } from '@/lib/storage';
import { getCategoryById } from '@/lib/categories';
import { EXPIRY_FIELD_KEYS, parseExpiryValue } from '@/lib/documentExpiry';

export type VaultHealthMetadata = {
  members: { id: string; name: string; relationship: string }[];
  documents: {
    id: string;
    memberId: string;
    memberName: string;
    title: string;
    categoryId: string;
    emptyFieldKeys: string[];
    nearestExpiryDays: number | null;
  }[];
};

function startOfLocalDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function nearestExpiryDaysForDoc(doc: Document): number | null {
  const today = startOfLocalDay(new Date());
  let best: number | null = null;
  for (const key of EXPIRY_FIELD_KEYS) {
    const raw = doc.fields[key];
    if (!raw?.trim()) continue;
    const exp = parseExpiryValue(raw);
    if (!exp) continue;
    const expiryDay = startOfLocalDay(exp);
    const days = Math.round((expiryDay.getTime() - today.getTime()) / 86400000);
    if (best === null || days < best) best = days;
  }
  return best;
}

export function buildVaultHealthMetadata(data: VaultData): VaultHealthMetadata {
  const memberMap = new Map(data.members.map((m) => [m.id, m]));

  const documents = data.documents.map((d) => {
    const cat = getCategoryById(d.categoryId);
    const emptyFieldKeys: string[] = [];
    if (cat) {
      for (const f of cat.fields) {
        if (!f.required) continue;
        const v = d.fields[f.key];
        if (v == null || String(v).trim() === '') emptyFieldKeys.push(f.key);
      }
    }
    const mem = memberMap.get(d.memberId);
    return {
      id: d.id,
      memberId: d.memberId,
      memberName: mem?.name ?? 'Unknown',
      title: d.title,
      categoryId: d.categoryId,
      emptyFieldKeys,
      nearestExpiryDays: nearestExpiryDaysForDoc(d),
    };
  });

  return {
    members: data.members.map((m) => ({
      id: m.id,
      name: m.name,
      relationship: m.relationship,
    })),
    documents,
  };
}
