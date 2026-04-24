'use client';

import React from 'react';
import { Cloud, Download, RefreshCw, Unplug } from 'lucide-react';
import { useVaultData } from '@/context/VaultDataContext';
import { useCloudSync } from '@/hooks/useCloudSync';
import { cancelScheduledDriveSync } from '@/lib/cloudSync/syncManager';

export default function CloudSyncSettings() {
  const { vaultData, persistVaultData, refreshVaultData } = useVaultData();
  const cloudEnabled = vaultData.settings.cloudSyncEnabled;
  const { connected, statusLabel, status, connectGoogle, disconnect, syncNow, restoreFromDrive } =
    useCloudSync(refreshVaultData);

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
          <h3 className="text-sm font-800 text-vault-text">Encrypted Google Drive backup</h3>
          <p className="text-xs text-vault-muted mt-1 leading-relaxed">
            Uploads the same AES-encrypted vault blob already stored on this device to your Drive{' '}
            <strong className="font-600 text-vault-text">app data</strong> folder (hidden from the
            Drive UI). Your vault key never leaves this device.
          </p>
        </div>
      </div>

      <label className="flex items-center gap-3 cursor-pointer mb-4">
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

      <p
        className={`text-xs font-600 mb-4 ${
          status === 'error' ? 'text-red-400' : status === 'syncing' ? 'text-vault-warm' : 'text-vault-faint'
        }`}
      >
        {statusLabel}
      </p>

      <div className="flex flex-wrap gap-2">
        {!connected ? (
          <button type="button" className="btn-primary text-sm py-2 px-4" onClick={() => void connectGoogle()}>
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

      {!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && (
        <p className="text-[11px] text-amber-400/90 mt-3">
          Add NEXT_PUBLIC_GOOGLE_CLIENT_ID to your environment to use Drive backup.
        </p>
      )}
    </div>
  );
}
