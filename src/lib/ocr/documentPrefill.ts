import { CategoryId } from '@/lib/storage';

export interface DocumentPrefill {
  categoryId?: CategoryId;
  title?: string;
  fields?: Record<string, string>;
  notesAppend?: string;
  fromOcr?: boolean;
  /** Set when fields came from AI scan + Claude extraction */
  fromAiScan?: boolean;
  /** Field keys that were filled by AI (show “AI filled” badge until save) */
  aiFilledFieldKeys?: string[];
  /** Per-field model confidence 0–1 */
  aiConfidence?: Record<string, number>;
}
