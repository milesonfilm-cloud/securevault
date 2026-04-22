import { getCategoryById } from '@/lib/categories';
import { HOME_GRID_SECTIONS } from '@/lib/homeGridSections';
import type { HomeGridSectionId } from '@/lib/homeGridSections';
import { CategoryId } from '@/lib/storage';
import type { DocumentPrefill } from './documentPrefill';

function esc(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function afterLabel(text: string, labels: string[]): string | null {
  const flat = text.replace(/\r/g, '\n');
  for (const label of labels) {
    const re = new RegExp(`${esc(label)}\\s*[:\\-–—]?\\s*([^\\n]+)`, 'im');
    const m = flat.match(re);
    if (m?.[1]) {
      const v = m[1].trim().replace(/\s+/g, ' ');
      if (v.length && v.length < 2000) return v;
    }
  }
  return null;
}

function toIsoDate(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const s = raw.trim().replace(/\./g, '/');
  let m = s.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  const pad = (n: string) => (n.length === 1 ? `0${n}` : n);
  if (m) return `${m[1]}-${pad(m[2])}-${pad(m[3])}`;
  m = s.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{2,4})/);
  if (m) {
    let y = m[3];
    if (y.length === 2) y = `20${y}`;
    return `${y}-${pad(m[2])}-${pad(m[1])}`;
  }
  return null;
}

function pan(text: string): string | null {
  const u = text.toUpperCase().replace(/\s+/g, '');
  return u.match(/\b([A-Z]{5}\d{4}[A-Z])\b/)?.[1] ?? null;
}

function aadhaar(text: string): string | null {
  const d = text.replace(/\D/g, '');
  const m = d.match(/(\d{12})/);
  return m ? m[1] : null;
}

export function guessCategoryFromOcrText(text: string): CategoryId {
  const t = text;
  const u = t.toUpperCase();
  if (/DRIV(ING|ERS?)\s+LICEN/i.test(t)) return 'drivers-license';
  if (/PASSPORT|FILE\s*NO/i.test(u) && /PASSPORT|NATIONALITY/i.test(u)) return 'passport';
  if (/AADHAAR|UIDAI|PAN|VOTER|INCOME\s*TAX|GOVT/i.test(t)) return 'government-ids';
  if (/\b[A-Z]{4}0[A-Z0-9]{6}\b/.test(u)) return 'bank-accounts';
  if (/VISA\b/i.test(u) && /(ENTRY|VALID)/i.test(t)) return 'visa';
  if (/REG(?:ISTRATION)?|CHASSIS|ENGINE/i.test(t)) return 'vehicle-documents';
  if (/POLICY|PREMIUM/i.test(u)) return 'insurance';
  return 'other';
}

function extractGov(text: string, out: Record<string, string>) {
  if (/AADHAAR|UIDAI/i.test(text)) out['Document Type'] = 'Aadhaar Card';
  else if (/PAN|INCOME\s*TAX/i.test(text) || pan(text)) out['Document Type'] = 'PAN Card';
  else if (/VOTER|EPIC/i.test(text)) out['Document Type'] = 'Voter ID';
  else if (/DRIV/i.test(text)) out['Document Type'] = 'Driving License';
  const p = pan(text);
  const a = aadhaar(text);
  if (p) out['ID / Document Number'] = p;
  else if (a) out['ID / Document Number'] = a;
  const di = toIsoDate(afterLabel(text, ['Date of Issue', 'Issue Date']));
  const ex = toIsoDate(afterLabel(text, ['Expiry', 'Valid Until']));
  if (di) out['Date of Issue'] = di;
  if (ex) out['Expiry Date'] = ex;
}

function buildFields(categoryId: CategoryId, text: string): Record<string, string> {
  const out: Record<string, string> = {};
  if (categoryId === 'government-ids') extractGov(text, out);
  const cat = getCategoryById(categoryId);
  if (!cat) return out;
  for (const f of cat.fields) {
    if (out[f.key]) continue;
    if (f.type === 'date') {
      const iso = toIsoDate(afterLabel(text, [f.label]));
      if (iso) out[f.key] = iso;
    } else if (f.type === 'select' && f.options) {
      for (const o of f.options) {
        if (new RegExp(`\\b${esc(o)}\\b`, 'i').test(text)) {
          out[f.key] = o;
          break;
        }
      }
    }
  }
  return out;
}

function titleFor(catId: CategoryId, fields: Record<string, string>): string {
  if (fields['Document Type']) return fields['Document Type'];
  const c = getCategoryById(catId);
  return c ? `${c.shortLabel} document` : 'Document';
}

export function buildDocumentPrefillFromOcr(text: string): DocumentPrefill {
  const raw = text.replace(/\r/g, '\n').trim();
  const categoryId = guessCategoryFromOcrText(raw);
  const fields = buildFields(categoryId, raw);
  const title = titleFor(categoryId, fields);
  const excerpt = raw.slice(0, 900);
  return {
    categoryId,
    title,
    fields,
    notesAppend: excerpt
      ? `\n\n--- OCR excerpt (verify) ---\n${excerpt}${raw.length > 900 ? '…' : ''}`
      : undefined,
    fromOcr: true,
  };
}

/** Prefer OCR category when it fits the selected home folder; otherwise default within section. */
export function mergePrefillWithSection(
  prefill: DocumentPrefill,
  sectionId: HomeGridSectionId,
  ocrText: string
): DocumentPrefill {
  const sec = HOME_GRID_SECTIONS.find((s) => s.id === sectionId);
  if (!sec) return prefill;
  const guess = prefill.categoryId;
  const categoryId =
    guess && sec.categoryIds.includes(guess) ? guess : sec.categoryIds[0] ?? 'other';
  const fields = buildFields(categoryId, ocrText);
  return {
    ...prefill,
    categoryId,
    fields: { ...fields, ...(prefill.fields ?? {}) },
    title: prefill.title || titleFor(categoryId, { ...fields, ...(prefill.fields ?? {}) }),
  };
}
