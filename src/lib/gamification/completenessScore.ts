import type { CategoryId, Document, FamilyMember } from '@/lib/storage';

export const CRITICAL_DOCS_ADULT: CategoryId[] = [
  'government-ids',
  'bank-accounts',
  'insurance',
  'passport',
  'drivers-license',
  'password-vault',
];

export const CRITICAL_DOCS_CHILD: CategoryId[] = [
  'government-ids',
  'certificate',
  'medical-record',
];

const CHILD_REL = /^(son|daughter|child)\b/i;

export function isChildMember(member: FamilyMember): boolean {
  const rel = member.relationship?.trim() ?? '';
  if (CHILD_REL.test(rel)) return true;
  if (!member.dob?.trim()) return false;
  const born = new Date(member.dob);
  if (Number.isNaN(born.getTime())) return false;
  const ageMs = Date.now() - born.getTime();
  const ageYears = ageMs / (365.25 * 24 * 60 * 60 * 1000);
  return ageYears < 18;
}

export function criticalCategoriesForMember(member: FamilyMember): CategoryId[] {
  return isChildMember(member) ? CRITICAL_DOCS_CHILD : CRITICAL_DOCS_ADULT;
}

export function calculateMemberScore(
  member: FamilyMember,
  memberDocs: Document[]
): {
  score: number;
  missing: CategoryId[];
  docScores: Record<string, number>;
} {
  const critical = criticalCategoriesForMember(member);
  const docScores: Record<string, number> = {};
  const missing: CategoryId[] = [];
  const weight = critical.length > 0 ? 100 / critical.length : 0;

  for (const catId of critical) {
    const has = memberDocs.some((d) => d.categoryId === catId);
    docScores[catId] = has ? Math.round(weight) : 0;
    if (!has) missing.push(catId);
  }

  const score =
    critical.length === 0 ? 100 : Math.round(((critical.length - missing.length) / critical.length) * 100);

  return { score, missing, docScores };
}

export function calculateFamilyScore(members: FamilyMember[], allDocs: Document[]): number {
  if (members.length === 0) return 0;
  let sum = 0;
  for (const m of members) {
    const docs = allDocs.filter((d) => d.memberId === m.id);
    sum += calculateMemberScore(m, docs).score;
  }
  return Math.round(sum / members.length);
}

/** Category ids missing most often across the family (for dashboard hints). */
export function topMissingCategories(
  members: FamilyMember[],
  allDocs: Document[],
  limit = 2
): CategoryId[] {
  const counts = new Map<CategoryId, number>();
  for (const m of members) {
    const docs = allDocs.filter((d) => d.memberId === m.id);
    const { missing } = calculateMemberScore(m, docs);
    for (const id of missing) {
      counts.set(id, (counts.get(id) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id]) => id);
}
