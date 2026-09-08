import type { FieldConfig, FieldFormat } from '@/lib/categories';

/** User-facing format hints shown under invalid fields. */
export const FIELD_FORMAT_HINTS: Record<FieldFormat, string> = {
  'date-dmy': 'Use DD-MM-YYYY (e.g. 31-12-2026)',
  'card-number': 'Enter the last 4 digits, or the full card number',
  'expiry-mmyyyy': 'Use MM/YYYY (e.g. 08/2028)',
  'account-number': 'Enter 9–20 digits',
  phone: 'Enter a valid phone number (at least 10 digits)',
  ifsc: 'Use IFSC (e.g. SBIN0001234) or SWIFT (e.g. HDFCINBB)',
  aadhaar: 'Enter 12-digit Aadhaar (e.g. 1234 5678 9012)',
  pan: 'Use PAN format: AAAAA9999A',
  'alpha-upper': 'Use letters and numbers (e.g. KA 03 AB 1234)',
  email: 'Use a valid email (e.g. name@example.com)',
  url: 'Use a valid URL (e.g. https://example.com)',
  'login-id': 'Enter a username or a valid email (e.g. name@example.com)',
  cvv: 'Enter 3 or 4 digits (e.g. 123)',
};

function digitsOnly(value: string): string {
  return value.replace(/\D/g, '');
}

function isValidCalendarDate(day: number, month: number, year: number): boolean {
  if (year < 1900 || year > 2100) return false;
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  const dt = new Date(year, month - 1, day);
  return (
    dt.getFullYear() === year && dt.getMonth() === month - 1 && dt.getDate() === day
  );
}

/** Strict DD-MM-YYYY (hyphens). Rejects incomplete or junk values. */
export function isValidDateDmy(value: string): boolean {
  const m = value.trim().match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (!m) return false;
  return isValidCalendarDate(Number(m[1]), Number(m[2]), Number(m[3]));
}

/** Strict MM/YYYY. */
export function isValidExpiryMmYyyy(value: string): boolean {
  const m = value.trim().match(/^(\d{2})\/(\d{4})$/);
  if (!m) return false;
  const month = Number(m[1]);
  const year = Number(m[2]);
  return month >= 1 && month <= 12 && year >= 2000 && year <= 2100;
}

export function isValidEmail(value: string): boolean {
  const v = value.trim();
  // Practical email check — rejects spaces and obvious junk
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) && !v.includes('..');
}

export function isValidUrl(value: string): boolean {
  const v = value.trim();
  try {
    const withProtocol = /^https?:\/\//i.test(v) ? v : `https://${v}`;
    const u = new URL(withProtocol);
    return Boolean(u.hostname && u.hostname.includes('.'));
  } catch {
    return false;
  }
}

export function isValidPhone(value: string): boolean {
  const digits = digitsOnly(value);
  // India mobile / landline-ish: 10–15 digits; allow leading country code
  return digits.length >= 10 && digits.length <= 15;
}

export function isValidIfsc(value: string): boolean {
  const v = value.trim().toUpperCase();
  if (/^[A-Z]{4}0[A-Z0-9]{6}$/.test(v)) return true;
  return /^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(v);
}

export function isValidAadhaar(value: string): boolean {
  const digits = digitsOnly(value);
  return digits.length === 12 && !/^0+$/.test(digits);
}

export function isValidPan(value: string): boolean {
  return /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(value.trim().toUpperCase());
}

export function isValidCardNumber(value: string): boolean {
  const digits = digitsOnly(value);
  // Field supports last-4 or full PAN of 13–16 digits
  if (digits.length === 4) return true;
  return digits.length >= 13 && digits.length <= 16;
}

export function isValidAccountNumber(value: string): boolean {
  const digits = digitsOnly(value);
  return digits.length >= 9 && digits.length <= 20;
}

export function isValidLoginId(value: string): boolean {
  const v = value.trim();
  if (!v) return false;
  if (v.includes('@')) return isValidEmail(v);
  return v.length >= 2 && !/\s{2,}/.test(v);
}

/**
 * Validate a non-empty field value against its format.
 * Returns null when valid, or an error message key suffix / message when invalid.
 */
export function validateFormattedValue(
  value: string,
  format: FieldFormat | undefined
): string | null {
  const trimmed = value.trim();
  if (!trimmed || !format) return null;

  switch (format) {
    case 'date-dmy':
      return isValidDateDmy(trimmed) ? null : FIELD_FORMAT_HINTS['date-dmy'];
    case 'expiry-mmyyyy':
      return isValidExpiryMmYyyy(trimmed) ? null : FIELD_FORMAT_HINTS['expiry-mmyyyy'];
    case 'card-number':
      return isValidCardNumber(trimmed) ? null : FIELD_FORMAT_HINTS['card-number'];
    case 'account-number':
      return isValidAccountNumber(trimmed) ? null : FIELD_FORMAT_HINTS['account-number'];
    case 'phone':
      return isValidPhone(trimmed) ? null : FIELD_FORMAT_HINTS.phone;
    case 'ifsc':
      return isValidIfsc(trimmed) ? null : FIELD_FORMAT_HINTS.ifsc;
    case 'aadhaar':
      return isValidAadhaar(trimmed) ? null : FIELD_FORMAT_HINTS.aadhaar;
    case 'pan':
      return isValidPan(trimmed) ? null : FIELD_FORMAT_HINTS.pan;
    case 'cvv':
      return /^\d{3,4}$/.test(digitsOnly(trimmed)) ? null : FIELD_FORMAT_HINTS.cvv;
    case 'alpha-upper':
      if (trimmed.length > 16) {
        return 'Keep it to 16 characters or fewer (e.g. KA 03 AB 1234)';
      }
      return /^[A-Z0-9][A-Z0-9\s\-./]*$/i.test(trimmed)
        ? null
        : FIELD_FORMAT_HINTS['alpha-upper'];
    case 'email':
      return isValidEmail(trimmed) ? null : FIELD_FORMAT_HINTS.email;
    case 'url':
      return isValidUrl(trimmed) ? null : FIELD_FORMAT_HINTS.url;
    case 'login-id':
      return isValidLoginId(trimmed) ? null : FIELD_FORMAT_HINTS['login-id'];
    default:
      return null;
  }
}

/**
 * Government ID number depends on Document Type selection.
 * Returns null when valid / not applicable; otherwise a format hint.
 */
export function validateGovernmentIdNumber(
  idValue: string,
  documentType: string | undefined
): string | null {
  const trimmed = idValue.trim();
  if (!trimmed) return null;

  const type = (documentType ?? '').toLowerCase();
  if (type.includes('aadhaar')) {
    return isValidAadhaar(trimmed) ? null : FIELD_FORMAT_HINTS.aadhaar;
  }
  if (type.includes('pan')) {
    return isValidPan(trimmed) ? null : FIELD_FORMAT_HINTS.pan;
  }
  // Passport / Voter / DL / Other — require meaningful alphanumeric, reject pure junk
  if (trimmed.length < 4) return 'Enter a valid ID number (at least 4 characters, e.g. A1234567)';
  if (!/^[A-Za-z0-9][A-Za-z0-9\s\-\/]*$/.test(trimmed)) {
    return 'Use letters and numbers only (e.g. A1234567)';
  }
  return null;
}

/**
 * Required + format check for a single category field.
 * Returns `true` when valid, otherwise an error message (with an example).
 */
export function validateCategoryFieldValue(
  field: FieldConfig,
  value: string,
  allValues: Record<string, string>,
  requiredMessage: string
): true | string {
  const trimmed = value.trim();
  if (!trimmed) {
    return field.required ? requiredMessage : true;
  }

  if (field.key === 'Password') {
    if (trimmed.length < 4) return 'Enter at least 4 characters (e.g. Abcd1)';
    if (trimmed.length > 128) return 'Keep it to 128 characters or fewer';
  }

  if (field.key === 'ID / Document Number') {
    const err = validateGovernmentIdNumber(value, allValues['Document Type']);
    if (err) return err;
  }

  const err = validateFormattedValue(value, field.format);
  return err ?? true;
}

/** Validate all category fields in a form payload. Empty optional fields are skipped. */
export function collectFieldFormatErrors(
  fields: FieldConfig[],
  values: Record<string, string>
): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const field of fields) {
    const raw = values[field.key] ?? '';
    if (!raw.trim()) continue;

    if (field.key === 'ID / Document Number') {
      const err = validateGovernmentIdNumber(raw, values['Document Type']);
      if (err) errors[field.key] = err;
      continue;
    }

    const err = validateFormattedValue(raw, field.format);
    if (err) errors[field.key] = err;
  }
  return errors;
}

/** Required + format errors for a category form payload. */
export function collectCategoryFieldErrors(
  fields: FieldConfig[],
  values: Record<string, string>,
  requiredMessage: (field: FieldConfig) => string
): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const field of fields) {
    const result = validateCategoryFieldValue(
      field,
      values[field.key] ?? '',
      values,
      requiredMessage(field)
    );
    if (result !== true) errors[field.key] = result;
  }
  return errors;
}
