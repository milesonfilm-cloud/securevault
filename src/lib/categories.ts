import { CategoryId } from './storage';

export interface CategoryConfig {
  id: CategoryId;
  label: string;
  shortLabel: string;
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  lightBg: string;
  icon: string;
  fields: FieldConfig[];
}

export interface FieldConfig {
  key: string;
  label: string;
  type: 'text' | 'date' | 'number' | 'select' | 'tel';
  required?: boolean;
  options?: string[];
  placeholder?: string;
  sensitive?: boolean;
}

export const CATEGORIES: CategoryConfig[] = [
  {
    id: 'password-vault',
    label: 'Passwords',
    shortLabel: 'Passwords',
    color: '#0F766E',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200',
    textColor: 'text-teal-700',
    lightBg: 'bg-teal-500/10',
    icon: 'KeyRound',
    fields: [
      {
        key: 'Website / App',
        label: 'Website / App',
        type: 'text',
        required: true,
        placeholder: 'e.g. Gmail, Instagram, HDFC NetBanking',
      },
      {
        key: 'Login URL',
        label: 'Login URL',
        type: 'text',
        placeholder: 'e.g. https://accounts.google.com',
      },
      {
        key: 'User ID / Email',
        label: 'User ID / Email',
        type: 'text',
        required: true,
        sensitive: true,
        placeholder: 'e.g. name@example.com',
      },
      {
        key: 'Password',
        label: 'Password',
        type: 'text',
        required: true,
        sensitive: true,
        placeholder: 'Saved securely in your vault',
      },
      {
        key: '2FA / Recovery',
        label: '2FA / Recovery notes',
        type: 'text',
        sensitive: true,
        placeholder: 'e.g. backup codes location',
      },
    ],
  },
  {
    id: 'government-ids',
    label: 'Government IDs',
    shortLabel: 'Gov IDs',
    color: '#6366F1',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    textColor: 'text-indigo-700',
    lightBg: 'bg-indigo-500/10',
    icon: 'CreditCard',
    fields: [
      {
        key: 'Document Type',
        label: 'Document Type',
        type: 'select',
        required: true,
        options: [
          'Aadhaar Card',
          'PAN Card',
          'Passport',
          'Voter ID',
          'Driving License',
          'Birth Certificate',
          'Other',
        ],
      },
      {
        key: 'ID / Document Number',
        label: 'ID / Document Number',
        type: 'text',
        required: true,
        sensitive: true,
      },
      { key: 'Date of Issue', label: 'Date of Issue', type: 'date' },
      { key: 'Expiry Date', label: 'Expiry Date', type: 'date' },
      { key: 'Issuing Authority', label: 'Issuing Authority', type: 'text' },
      { key: 'Address on Document', label: 'Address on Document', type: 'text' },
    ],
  },
  {
    id: 'bank-accounts',
    label: 'Bank Accounts',
    shortLabel: 'Bank',
    color: '#0EA5E9',
    bgColor: 'bg-sky-50',
    borderColor: 'border-sky-200',
    textColor: 'text-sky-700',
    lightBg: 'bg-sky-500/10',
    icon: 'Landmark',
    fields: [
      { key: 'Bank Name', label: 'Bank Name', type: 'text', required: true },
      {
        key: 'Account Number',
        label: 'Account Number',
        type: 'text',
        required: true,
        sensitive: true,
      },
      { key: 'IFSC Code', label: 'IFSC / SWIFT Code', type: 'text' },
      {
        key: 'Account Type',
        label: 'Account Type',
        type: 'select',
        options: ['Savings', 'Current', 'Joint Savings', 'NRE', 'NRO', 'Fixed Deposit'],
      },
      { key: 'Branch', label: 'Branch', type: 'text' },
      { key: 'Nominee', label: 'Nominee', type: 'text' },
      { key: 'Net Banking ID', label: 'Net Banking User ID', type: 'text', sensitive: true },
    ],
  },
  {
    id: 'credit-debit-cards',
    label: 'Credit / Debit Cards',
    shortLabel: 'Cards',
    color: '#F59E0B',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    textColor: 'text-amber-700',
    lightBg: 'bg-amber-500/10',
    icon: 'Wallet',
    fields: [
      { key: 'Card Name', label: 'Card Name / Type', type: 'text', required: true },
      {
        key: 'Card Number (Last 4)',
        label: 'Last 4 Digits',
        type: 'text',
        required: true,
        sensitive: true,
      },
      {
        key: 'Card Network',
        label: 'Card Network',
        type: 'select',
        options: ['Visa', 'Mastercard', 'RuPay', 'Amex', 'Diners'],
      },
      { key: 'Expiry', label: 'Expiry (MM/YYYY)', type: 'text' },
      { key: 'Credit Limit', label: 'Credit Limit', type: 'text' },
      { key: 'Billing Cycle', label: 'Billing Cycle Date', type: 'text' },
      { key: 'Customer Care', label: 'Customer Care Number', type: 'tel' },
    ],
  },
  {
    id: 'institutional-docs',
    label: 'Institutional Documents',
    shortLabel: 'Institutional',
    color: '#10B981',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    textColor: 'text-emerald-700',
    lightBg: 'bg-emerald-500/10',
    icon: 'Building2',
    fields: [
      { key: 'Institution Name', label: 'Institution / Company', type: 'text', required: true },
      {
        key: 'Document Type',
        label: 'Document Type',
        type: 'select',
        options: [
          'Insurance Policy',
          'Loan Account',
          'Mutual Fund',
          'PPF Account',
          'School Certificate',
          'Degree Certificate',
          'Employment Letter',
          'Property Document',
          'Other',
        ],
      },
      {
        key: 'Reference Number',
        label: 'Policy / Reference Number',
        type: 'text',
        sensitive: true,
      },
      { key: 'Start Date', label: 'Start / Issue Date', type: 'date' },
      { key: 'End / Maturity Date', label: 'End / Maturity Date', type: 'date' },
      { key: 'Amount / Value', label: 'Amount / Sum', type: 'text' },
      { key: 'Contact Number', label: 'Contact / Agent Number', type: 'tel' },
    ],
  },
  {
    id: 'vehicle-documents',
    label: 'Vehicle Documents',
    shortLabel: 'Vehicles',
    color: '#EF4444',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-700',
    lightBg: 'bg-red-500/10',
    icon: 'Car',
    fields: [
      { key: 'Vehicle Name', label: 'Vehicle Name / Model', type: 'text', required: true },
      { key: 'Registration Number', label: 'Registration Number', type: 'text', required: true },
      { key: 'Engine Number', label: 'Engine Number', type: 'text', sensitive: true },
      { key: 'Chassis Number', label: 'Chassis Number', type: 'text', sensitive: true },
      {
        key: 'Fuel Type',
        label: 'Fuel Type',
        type: 'select',
        options: ['Petrol', 'Diesel', 'CNG', 'Electric', 'Hybrid'],
      },
      { key: 'Insurance Expiry', label: 'Insurance Expiry', type: 'date' },
      { key: 'PUC Expiry', label: 'PUC / Emission Expiry', type: 'date' },
    ],
  },
  {
    id: 'family-profiles',
    label: 'Family Member Profiles',
    shortLabel: 'Profiles',
    color: '#8B5CF6',
    bgColor: 'bg-violet-50',
    borderColor: 'border-violet-200',
    textColor: 'text-violet-700',
    lightBg: 'bg-violet-500/10',
    icon: 'Users',
    fields: [
      { key: 'Full Name', label: 'Full Name', type: 'text', required: true },
      { key: 'Relationship', label: 'Relationship', type: 'text' },
      { key: 'Date of Birth', label: 'Date of Birth', type: 'date' },
      {
        key: 'Blood Group',
        label: 'Blood Group',
        type: 'select',
        options: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'],
      },
      { key: 'Emergency Contact', label: 'Emergency Contact', type: 'tel' },
      { key: 'Medical Conditions', label: 'Medical Conditions / Allergies', type: 'text' },
    ],
  },
];

export function getCategoryById(id: CategoryId): CategoryConfig | undefined {
  return CATEGORIES.find((c) => c.id === id);
}
