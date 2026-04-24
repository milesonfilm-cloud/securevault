import type { CategoryId } from '@/lib/storage';

/** Stable message key for a category field (matches messages/*.json under categories.{id}.fields.*). */
export function categoryFieldMsgKey(fieldKey: string): string {
  return fieldKey
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
}

export function categoryLabelMsgKey(id: CategoryId, which: 'label' | 'shortLabel'): string {
  return `categories.${id}.${which}`;
}

export function categoryFieldMsgPath(id: CategoryId, fieldKey: string): string {
  return `categories.${id}.fields.${categoryFieldMsgKey(fieldKey)}`;
}
