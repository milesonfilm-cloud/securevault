import type { FamilyMember } from '@/lib/storage';
import { DEMO_FAMILY_MEMBERS } from '@/lib/demoFamilyMembers';

/** Same order as `FamilyManagementContent` / pastel home (real members, then demo). */
export function pastelDisplayMembersOrder(vaultMembers: FamilyMember[]): FamilyMember[] {
  return [...vaultMembers, ...DEMO_FAMILY_MEMBERS];
}

/** Resolve a member id from the vault list or demo profiles (for `?member=` deep links). */
export function resolveMemberProfileById(
  id: string,
  vaultMembers: FamilyMember[]
): FamilyMember | null {
  return (
    vaultMembers.find((m) => m.id === id) ?? DEMO_FAMILY_MEMBERS.find((m) => m.id === id) ?? null
  );
}

export function isResolvableMemberId(id: string, vaultMembers: FamilyMember[]): boolean {
  return resolveMemberProfileById(id, vaultMembers) !== null;
}
