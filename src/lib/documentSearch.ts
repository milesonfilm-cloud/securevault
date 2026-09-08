import { getCategoryById } from '@/lib/categories';
import type { Document } from '@/lib/storage';

export type DocumentSearchMatchReason =
  | { type: 'title' }
  | { type: 'field'; label: string; value: string }
  | { type: 'notes' }
  | { type: 'tag'; tag: string }
  | { type: 'category' }
  | { type: 'member' };

export interface DocumentSearchMatch {
  document: Document;
  reasons: DocumentSearchMatchReason[];
}

function includesQuery(text: string | undefined | null, q: string): boolean {
  return Boolean(text && text.toLowerCase().includes(q));
}

function pushFieldReason(
  reasons: DocumentSearchMatchReason[],
  label: string,
  value: string,
  q: string
): void {
  const labelMatch = includesQuery(label, q);
  const valueMatch = includesQuery(value, q);
  if (!labelMatch && !valueMatch) return;
  const already = reasons.some(
    (r) => r.type === 'field' && r.label === label && r.value === (value || '—')
  );
  if (already) return;
  reasons.push({ type: 'field', label, value: value || '—' });
}

/** Match a document against query (title, field names/labels, field values, notes, tags, category). */
export function getDocumentSearchMatch(doc: Document, q: string): DocumentSearchMatch | null {
  const query = q.trim().toLowerCase();
  if (!query) return null;

  const reasons: DocumentSearchMatchReason[] = [];

  if (includesQuery(doc.title, query)) {
    reasons.push({ type: 'title' });
  }

  const cat = getCategoryById(doc.categoryId);
  if (cat) {
    if (includesQuery(cat.label, query) || includesQuery(cat.shortLabel, query)) {
      reasons.push({ type: 'category' });
    }

    const configuredKeys = new Set<string>();
    for (const field of cat.fields) {
      configuredKeys.add(field.key);
      const value = doc.fields[field.key] ?? '';
      if (includesQuery(field.key, query) || includesQuery(field.label, query)) {
        pushFieldReason(reasons, field.label, value, query);
      } else if (includesQuery(value, query)) {
        pushFieldReason(reasons, field.label, value, query);
      }
    }

    for (const [key, value] of Object.entries(doc.fields)) {
      if (configuredKeys.has(key)) continue;
      if (includesQuery(key, query) || includesQuery(value, query)) {
        pushFieldReason(reasons, key, value, query);
      }
    }
  } else {
    for (const [key, value] of Object.entries(doc.fields)) {
      if (includesQuery(key, query) || includesQuery(value, query)) {
        pushFieldReason(reasons, key, value, query);
      }
    }
  }

  if (includesQuery(doc.notes, query)) {
    reasons.push({ type: 'notes' });
  }

  for (const tag of doc.tags) {
    if (includesQuery(tag, query)) {
      reasons.push({ type: 'tag', tag });
    }
  }

  return reasons.length > 0 ? { document: doc, reasons } : null;
}

export function documentMatchesSearch(doc: Document, q: string): boolean {
  return getDocumentSearchMatch(doc, q) !== null;
}

export function memberMatchesSearch(
  member: { name: string; relationship: string },
  docs: Document[],
  q: string
): boolean {
  const query = q.trim().toLowerCase();
  if (!query) return true;
  if (includesQuery(member.name, query) || includesQuery(member.relationship, query)) {
    return true;
  }
  return docs.some((d) => documentMatchesSearch(d, query));
}

export interface MemberDocumentSearchHit {
  memberId: string;
  memberName: string;
  match: DocumentSearchMatch;
}

/** Collect document hits across members (includes all docs when member name matches). */
export function collectMemberDocumentSearchHits(
  members: { id: string; name: string; relationship: string }[],
  documentsByMemberId: (id: string) => Document[],
  q: string
): MemberDocumentSearchHit[] {
  const query = q.trim().toLowerCase();
  if (!query) return [];

  const hits: MemberDocumentSearchHit[] = [];

  for (const member of members) {
    const docs = documentsByMemberId(member.id);
    const memberNameMatch =
      includesQuery(member.name, query) || includesQuery(member.relationship, query);

    for (const doc of docs) {
      const match = getDocumentSearchMatch(doc, query);
      if (match) {
        hits.push({ memberId: member.id, memberName: member.name, match });
      } else if (memberNameMatch) {
        hits.push({
          memberId: member.id,
          memberName: member.name,
          match: { document: doc, reasons: [{ type: 'member' }] },
        });
      }
    }
  }

  return hits.sort((a, b) => a.match.document.title.localeCompare(b.match.document.title));
}

/** Message key + values for displaying why a document matched. */
export function getSearchMatchHint(reason: DocumentSearchMatchReason): {
  key: string;
  values?: Record<string, string>;
} {
  switch (reason.type) {
    case 'title':
      return { key: 'searchMatchDocument' };
    case 'field':
      return { key: 'searchMatchField', values: { field: reason.label, value: reason.value } };
    case 'notes':
      return { key: 'searchMatchNotes' };
    case 'tag':
      return { key: 'searchMatchTag', values: { tag: reason.tag } };
    case 'category':
      return { key: 'searchMatchCategory' };
    case 'member':
      return { key: 'searchMatchMember' };
    default:
      return { key: 'searchMatchDocument' };
  }
}
