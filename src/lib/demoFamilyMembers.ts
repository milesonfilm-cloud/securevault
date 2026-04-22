import type { FamilyMember } from '@/lib/storage';
import { MEMBER_AVATAR_COLORS } from '@/lib/memberAvatarColors';

const now = '2025-01-15T10:00:00.000Z';

/** Sample profiles for carousel UI preview — ids prefixed so edit/delete can be disabled */
export const DEMO_FAMILY_MEMBERS: FamilyMember[] = [
  {
    id: 'demo-member-1',
    name: 'Alex Morgan',
    relationship: 'Self',
    dob: '1990-06-12',
    avatarColor: MEMBER_AVATAR_COLORS[0],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'demo-member-2',
    name: 'Jordan Lee',
    relationship: 'Partner',
    dob: '1992-03-22',
    avatarColor: MEMBER_AVATAR_COLORS[2],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'demo-member-3',
    name: 'Sam Rivera',
    relationship: 'Child',
    dob: '2015-11-08',
    avatarColor: MEMBER_AVATAR_COLORS[4],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'demo-member-4',
    name: 'Riley Chen',
    relationship: 'Parent',
    dob: '1962-01-30',
    avatarColor: MEMBER_AVATAR_COLORS[6],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'demo-member-5',
    name: 'Taylor Brooks',
    relationship: 'Sibling',
    dob: '1988-09-14',
    avatarColor: MEMBER_AVATAR_COLORS[8],
    createdAt: now,
    updatedAt: now,
  },
];

export function isDemoMemberId(id: string): boolean {
  return id.startsWith('demo-member-');
}
