'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Settings, ShieldAlert } from 'lucide-react';
import StorageMeter from './StorageMeter';
import ExportPanel from './ExportPanel';
import ImportPanel from './ImportPanel';
import ExportHistory from './ExportHistory';
import DangerZone from './DangerZone';
import AppInfoCard from './AppInfoCard';
import BiometricSettings from './BiometricSettings';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import VaultPageHeading from '@/components/ui/VaultPageHeading';
import AuditLogPanel from '@/components/AuditLogPanel';
import UpgradeGate from '@/components/UpgradeGate';
import TotpSetupModal from '@/components/TotpSetupModal';

export default function SettingsExportContent() {
  const ts = useTranslations('settings');
  const tsp = useTranslations('settingsPanels');
  const [totpOpen, setTotpOpen] = useState(false);

  return (
    <div className="mx-auto min-h-full max-w-screen-2xl bg-vault-bg p-4 lg:p-6">
      <VaultPageHeading
        icon={
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-vault-elevated text-vault-warm">
            <Settings size={18} aria-hidden />
          </div>
        }
        eyebrow={ts('title')}
        title={ts('backupAppTitle')}
        description={ts('backupAppSubtitle')}
      />

      <Link
        href="/settings/emergency"
        className="neo-card mb-6 flex items-center gap-4 rounded-2xl border-vault-coral/25 p-5 transition-colors hover:border-vault-coral/45"
      >
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-border bg-vault-elevated text-vault-coral">
          <ShieldAlert size={22} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-800 text-vault-text">{ts('emergency')}</p>
          <p className="mt-0.5 text-xs text-vault-muted">{ts('emergencySubtitle')}</p>
        </div>
      </Link>

      <div className="neo-card mb-6 rounded-2xl p-5">
        <h3 className="mb-1 text-sm font-800 text-vault-text">{ts('language')}</h3>
        <p className="mb-3 text-xs text-vault-muted">{ts('languageSubtitle')}</p>
        <LanguageSwitcher className="max-w-xs" />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-3">
        <div className="space-y-5">
          <StorageMeter />
          <BiometricSettings />
          <AppInfoCard />
        </div>

        <div className="space-y-5">
          <ExportPanel />
          <ExportHistory />
        </div>

        <div className="space-y-5 lg:col-span-2 xl:col-span-1">
          <UpgradeGate
            feature="importBackup"
            description="Restore vault data from an encrypted JSON backup file."
            fallback={
              <div className="neo-card rounded-2xl p-6 text-center">
                <p className="text-sm font-700 text-vault-text">Import backup</p>
                <p className="mt-2 text-xs text-vault-muted">
                  Restore from a previous export — available on Pro.
                </p>
                <Link
                  href="/upgrade"
                  className="mt-4 inline-flex rounded-full bg-vault-warm px-4 py-2 text-xs font-700 text-vault-ink"
                >
                  Upgrade to import backups
                </Link>
              </div>
            }
          >
            <ImportPanel />
          </UpgradeGate>
          <UpgradeGate
            feature="auditLog"
            description="See a timestamped log of unlocks, exports, and vault changes on this device."
          >
            <div className="neo-card rounded-2xl p-5">
              <AuditLogPanel />
            </div>
          </UpgradeGate>
          <UpgradeGate
            feature="totp2fa"
            description="Require an authenticator app code after your PIN for an extra unlock step."
          >
            <div className="neo-card rounded-2xl p-5 space-y-3">
              <h3 className="text-sm font-800 text-vault-text">{tsp('twoFactorHeading')}</h3>
              <p className="text-xs text-vault-muted leading-relaxed">{tsp('twoFactorBody')}</p>
              <button
                type="button"
                className="btn-secondary text-sm py-2 px-4"
                onClick={() => setTotpOpen(true)}
              >
                {tsp('twoFactorSetup')}
              </button>
            </div>
          </UpgradeGate>
          <DangerZone />
        </div>
      </div>
      <TotpSetupModal isOpen={totpOpen} onClose={() => setTotpOpen(false)} />
    </div>
  );
}
