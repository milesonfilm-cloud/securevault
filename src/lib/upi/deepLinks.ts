/**
 * UPI deep links and static biller VPAs for renewal shortcuts (India).
 * Amounts are optional; user confirms in the UPI app.
 */

export type BillerId =
  | 'LIC'
  | 'HDFC_ERGO'
  | 'ICICI_LOMBARD'
  | 'STAR_HEALTH'
  | 'IRCTC'
  | 'GENERIC_INSURANCE';

export const BILLER_CONFIG: Record<
  BillerId,
  { vpa: string; pn: string; defaultAmount?: string; note?: string }
> = {
  LIC: {
    vpa: 'licindia@axisbank',
    pn: 'LIC of India',
    note: 'LIC premium',
  },
  HDFC_ERGO: {
    vpa: 'hdfcergo@hdfcbank',
    pn: 'HDFC ERGO',
    note: 'Insurance renewal',
  },
  ICICI_LOMBARD: {
    vpa: 'icicilombard@icici',
    pn: 'ICICI Lombard',
    note: 'Insurance renewal',
  },
  STAR_HEALTH: {
    vpa: 'starhealth@axisbank',
    pn: 'Star Health Insurance',
    note: 'Health insurance renewal',
  },
  IRCTC: {
    vpa: 'irctc@sbi',
    pn: 'IRCTC',
    note: 'IRCTC payment',
  },
  GENERIC_INSURANCE: {
    vpa: 'paytm.s1vsi4v@pty',
    pn: 'Paytm UPI',
    note: 'Insurance / renewal',
  },
};

export type UPILinkParams = {
  pa: string;
  pn: string;
  am?: string;
  cu?: string;
  tn?: string;
};

export function generateUPILink(params: UPILinkParams): string {
  const q = new URLSearchParams();
  q.set('pa', params.pa);
  q.set('pn', params.pn);
  q.set('cu', params.cu ?? 'INR');
  if (params.am?.trim()) q.set('am', params.am.trim());
  if (params.tn?.trim()) q.set('tn', params.tn.trim().slice(0, 80));
  return `upi://pay?${q.toString()}`;
}

/** PhonePe deep link (best-effort; falls back to web if app missing). */
export function generatePhonePeLink(params: UPILinkParams): string {
  const upi = generateUPILink(params);
  return `phonepe://pay?${upi.replace(/^upi:\/\/pay\?/, '')}`;
}

/** Google Pay (Tez) style intent. */
export function generateGPayLink(params: UPILinkParams): string {
  const q = new URLSearchParams();
  q.set('pa', params.pa);
  q.set('pn', params.pn);
  q.set('cu', params.cu ?? 'INR');
  if (params.am?.trim()) q.set('am', params.am.trim());
  if (params.tn?.trim()) q.set('tn', params.tn.trim().slice(0, 80));
  return `gpay://upi/pay?${q.toString()}`;
}

export function pickBillerForRenewal(categoryId: string, docTitle: string): BillerId {
  const t = `${categoryId} ${docTitle}`.toLowerCase();
  if (t.includes('lic') || t.includes('life insurance')) return 'LIC';
  if (t.includes('irctc') || t.includes('rail')) return 'IRCTC';
  if (t.includes('hdfc') && t.includes('ergo')) return 'HDFC_ERGO';
  if (t.includes('icici') && t.includes('lombard')) return 'ICICI_LOMBARD';
  if (t.includes('star') && t.includes('health')) return 'STAR_HEALTH';
  if (
    categoryId === 'insurance' ||
    categoryId === 'vehicle-documents' ||
    categoryId === 'subscription' ||
    categoryId === 'warranty'
  ) {
    return 'GENERIC_INSURANCE';
  }
  return 'GENERIC_INSURANCE';
}

export function renewalPaymentParams(
  categoryId: string,
  docTitle: string
): UPILinkParams {
  const id = pickBillerForRenewal(categoryId, docTitle);
  const c = BILLER_CONFIG[id];
  return {
    pa: c.vpa,
    pn: c.pn,
    am: c.defaultAmount,
    cu: 'INR',
    tn: `${c.note ?? 'Renewal'} — ${docTitle}`.slice(0, 80),
  };
}
