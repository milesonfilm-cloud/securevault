import type { CategoryId, Document } from '@/lib/storage';
import type { DigiLockerIssuedItem } from '@/lib/digilocker/client';

function normalizeDocType(code: string): string {
  return (code || '').trim().toUpperCase();
}

/**
 * Map DigiLocker `doctype` to vault category + sensible defaults.
 * ADHAR, PANCR, DRVLC, VHREG, PPORT; others use description heuristics or certificate.
 */
export function mapDigiLockerDocToVaultDoc(
  dl: DigiLockerIssuedItem,
  memberId: string
): Partial<Document> {
  const code = normalizeDocType(dl.doctype);
  const title = (dl.name || dl.description || 'DigiLocker document').trim();
  const issuerLine = [dl.issuer, dl.issuerid].filter(Boolean).join(' · ');
  const notes = ['Imported from DigiLocker', issuerLine && `Issuer: ${issuerLine}`, dl.uri && `URI: ${dl.uri}`]
    .filter(Boolean)
    .join('\n');

  let categoryId: CategoryId = 'certificate';
  const fields: Record<string, string> = {};

  switch (code) {
    case 'ADHAR':
    case 'ADHAAR':
      categoryId = 'government-ids';
      fields['Document Type'] = 'Aadhaar Card';
      fields['Issuing Authority'] = dl.issuer || 'UIDAI';
      fields['ID / Document Number'] = '';
      break;
    case 'PANCR':
      categoryId = 'government-ids';
      fields['Document Type'] = 'PAN Card';
      fields['Issuing Authority'] = dl.issuer || 'Income Tax Department';
      fields['ID / Document Number'] = '';
      break;
    case 'DRVLC':
      categoryId = 'drivers-license';
      fields['Issuing Authority'] = dl.issuer || '';
      fields['License Number'] = '';
      break;
    case 'VHREG':
      categoryId = 'vehicle-documents';
      fields['Vehicle Name'] = dl.description || title;
      fields['Registration Number'] = '';
      fields['Issuing Authority'] = dl.issuer || '';
      break;
    case 'PPORT':
      categoryId = 'passport';
      fields['Issuing Authority'] = dl.issuer || '';
      fields['Passport Number'] = '';
      break;
    default:
      if (/aadhaar|adhar/i.test(dl.description + dl.name)) {
        categoryId = 'government-ids';
        fields['Document Type'] = 'Aadhaar Card';
        fields['Issuing Authority'] = dl.issuer || '';
        fields['ID / Document Number'] = '';
      } else if (/\bpan\b/i.test(dl.description + dl.name)) {
        categoryId = 'government-ids';
        fields['Document Type'] = 'PAN Card';
        fields['Issuing Authority'] = dl.issuer || '';
        fields['ID / Document Number'] = '';
      } else if (/driv|license|\bdl\b/i.test(dl.description + dl.name)) {
        categoryId = 'drivers-license';
        fields['Issuing Authority'] = dl.issuer || '';
        fields['License Number'] = '';
      } else if (/vehicle|registration|\brc\b/i.test(dl.description + dl.name)) {
        categoryId = 'vehicle-documents';
        fields['Vehicle Name'] = dl.description || title;
        fields['Registration Number'] = '';
      } else if (/passport/i.test(dl.description + dl.name)) {
        categoryId = 'passport';
        fields['Issuing Authority'] = dl.issuer || '';
        fields['Passport Number'] = '';
      } else {
        categoryId = 'certificate';
        fields['Certificate Name'] = title;
        fields['Issuer'] = dl.issuer || dl.issuerid || '';
      }
  }

  if (dl.date?.trim()) {
    const d = dl.date.trim().slice(0, 10);
    if (categoryId === 'certificate') fields['Issue Date'] = d;
    else if (categoryId === 'passport' || categoryId === 'drivers-license') fields['Date of Issue'] = d;
    else if (categoryId === 'government-ids') fields['Date of Issue'] = d;
  }

  return {
    memberId,
    categoryId,
    title,
    fields,
    notes,
    tags: ['digilocker'],
    isDigiLockerVerified: true,
  };
}
