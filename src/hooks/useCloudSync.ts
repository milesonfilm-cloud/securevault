'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  getLastSyncTime,
  getStoredAccessToken,
  restoreBackupToIdb,
  setStoredAccessToken,
  uploadBackup,
} from '@/lib/cloudSync/googleDriveSync';

const GIS_SCRIPT = 'https://accounts.google.com/gsi/client';

export type CloudSyncStatus = 'idle' | 'syncing' | 'success' | 'error';

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (resp: { access_token?: string; error?: string }) => void;
          }) => { requestAccessToken: (opts?: { prompt?: string }) => void };
        };
      };
    };
  }
}

function loadGis(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.google?.accounts?.oauth2) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = GIS_SCRIPT;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('gis_load_failed'));
    document.head.appendChild(s);
  });
}

export function useCloudSync(refreshVault?: () => Promise<void>) {
  const [connected, setConnected] = useState(false);
  const [status, setStatus] = useState<CloudSyncStatus>('idle');
  const [lastSync, setLastSync] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refreshMeta = useCallback(() => {
    setConnected(!!getStoredAccessToken());
    setLastSync(getLastSyncTime());
  }, []);

  useEffect(() => {
    refreshMeta();
  }, [refreshMeta]);

  const connectGoogle = useCallback(async () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) {
      setError('Set NEXT_PUBLIC_GOOGLE_CLIENT_ID in .env');
      return;
    }
    await loadGis();
    await new Promise<void>((resolve, reject) => {
      const client = window.google!.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'https://www.googleapis.com/auth/drive.appdata',
        callback: (resp) => {
          if (resp.error) {
            setError(resp.error);
            reject(new Error(resp.error));
            return;
          }
          if (resp.access_token) {
            setStoredAccessToken(resp.access_token);
            setError(null);
            refreshMeta();
            resolve();
          }
        },
      });
      client.requestAccessToken();
    });
  }, [refreshMeta]);

  const disconnect = useCallback(() => {
    setStoredAccessToken(null);
    refreshMeta();
  }, [refreshMeta]);

  const syncNow = useCallback(async () => {
    const token = getStoredAccessToken();
    if (!token) {
      setStatus('error');
      setError('Connect Google Drive first');
      return;
    }
    setStatus('syncing');
    setError(null);
    try {
      await uploadBackup(token);
      setLastSync(getLastSyncTime());
      setStatus('success');
      window.setTimeout(() => setStatus('idle'), 2500);
    } catch (e) {
      setStatus('error');
      setError(e instanceof Error ? e.message : 'Sync failed — retry');
    }
  }, []);

  const restoreFromDrive = useCallback(async () => {
    const token = getStoredAccessToken();
    if (!token) {
      setStatus('error');
      setError('Connect Google Drive first');
      return;
    }
    setStatus('syncing');
    setError(null);
    try {
      await restoreBackupToIdb(token);
      if (refreshVault) await refreshVault();
      setLastSync(getLastSyncTime());
      setStatus('success');
      window.setTimeout(() => setStatus('idle'), 2500);
    } catch (e) {
      setStatus('error');
      setError(e instanceof Error ? e.message : 'Restore failed');
    }
  }, [refreshVault]);

  const statusLabel =
    status === 'syncing'
      ? 'Syncing…'
      : status === 'error'
        ? `Sync failed — ${error ?? 'retry'}`
        : status === 'success'
          ? 'Synced ✓'
          : lastSync
            ? `Synced ${formatRelative(lastSync)} ✓`
            : 'Not synced yet';

  return {
    connected,
    status,
    statusLabel,
    lastSync,
    error,
    connectGoogle,
    disconnect,
    syncNow,
    restoreFromDrive,
    refreshMeta,
  };
}

function formatRelative(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)} mins ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} hours ago`;
  return `${Math.floor(s / 86400)} days ago`;
}
