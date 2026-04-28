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
import CloudSyncSettings from '@/components/settings/CloudSyncSettings';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import VaultPageHeading from '@/components/ui/VaultPageHeading';
import AuditLogPanel from '@/components/AuditLogPanel';
import UpgradeGate from '@/components/UpgradeGate';
import TotpSetupModal from '@/components/TotpSetupModal';

export default function SettingsExportContent() {
  const ts = useTranslations('settings');
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
          <CloudSyncSettings />
          <BiometricSettings />
          <AppInfoCard />
        </div>

        <div className="space-y-5">
          <ExportPanel />
          <ExportHistory />
        </div>

        <div className="space-y-5 lg:col-span-2 xl:col-span-1">
          <ImportPanel />
          <UpgradeGate feature="auditLog" requiredPlan="Elite">
            <div className="neo-card rounded-2xl p-5">
              <AuditLogPanel />
            </div>
          </UpgradeGate>
          <UpgradeGate feature="totp2fa" requiredPlan="Elite">
            <div className="neo-card rounded-2xl p-5 space-y-3">
              <h3 className="text-sm font-800 text-vault-text">Two-factor authentication</h3>
              <p className="text-xs text-vault-muted leading-relaxed">
                Add an authenticator app for an extra step after your PIN. Recommended if you share
                this device.
              </p>
              <button
                type="button"
                className="btn-secondary text-sm py-2 px-4"
                onClick={() => setTotpOpen(true)}
              >
                Set up authenticator
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
