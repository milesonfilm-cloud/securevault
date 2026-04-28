'use client';

import React from 'react';
import { Cloud, Download, RefreshCw, Unplug } from 'lucide-react';
import { useVaultData } from '@/context/VaultDataContext';
import { useCloudSync } from '@/hooks/useCloudSync';
import { cancelScheduledDriveSync } from '@/lib/cloudSync/syncManager';
import { GOOGLE_DRIVE_BACKUP_SETUP_BLURB } from '@/lib/envPublic';
import UpgradeGate from '@/components/UpgradeGate';

export default function CloudSyncSettings() {
  const { vaultData, persistVaultData, refreshVaultData } = useVaultData();
  const cloudEnabled = vaultData.settings.cloudSyncEnabled;
  const {
    connected,
    statusLabel,
    status,
    connectGoogle,
    disconnect,
    syncNow,
    restoreFromDrive,
    googleDriveOAuthReady,
  } = useCloudSync(refreshVaultData);

  const setEnabled = async (on: boolean) => {
    if (!on) cancelScheduledDriveSync();
    await persistVaultData({
      ...vaultData,
      settings: { ...vaultData.settings, cloudSyncEnabled: on },
    });
  };

  return (
    <div className="neo-card rounded-2xl p-6">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-2xl border border-border bg-vault-elevated flex items-center justify-center text-vault-warm shrink-0">
          <Cloud size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-800 text-vault-text">Google Drive backup</h3>
          <p className="text-xs text-vault-muted mt-1 leading-relaxed">
            Optional encrypted copy of your vault in your own Drive. Your key stays on this device.
          </p>
        </div>
      </div>

      <UpgradeGate feature="cloudBackup" requiredPlan="Pro">
        <label className="mb-4 flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            checked={cloudEnabled}
            onChange={(e) => void setEnabled(e.target.checked)}
            className="rounded border-border"
          />
          <span className="text-sm text-vault-text">
            Enable automatic backup (debounced 30s after saves)
          </span>
        </label>
      </UpgradeGate>

      <p
        className={`text-xs font-600 mb-4 ${
          status === 'error'
            ? 'text-red-400'
            : status === 'syncing'
              ? 'text-vault-warm'
              : 'text-vault-faint'
        }`}
      >
        {statusLabel}
      </p>

      <div className="flex flex-wrap gap-2">
        {!connected ? (
          <button
            type="button"
            className="btn-primary text-sm py-2 px-4 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!googleDriveOAuthReady}
            onClick={() => void connectGoogle()}
            title={
              googleDriveOAuthReady
                ? undefined
                : 'OAuth client ID was not set when this app was built'
            }
          >
            Connect Google Drive
          </button>
        ) : (
          <>
            <button
              type="button"
              className="btn-secondary text-sm py-2 px-3 inline-flex items-center gap-2"
              onClick={() => void syncNow()}
              disabled={!cloudEnabled || status === 'syncing'}
            >
              <RefreshCw size={16} className={status === 'syncing' ? 'animate-spin' : ''} />
              Sync now
            </button>
            <button
              type="button"
              className="btn-secondary text-sm py-2 px-3 inline-flex items-center gap-2"
              onClick={() => void restoreFromDrive()}
              disabled={status === 'syncing'}
            >
              <Download size={16} />
              Restore from Drive
            </button>
            <button
              type="button"
              className="btn-secondary text-sm py-2 px-3 inline-flex items-center gap-2 text-vault-coral border-vault-coral/30"
              onClick={() => {
                disconnect();
                void setEnabled(false);
              }}
            >
              <Unplug size={16} />
              Disconnect
            </button>
          </>
        )}
      </div>

      {!googleDriveOAuthReady ? (
        <div className="mt-4 rounded-xl border border-amber-500/25 bg-amber-500/5 px-3 py-2.5 text-left">
          <p className="text-[11px] font-600 text-amber-200/95">
            Drive backup not configured for this build
          </p>
          <p className="text-[11px] text-vault-muted mt-1 leading-relaxed">
            {GOOGLE_DRIVE_BACKUP_SETUP_BLURB}
          </p>
        </div>
      ) : null}
    </div>
  );
}
