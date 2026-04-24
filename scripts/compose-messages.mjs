/**
 * Builds messages/*.json from shared static copy + generated categories.
 * Run: node scripts/compose-messages.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const gen = JSON.parse(
  fs.readFileSync(path.join(root, 'scripts', 'tmp', 'en.categories.generated.json'), 'utf8')
);

const STATIC_EN = {
  nav: {
    home: 'Home',
    documents: 'Documents',
    renewals: 'Renewals',
    progress: 'Progress',
    settings: 'Settings',
    members: 'Members',
    familyMembers: 'Family Members',
    documentVault: 'Document Vault',
    settingsExport: 'Settings & Export',
    about: 'About',
    navigation: 'Navigation',
    lock: 'Lock',
    lockVault: 'Lock vault',
    private: 'Private',
    renew: 'Renew',
    vault: 'Vault',
    family: 'Family',
    offlineTitle: '100% Offline',
    offlineSubtitle: 'Data never leaves this device',
    lockVaultButton: 'Lock Vault',
    collapse: 'Collapse',
    expandSidebar: 'Expand sidebar',
  },
  common: {
    add: 'Add',
    edit: 'Edit',
    delete: 'Delete',
    save: 'Save',
    cancel: 'Cancel',
    search: 'Search',
    back: 'Back',
    next: 'Next',
    loading: 'Loading…',
    error: 'Error',
    close: 'Close',
    continue: 'Continue',
    yes: 'Yes',
    no: 'No',
    fieldRequired: '{field} is required',
  },
  documents: {
    addDocument: 'Add document',
    editDocument: 'Edit document',
    noDocuments: 'No documents yet',
    scanDocument: 'Scan document',
    shareDocument: 'Share document',
    modalAddTitle: 'Add New Document',
    modalEditTitle: 'Edit Document',
    fieldsHeading: '{category} Fields',
    fieldPlaceholder: 'Enter {field}',
    saveLocalSubtitle: 'All data is saved locally on your device only',
    scanTitle: 'Scan a document with the camera and auto-fill fields',
    familyMemberLabel: 'Family Member *',
    selectFamilyMember: 'Select a family member',
    categoryLabel: 'Category *',
    selectCategory: 'Select a category',
    folderLabel: 'Folder',
    folderHint:
      'Optional — assign this document to one folder, or leave as "No folder".',
    noFolders:
      'No folders in your vault yet. Leave as "No folder" or add folder metadata via export/import if you use it.',
    titleLabel: 'Document Title *',
    titleHint:
      'A memorable name — e.g. "Aadhaar Card" or "HDFC Salary Account"',
    titleRequired: 'Document title is required',
    titlePlaceholder: 'e.g. Aadhaar Card',
    reviewOcrTitle: 'Review extracted fields',
    reviewOcrBody:
      'Text was recognized on this device. Verify IDs and dates before saving.',
    aiVerifyTitle: 'AI-filled fields — please verify',
    aiVerifyBody:
      'OCR ran on-device; field mapping used AI. Yellow badges mark suggested values — edit anything before saving.',
    sensitiveTag: '(sensitive)',
    aiFilledBadge: 'AI filled',
    selectPlaceholder: 'Select...',
    noFolderOption: 'No folder',
    showPassword: 'Show password',
    hidePassword: 'Hide password',
    notesLabel: 'Notes',
    notesHint: 'Optional — reminders, linked contacts, etc.',
    notesPlaceholder: 'e.g. Linked to mobile 98765XXXXX',
    tagsLabel: 'Tags',
    tagsHint: 'Comma-separated — e.g. primary, kyc, travel',
    tagsPlaceholder: 'primary, kyc, travel',
    saving: 'Saving...',
    saveChanges: 'Save Changes',
    addDocumentCta: 'Add Document',
  },
  settings: {
    title: 'Settings',
    backupAppTitle: 'Backup & App',
    backupAppSubtitle: 'Manage your vault data, backups, and app settings',
    cloudSync: 'Cloud sync',
    digilocker: 'DigiLocker',
    emergency: 'Emergency access',
    emergencySubtitle: 'Trusted contact, PDF bundle, handover links, read-only mode →',
    language: 'Language',
    languageSubtitle: 'Choose your preferred language. Saved on this device.',
    permissions: 'Permissions',
    logout: 'Log out',
    privacyTitle: '100% Private — Zero Cloud Storage',
    privacyBody:
      'All your data is stored locally in this app on your device (app storage). SecureVault never transmits, syncs, or backs up vault data to any server. Encrypted exports save directly to your device when you choose.',
  },
  auth: {
    enterPin: 'Enter your password to continue',
    createPin: 'Set a password to protect your vault',
    unlockVault: 'Unlock vault',
    biometric: 'Use Biometrics',
    welcome: 'Welcome!',
    createPassword: 'Create Password',
    unlocking: 'Unlocking your vault…',
    authenticating: 'Authenticating…',
    usePassword: 'or use password',
    fingerprintOrFace: 'Fingerprint or Face ID',
    enableBiometrics: 'Enable Biometrics',
    enableBiometricLogin: 'Enable Biometric Login',
    settingUp: 'Setting up…',
    fingerprint: 'Fingerprint',
    faceId: 'Face ID',
    offlineNote: '100% offline · stored on this device only',
    identityVerifiedHint: 'Identity verified. Enter your password to decrypt the vault.',
    pwdMin: 'Password must be at least 4 characters',
    pwdMismatch: 'Passwords do not match',
    incorrectPwd: 'Incorrect password. Please try again.',
    bioFailed: 'Biometric authentication failed. Use your password.',
    bioUnavailable: 'Biometric not available. Use your password.',
    bioSetupLater: 'Biometric setup failed. You can enable it later in settings.',
    bioSetupFailed: 'Biometric setup failed.',
    secureContext:
      'Secure encryption is not available. Use https:// or open this app on localhost, not a raw IP or file URL.',
    storageFull: 'Browser storage is full. Free some space and try again.',
    storageSaveFailed: 'Could not save your vault keys. Check browser storage permissions and try again.',
    oom:
      'This device ran out of memory while securing your password. Close other tabs or apps and try again.',
    wasmLoadFailed: 'Could not load password security module. Refresh the page and try again.',
    createFailed:
      'Could not create vault. Check that you are on a secure page (https or localhost) and try again.',
    resetConfirm:
      'Resetting will permanently delete your local vault data on this device.\n\nIf you have an encrypted backup file, you can restore after reset.\n\nContinue?',
    biometricSetupSubtitle: 'Use fingerprint or Face ID for quick, secure access',
    skipForNow: 'Skip for now',
    newPasswordLabel: 'New Password',
    passwordLabel: 'Password',
    enterPasswordPlaceholder: 'Enter password',
    confirmPasswordLabel: 'Confirm Password',
    confirmPasswordPlaceholder: 'Confirm password',
    createVaultPassword: 'Create Vault Password',
    submitUnlock: 'Unlock Vault',
    forgotReset: 'Forgot password? Reset vault (data will be lost without backup)',
    biometricTip: 'Tip: Enable biometric login after unlocking via Settings',
  },
  welcome: {
    kickerWelcome: 'Welcome',
    kickerYourData: 'Your data',
    kickerOrganize: 'Organize',
    kickerStaySafe: 'Stay safe',
    titleSecureVault: 'SecureVault',
    titlePrivateVault: 'Private document vault',
    titleBuiltFamilies: 'Built for families',
    titleBackup: 'Back up regularly',
    bodySetup:
      'Create a strong password to encrypt your vault. Nothing is uploaded — your secrets stay on this device.',
    bodyLogin:
      'Sign in with your password to decrypt your vault. Everything remains local and offline.',
    bodyVault:
      'Store government IDs, bank details, passwords, and more — organized by category and encrypted at rest.',
    bodyFamily:
      'Link documents to family members so household records stay structured and easy to find.',
    bodyBackup:
      'Export encrypted JSON backups from Settings. If you reset or lose access, a backup is your safety net.',
    skip: 'Skip intro',
    next: 'Next',
    createPassword: 'Create password',
    signIn: 'Sign in',
  },
  language: {
    label: 'Language',
    en: '🇮🇳 English',
    hi: '🇮🇳 हिन्दी',
    ta: '🇮🇳 தமிழ்',
    te: '🇮🇳 తెలుగు',
    kn: '🇮🇳 ಕನ್ನಡ',
    bn: '🇮🇳 বাংলা',
  },
};

function deepMerge(a, b) {
  const out = { ...a };
  for (const k of Object.keys(b)) {
    if (b[k] && typeof b[k] === 'object' && !Array.isArray(b[k]) && typeof a[k] === 'object') {
      out[k] = deepMerge(a[k], b[k]);
    } else {
      out[k] = b[k];
    }
  }
  return out;
}

const en = deepMerge(STATIC_EN, gen);
fs.writeFileSync(path.join(root, 'messages', 'en.json'), JSON.stringify(en, null, 2), 'utf8');
console.log('Wrote messages/en.json');
