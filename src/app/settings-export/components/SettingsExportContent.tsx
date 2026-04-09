'use client';

import React from 'react';
import { Settings } from 'lucide-react';
import StorageMeter from './StorageMeter';
import ExportPanel from './ExportPanel';
import ImportPanel from './ImportPanel';
import ExportHistory from './ExportHistory';
import DangerZone from './DangerZone';
import PWAInstallBanner from './PWAInstallBanner';
import VaultStatsPanel from './VaultStatsPanel';
import BiometricSettings from './BiometricSettings';
import BackupReminderBanner from '@/components/ui/BackupReminderBanner';

export default function SettingsExportContent() {
  return (
    <div className="p-4 lg:p-6 max-w-screen-2xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <p className="text-sm text-slate-500 font-500">Settings</p>
          <h1 className="text-4xl sm:text-[2.75rem] font-800 text-slate-900 tracking-tight leading-tight mt-0.5">
            Backup & App
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            Manage your vault data, backups, and app settings
          </p>
        </div>
        <div className="w-10 h-10 rounded-full bg-black/5 text-slate-700 flex items-center justify-center flex-shrink-0">
          <Settings size={18} />
        </div>
      </div>
      {/* Privacy notice */}
      <div className="bg-white rounded-[1.35rem] border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.04)] px-5 py-4 mb-6 flex items-start gap-3">
        <div className="w-9 h-9 bg-black/5 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#0f172a"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-800 text-slate-900">100% Private — Zero Cloud Storage</p>
          <p className="text-xs text-slate-600 mt-0.5">
            All your data is stored exclusively in your browser&apos;s localStorage on this device.
            SecureVault never transmits, syncs, or backs up any data to any server. Exports download
            directly to your device.
          </p>
        </div>
      </div>

      <BackupReminderBanner className="mb-6" />

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
        {/* Column 1 */}
        <div className="space-y-5">
          <StorageMeter />
          <VaultStatsPanel />
          <BiometricSettings />
          <PWAInstallBanner />
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
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h3 className="text-sm font-700 text-slate-700 mb-3">About SecureVault</h3>
            <div className="space-y-2">
              {[
                { label: 'Version', value: '1.0.0' },
                { label: 'Storage Engine', value: 'Browser localStorage' },
                { label: 'Cloud Sync', value: 'Never — by design' },
                { label: 'Tracking', value: 'None' },
                { label: 'Data Encryption', value: 'Device-level (OS)' },
              ]?.map((item) => (
                <div
                  key={`about-${item?.label}`}
                  className="flex justify-between items-center py-1.5 border-b border-slate-50 last:border-0"
                >
                  <span className="text-xs text-slate-400">{item?.label}</span>
                  <span className="text-xs font-600 text-slate-700">{item?.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
