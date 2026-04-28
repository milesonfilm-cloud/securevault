export type PlanTier = 'free' | 'pro' | 'elite';

export interface PlanLimits {
  maxMembers: number;
  maxDocuments: number;
  aiScansPerMonth: number;
  cloudBackup: boolean;
  allThemes: boolean;
  emergencyHandover: boolean;
  auditLog: boolean;
  totp2fa: boolean;
  customCategories: boolean;
}

export const PLAN_LIMITS: Record<PlanTier, PlanLimits> = {
  free: {
    maxMembers: 1,
    maxDocuments: 20,
    aiScansPerMonth: 0,
    cloudBackup: false,
    allThemes: false,
    emergencyHandover: false,
    auditLog: false,
    totp2fa: false,
    customCategories: false,
  },
  pro: {
    maxMembers: 6,
    maxDocuments: Infinity,
    aiScansPerMonth: 30,
    cloudBackup: true,
    allThemes: true,
    emergencyHandover: true,
    auditLog: false,
    totp2fa: false,
    customCategories: false,
  },
  elite: {
    maxMembers: Infinity,
    maxDocuments: Infinity,
    aiScansPerMonth: Infinity,
    cloudBackup: true,
    allThemes: true,
    emergencyHandover: true,
    auditLog: true,
    totp2fa: true,
    customCategories: true,
  },
};

const TIER_KEY = 'sv_plan_tier';

export function getCurrentTier(): PlanTier {
  try {
    const stored = localStorage.getItem(TIER_KEY) as PlanTier | null;
    if (stored && stored in PLAN_LIMITS) return stored;
  } catch {
    /* ignore */
  }
  return 'free';
}

export function getPlanLimits(): PlanLimits {
  return PLAN_LIMITS[getCurrentTier()];
}

export function canUseFeature(feature: keyof PlanLimits): boolean {
  const limits = getPlanLimits();
  const val = limits[feature];
  if (typeof val === 'boolean') return val;
  if (typeof val === 'number') return val > 0;
  return false;
}
