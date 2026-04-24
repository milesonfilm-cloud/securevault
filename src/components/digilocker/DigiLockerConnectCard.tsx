'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useVaultData } from '@/context/VaultDataContext';
import { DigiLockerClient } from '@/lib/digilocker/client';

interface DigiLockerConnectCardProps {
  onOpenImport: () => void;
}

export default function DigiLockerConnectCard({ onOpenImport }: DigiLockerConnectCardProps) {
  const { vaultData, persistVaultData } = useVaultData();
  const vaultRef = useRef(vaultData);
  vaultRef.current = vaultData;
  const [connected, setConnected] = useState(false);

  const syncFromStorage = useCallback(() => {
    setConnected(!!DigiLockerClient.getStoredToken());
  }, []);

  useEffect(() => {
    syncFromStorage();
  }, [syncFromStorage]);

  useEffect(() => {
    function onMsg(e: MessageEvent) {
      if (e.origin !== window.location.origin) return;
      if (e.data?.type === 'digilocker-auth' && e.data?.ok) {
        syncFromStorage();
        const v = vaultRef.current;
        void persistVaultData({
          ...v,
          settings: { ...v.settings, digilockerConnectedAt: new Date().toISOString() },
        });
        toast.success('DigiLocker connected');
      }
    }
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, [persistVaultData, syncFromStorage]);

  const connect = () => {
    if (!process.env.NEXT_PUBLIC_DIGILOCKER_CLIENT_ID) {
      toast.error('Set NEXT_PUBLIC_DIGILOCKER_CLIENT_ID in .env');
      return;
    }
    const w = window.open('/api/digilocker/authorize', 'digilocker_oauth', 'width=520,height=720');
    if (!w) {
      toast.error('Popup blocked — allow popups for this site');
    }
  };

  const disconnect = async () => {
    DigiLockerClient.clearStoredToken();
    setConnected(false);
    await persistVaultData({
      ...vaultData,
      settings: { ...vaultData.settings, digilockerConnectedAt: null },
    });
    toast.message('DigiLocker disconnected on this device');
  };

  const last = vaultData.settings.digilockerConnectedAt;

  return (
    <div className="neo-card rounded-2xl p-6">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl border border-border bg-white flex items-center justify-center shrink-0 overflow-hidden p-1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/digilocker-mark.svg" alt="" className="h-9 w-9 object-contain" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-800 text-vault-text">DigiLocker</h3>
          <p className="text-xs text-vault-muted mt-1 leading-relaxed">
            Import issued document metadata from your DigiLocker (OAuth). Access token stays in{' '}
            <strong className="text-vault-text">sessionStorage</strong> only — not persisted to disk
            by SecureVault.
          </p>
          {last && (
            <p className="text-[11px] text-vault-faint mt-2">
              Last linked: {new Date(last).toLocaleString()}
            </p>
          )}
        </div>
      </div>
      <div className="flex flex-wrap gap-2 mt-4">
        {!connected ? (
          <button type="button" className="btn-primary text-sm py-2 px-4" onClick={connect}>
            Connect DigiLocker
          </button>
        ) : (
          <>
            <button type="button" className="btn-primary text-sm py-2 px-4" onClick={onOpenImport}>
              Import documents
            </button>
            <button type="button" className="btn-secondary text-sm py-2 px-4" onClick={disconnect}>
              Disconnect
            </button>
            <span className="inline-flex items-center rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-[11px] font-700 text-emerald-200">
              Connected
            </span>
          </>
        )}
      </div>
    </div>
  );
}
