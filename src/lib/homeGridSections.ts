import type { CategoryId } from './storage';

export type HomeGridSectionId =
  | 'identity-access'
  | 'finance-banking'
  | 'travel-vehicles'
  | 'records-legal'
  | 'profile-other';

export interface HomeGridSection {
  id: HomeGridSectionId;
  title: string;
  /** Section accent (folder cards use per-category colors from `CATEGORIES` where relevant). */
  color: string;
  categoryIds: CategoryId[];
}

/**
 * Consolidates all 19 SecureVault categories into 5 home-grid sections.
 */
/** Saturated “icon sheet” hues — pair with glass + gradients in Spectrum home UI */
export const HOME_GRID_SECTIONS: HomeGridSection[] = [
  {
    id: 'identity-access',
    title: 'Identity & Access',
    color: '#FF7B4A',
    categoryIds: ['password-vault', 'government-ids', 'passport', 'drivers-license'],
  },
  {
    id: 'finance-banking',
    title: 'Finance & Banking',
    color: '#0EA5E9',
    categoryIds: ['bank-accounts', 'credit-debit-cards', 'insurance', 'subscription'],
  },
  {
    id: 'travel-vehicles',
    title: 'Travel & Vehicles',
    color: '#FBBF24',
    categoryIds: ['vehicle-documents', 'visa', 'permit'],
  },
  {
    id: 'records-legal',
    title: 'Records & Legal',
    color: '#EC4899',
    categoryIds: ['medical-record', 'certificate', 'contract', 'warranty'],
  },
  {
    id: 'profile-other',
    title: 'Profile & Other',
    color: '#A855F7',
    categoryIds: ['family-profiles', 'membership', 'institutional-docs', 'other'],
  },
];

export function getSectionIdForCategory(categoryId: CategoryId): HomeGridSectionId | null {
  const sec = HOME_GRID_SECTIONS.find((s) => s.categoryIds.includes(categoryId));
  return sec?.id ?? null;
}
