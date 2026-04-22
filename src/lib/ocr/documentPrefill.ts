import { CategoryId } from '@/lib/storage';

export interface DocumentPrefill {
  categoryId?: CategoryId;
  title?: string;
  fields?: Record<string, string>;
  notesAppend?: string;
  fromOcr?: boolean;
}
