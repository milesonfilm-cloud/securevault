import type { FamilyMember } from '@/lib/storage';

/**
 * Production ships with no demo members. The empty array is kept (instead of
 * deleting the file outright) because several components still import
 * `DEMO_FAMILY_MEMBERS` and `isDemoMemberId` defensively. With an empty list
 * the helpers become no-ops and the empty-state UX takes over.
 */
export const DEMO_FAMILY_MEMBERS: FamilyMember[] = [];

export function isDemoMemberId(id: string): boolean {
  return id.startsWith('demo-member-');
}
