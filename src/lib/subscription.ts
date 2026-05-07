import type { VaultSettings } from './storage';

/** Max documents per category for free users. */
export const FREE_DOCS_PER_CATEGORY = 1;

/** Play Store listing URL — update with real package ID when published. */
export const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.securevault.app';

export type Plan = 'free' | 'pro';

export function isPro(settings: VaultSettings): boolean {
  return (settings.plan ?? 'free') === 'pro';
}

/**
 * Returns the categoryId that would be blocked when the user tries to add
 * a document, or null if they are allowed.
 */
export function getBlockedCategory(
  existingDocs: { categoryId: string }[],
  newCategoryId: string,
  settings: VaultSettings
): string | null {
  if (isPro(settings)) return null;
  const count = existingDocs.filter((d) => d.categoryId === newCategoryId).length;
  return count >= FREE_DOCS_PER_CATEGORY ? newCategoryId : null;
}

/** Human-readable list of Pro features for the upgrade page. */
export const PRO_FEATURES = [
  {
    icon: 'Infinity',
    title: 'Unlimited Documents',
    body: 'Store as many documents as you need in every category — no caps.',
  },
  {
    icon: 'CloudUpload',
    title: 'Google Drive Backup',
    body: 'Automatically back up your encrypted vault to Google Drive.',
  },
  {
    icon: 'Share2',
    title: 'Secure Sharing',
    body: 'Share individual documents via time-limited, encrypted links.',
  },
  {
    icon: 'Download',
    title: 'Export Vault',
    body: 'Export your entire vault as an encrypted PDF or JSON bundle.',
  },
  {
    icon: 'Camera',
    title: 'Photo Attachments',
    body: 'Attach scanned images and photos directly to any document.',
  },
  {
    icon: 'Scan',
    title: 'AI Document Scan',
    body: 'Auto-fill document fields by scanning with your camera using AI.',
  },
  {
    icon: 'Bell',
    title: 'Smart Reminders',
    body: 'Get notified before IDs, insurance, and subscriptions expire.',
  },
  {
    icon: 'HeadphonesIcon',
    title: 'Priority Support',
    body: 'Reach our team directly for faster help and feature requests.',
  },
] as const;

export const FREE_FEATURES = [
  '1 document per category',
  'Family member profiles (unlimited)',
  'Category organisation',
  'Basic expiry reminders',
  'PIN / Biometric lock',
  'Fully offline — no data leaves your device',
] as const;
