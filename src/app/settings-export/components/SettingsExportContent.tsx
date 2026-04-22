'use client';

import React from 'react';
import { Settings } from 'lucide-react';
import StorageMeter from './StorageMeter';
import ExportPanel from './ExportPanel';
import ImportPanel from './ImportPanel';
import ExportHistory from './ExportHistory';
import DangerZone from './DangerZone';
import AppInfoCard from './AppInfoCard';
import VaultStatsPanel from './VaultStatsPanel';
import BiometricSettings from './BiometricSettings';
import BackupReminderBanner from '@/components/ui/BackupReminderBanner';

export default function SettingsExportContent() {
  return (
    <div className="p-4 lg:p-6 max-w-screen-2xl mx-auto bg-vault-bg min-h-full">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <p className="text-xs text-vault-faint font-medium">Settings</p>
          <h1 className="text-[32px] font-bold text-vault-text tracking-tight leading-tight mt-0.5">
            Backup & App
          </h1>
          <p className="text-[13px] text-vault-muted mt-2">
            Manage your vault data, backups, and app settings
          </p>
        </div>
        <div className="w-10 h-10 rounded-full bg-vault-elevated text-vault-warm flex items-center justify-center flex-shrink-0 border border-border">
          <Settings size={18} />
        </div>
      </div>
      {/* Privacy notice */}
      <div className="neo-card rounded-2xl px-5 py-4 mb-6 flex items-start gap-3">
        <div className="w-9 h-9 rounded-2xl border border-border bg-vault-elevated flex items-center justify-center shrink-0 mt-0.5 text-vault-warm">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-800 text-vault-text">100% Private — Zero Cloud Storage</p>
          <p className="text-xs text-vault-muted mt-0.5">
            All your data is stored locally in this app on your device (app storage). SecureVault never
            transmits, syncs, or backs up vault data to any server. Encrypted exports save directly to
            your device when you choose.
          </p>
        </div>
      </div>

      <BackupReminderBanner variant="dark" className="mb-6" />

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
        {/* Column 1 */}
        <div className="space-y-5">
          <StorageMeter />
          <VaultStatsPanel />
          <BiometricSettings />
          <AppInfoCard />
        </div>

        {/* Column 2 */}
        <div className="space-y-5">
          <ExportPanel />
          <ExportHistory />
        </div>

        {/* Column 3 */}
        <div className="space-y-5 lg:col-span-2 xl:col-span-1">
          <ImportPanel />
          <DangerZone />

          {/* App info */}
          <div className="neo-card rounded-2xl p-6">
            <h3 className="text-sm font-800 text-vault-text mb-3">About SecureVault</h3>
            <div className="space-y-2">
              {[
                { label: 'Version', value: '1.0.0' },
                { label: 'Storage', value: 'Local app storage' },
                { label: 'Cloud Sync', value: 'Never — by design' },
                { label: 'Tracking', value: 'None' },
                { label: 'Data Encryption', value: 'Device-level (OS)' },
              ]?.map((item) => (
                <div
                  key={`about-${item?.label}`}
                  className="flex justify-between items-center py-1.5 border-b border-border last:border-0"
                >
                  <span className="text-xs text-vault-faint">{item?.label}</span>
                  <span className="text-xs font-700 text-vault-muted">{item?.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
