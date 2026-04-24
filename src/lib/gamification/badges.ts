import type { VaultData } from '@/lib/storage';
import { EXPIRY_FIELD_KEYS, parseExpiryValue } from '@/lib/documentExpiry';
import { calculateFamilyScore, calculateMemberScore } from '@/lib/gamification/completenessScore';
import { getStreakCount } from '@/lib/gamification/streaks';

export type Badge = {
  id: string;
  name: string;
  description: string;
  icon: string;
};

const MS_DAY = 86400000;

function startOfLocalDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function vaultHasExpiredDoc(data: VaultData): boolean {
  const today = startOfLocalDay(new Date());
  for (const doc of data.documents) {
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

export const BADGE_DEFINITIONS: Array<{
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: (vaultData: VaultData) => boolean;
}> = [
  {
    id: 'first_doc',
    name: 'First steps',
    description: 'Added your first document to the vault.',
    icon: '📄',
    condition: (v) => v.documents.length >= 1,
  },
  {
    id: 'complete_family',
    name: 'Complete family',
    description: 'Every member has all critical document types for their age.',
    icon: '👨‍👩‍👧',
    condition: (v) => {
      if (v.members.length < 2) return false;
      return v.members.every((m) => {
        const docs = v.documents.filter((d) => d.memberId === m.id);
        return calculateMemberScore(m, docs).score >= 100;
      });
    },
  },
  {
    id: 'expiry_zero',
    name: 'No expired docs',
    description: 'No documents with a past expiry date in the vault.',
    icon: '✅',
    condition: (v) => v.documents.length > 0 && !vaultHasExpiredDoc(v),
  },
  {
    id: 'perfect_vault',
    name: 'Perfect vault',
    description: 'Family completeness score reached 100%.',
    icon: '💎',
    condition: (v) =>
      v.members.length > 0 && calculateFamilyScore(v.members, v.documents) >= 100,
  },
  {
    id: 'streak_7',
    name: 'Week warrior',
    description: 'Opened SecureVault 7 days in a row.',
    icon: '🔥',
    condition: () => getStreakCount() >= 7,
  },
  {
    id: 'streak_30',
    name: 'Monthly legend',
    description: '30-day open streak.',
    icon: '🏆',
    condition: () => getStreakCount() >= 30,
  },
  {
    id: 'digilocker_connected',
    name: 'DigiLocker linked',
    description: 'Connected DigiLocker for verified imports.',
    icon: '🪪',
    condition: (v) => !!v.settings.digilockerConnectedAt,
  },
  {
    id: 'cloud_synced',
    name: 'Cloud backup',
    description: 'Enabled cloud sync for your vault.',
    icon: '☁️',
    condition: (v) => v.settings.cloudSyncEnabled === true,
  },
  {
    id: 'share_master',
    name: 'Share master',
    description: 'Created at least 3 time-limited share links.',
    icon: '🔗',
    condition: (v) => v.shareLinks.length >= 3,
  },
];

/** Badges newly earned compared to `vaultData.streakData.badges`. */
export function checkBadgeUnlocks(vaultData: VaultData): Badge[] {
  const earned = new Set(vaultData.streakData.badges);
  return BADGE_DEFINITIONS.filter((d) => !earned.has(d.id) && d.condition(vaultData)).map(
    ({ id, name, description, icon }) => ({ id, name, description, icon })
  );
}

export function allBadgeIds(): string[] {
  return BADGE_DEFINITIONS.map((d) => d.id);
}
