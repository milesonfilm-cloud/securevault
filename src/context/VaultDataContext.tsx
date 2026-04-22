'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { loadVaultDataAsync, saveVaultDataAsync, type VaultData } from '@/lib/storage';

const emptyVault: VaultData = {
  members: [],
  documents: [],
  exportHistory: [],
  documentStacks: [],
};

type VaultDataContextValue = {
  vaultData: VaultData;
  loading: boolean;
  setVaultData: React.Dispatch<React.SetStateAction<VaultData>>;
  persistVaultData: (data: VaultData) => Promise<void>;
  refreshVaultData: () => Promise<void>;
};

const VaultDataContext = createContext<VaultDataContextValue | null>(null);

export function VaultDataProvider({ children }: { children: React.ReactNode }) {
  const [vaultData, setVaultData] = useState<VaultData>(emptyVault);
  const [loading, setLoading] = useState(true);

  const refreshVaultData = useCallback(async () => {
    const data = await loadVaultDataAsync();
    setVaultData(data);
  }, []);

  useEffect(() => {
    let cancelled = false;
    loadVaultDataAsync().then((data) => {
      if (!cancelled) {
        setVaultData(data);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const persistVaultData = useCallback(async (data: VaultData) => {
    await saveVaultDataAsync(data);
    setVaultData(data);
  }, []);

  const value: VaultDataContextValue = {
    vaultData,
    loading,
    setVaultData,
    persistVaultData,
    refreshVaultData,
  };

  return <VaultDataContext.Provider value={value}>{children}</VaultDataContext.Provider>;
}

export function useVaultData() {
  const ctx = useContext(VaultDataContext);
  if (!ctx) {
    throw new Error('useVaultData must be used within VaultDataProvider');
  }
  return ctx;
}
