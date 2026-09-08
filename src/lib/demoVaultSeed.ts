import type { Document, FamilyMember, VaultData } from '@/lib/storage';
import { defaultStreakData, defaultVaultSettings } from '@/lib/storage';
import { MEMBER_COLORS } from '@/lib/memberAvatarColors';
import { DEMO_VAULT_KEY, isDemoMode } from '@/lib/demoMode';

const now = () => new Date().toISOString();

function daysFromNow(days: number): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + days);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

/** Sample household for guided demo — session-only, not encrypted. */
export function createDemoVaultData(): VaultData {
  const created = now();
  const members: FamilyMember[] = [
    {
      id: 'demo-member-dad',
      name: 'Arjun Sharma',
      relationship: 'Father',
      dob: '1985-04-12',
      avatarColor: MEMBER_COLORS[0].border,
      createdAt: created,
      updatedAt: created,
    },
    {
      id: 'demo-member-mom',
      name: 'Priya Sharma',
      relationship: 'Mother',
      dob: '1988-09-03',
      avatarColor: MEMBER_COLORS[8].border,
      createdAt: created,
      updatedAt: created,
    },
    {
      id: 'demo-member-kid',
      name: 'Aarav Sharma',
      relationship: 'Son',
      dob: '2016-01-22',
      avatarColor: MEMBER_COLORS[10].border,
      createdAt: created,
      updatedAt: created,
    },
  ];

  const documents: Document[] = [
    {
      id: 'demo-doc-aadhaar-dad',
      memberId: 'demo-member-dad',
      categoryId: 'government-ids',
      title: 'Aadhaar Card',
      fields: {
        'Document Type': 'Aadhaar Card',
        'ID / Document Number': '2345 6789 0123',
        'Date of Issue': '15-06-2018',
        'Issuing Authority': 'UIDAI',
      },
      notes: 'Sample Aadhaar — demo data only',
      createdAt: created,
      updatedAt: created,
      tags: ['kyc', 'demo'],
      stackId: null,
    },
    {
      id: 'demo-doc-pan-dad',
      memberId: 'demo-member-dad',
      categoryId: 'government-ids',
      title: 'PAN Card',
      fields: {
        'Document Type': 'PAN Card',
        'ID / Document Number': 'ABCDE1234F',
        'Date of Issue': '10-03-2012',
      },
      notes: '',
      createdAt: created,
      updatedAt: created,
      tags: ['kyc', 'demo'],
      stackId: null,
    },
    {
      id: 'demo-doc-passport-mom',
      memberId: 'demo-member-mom',
      categoryId: 'passport',
      title: 'Passport',
      fields: {
        'Passport Number': 'Z1234567',
        'Date of Issue': '01-05-2019',
        'Expiry Date': daysFromNow(40),
        'Place of Issue': 'Delhi',
      },
      notes: 'Renewal coming up — demo sample',
      createdAt: created,
      updatedAt: created,
      tags: ['travel', 'demo'],
      stackId: null,
    },
    {
      id: 'demo-doc-dl-mom',
      memberId: 'demo-member-mom',
      categoryId: 'drivers-license',
      title: 'Driving License',
      fields: {
        'License Number': 'DL-0420110012345',
        'Date of Issue': '20-08-2015',
        'Expiry Date': daysFromNow(-120),
      },
      notes: 'Expired sample for Renewals demo',
      createdAt: created,
      updatedAt: created,
      tags: ['demo'],
      stackId: null,
    },
    {
      id: 'demo-doc-insurance-dad',
      memberId: 'demo-member-dad',
      categoryId: 'insurance',
      title: 'Health Insurance',
      fields: {
        Provider: 'Demo Insurer',
        'Policy Number': 'HI-998877',
        Type: 'Health',
        'End Date': daysFromNow(20),
      },
      notes: '',
      createdAt: created,
      updatedAt: created,
      tags: ['insurance', 'demo'],
      stackId: null,
    },
    {
      id: 'demo-doc-bank-dad',
      memberId: 'demo-member-dad',
      categoryId: 'bank-accounts',
      title: 'HDFC Salary Account',
      fields: {
        'Bank Name': 'HDFC Bank',
        'Account Number': '5010 2345 6789',
        'IFSC Code': 'HDFC0001234',
        'Account Type': 'Savings',
      },
      notes: '',
      createdAt: created,
      updatedAt: created,
      tags: ['bank', 'demo'],
      stackId: null,
    },
  ];

  return {
    members,
    documents,
    exportHistory: [],
    documentStacks: [],
    shareLinks: [],
    emergencyContact: null,
    settings: {
      ...defaultVaultSettings(),
      plan: 'free',
    },
    streakData: {
      ...defaultStreakData(),
      onboardingDone: false,
    },
  };
}

export function loadDemoVaultFromSession(): VaultData | null {
  if (!isDemoMode()) return null;
  try {
    const raw = sessionStorage.getItem(DEMO_VAULT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as VaultData;
  } catch {
    return null;
  }
}

export function saveDemoVaultToSession(data: VaultData): void {
  if (!isDemoMode()) return;
  try {
    sessionStorage.setItem(DEMO_VAULT_KEY, JSON.stringify(data));
  } catch {
    console.error('SecureVault: could not save demo vault to sessionStorage');
  }
}

export function ensureDemoVaultSeeded(): VaultData {
  const existing = loadDemoVaultFromSession();
  if (existing) return existing;
  const seed = createDemoVaultData();
  saveDemoVaultToSession(seed);
  return seed;
}

/** Ephemeral AES key so any accidental IDB photo paths don't crash in demo. */
export async function createEphemeralDemoVaultKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, false, [
    'encrypt',
    'decrypt',
  ]);
}
