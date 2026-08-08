import { describe, expect, it } from 'vitest';
import {
  isValidAadhaar,
  isValidCardNumber,
  isValidDateDmy,
  isValidEmail,
  isValidExpiryMmYyyy,
  isValidIfsc,
  isValidPan,
  isValidPhone,
  validateFormattedValue,
  validateGovernmentIdNumber,
} from '../fieldValidation';

describe('fieldValidation', () => {
  it('accepts valid DD-MM-YYYY and rejects junk', () => {
    expect(isValidDateDmy('31-12-2026')).toBe(true);
    expect(isValidDateDmy('29-02-2024')).toBe(true);
    expect(isValidDateDmy('29-02-2023')).toBe(false);
    expect(isValidDateDmy('32-01-2020')).toBe(false);
    expect(isValidDateDmy('2026-12-31')).toBe(false);
    expect(isValidDateDmy('abc')).toBe(false);
    expect(isValidDateDmy('1-1-2020')).toBe(false);
  });

  it('validates MM/YYYY card expiry', () => {
    expect(isValidExpiryMmYyyy('08/2028')).toBe(true);
    expect(isValidExpiryMmYyyy('13/2028')).toBe(false);
    expect(isValidExpiryMmYyyy('8/2028')).toBe(false);
  });

  it('validates Indian ID formats', () => {
    expect(isValidPan('ABCDE1234F')).toBe(true);
    expect(isValidPan('ABCDE12345')).toBe(false);
    expect(isValidAadhaar('1234 5678 9012')).toBe(true);
    expect(isValidAadhaar('12345')).toBe(false);
    expect(isValidIfsc('SBIN0001234')).toBe(true);
    expect(isValidIfsc('SBIN1234567')).toBe(false);
  });

  it('validates phone, email, card', () => {
    expect(isValidPhone('+91 98765 43210')).toBe(true);
    expect(isValidPhone('123')).toBe(false);
    expect(isValidEmail('name@example.com')).toBe(true);
    expect(isValidEmail('not-an-email')).toBe(false);
    expect(isValidCardNumber('1234')).toBe(true);
    expect(isValidCardNumber('4111-1111-1111-1111')).toBe(true);
    expect(isValidCardNumber('12345')).toBe(false);
  });

  it('routes government ID by document type', () => {
    expect(validateGovernmentIdNumber('ABCDE1234F', 'PAN Card')).toBeNull();
    expect(validateGovernmentIdNumber('bad', 'PAN Card')).toBeTruthy();
    expect(validateGovernmentIdNumber('1234 5678 9012', 'Aadhaar Card')).toBeNull();
    expect(validateGovernmentIdNumber('xx', 'Passport')).toBeTruthy();
  });

  it('skips empty values for formatted fields', () => {
    expect(validateFormattedValue('', 'date-dmy')).toBeNull();
    expect(validateFormattedValue('  ', 'phone')).toBeNull();
    expect(validateFormattedValue('99-99-9999', 'date-dmy')).toBeTruthy();
  });
});
