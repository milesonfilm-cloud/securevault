'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  loadVaultDataAsync,
  saveVaultDataAsync,
  defaultStreakData,
  defaultVaultSettings,
  type VaultData,
} from '@/lib/storage';
import { checkBadgeUnlocks } from '@/lib/gamification/badges';
import { checkInStreak } from '@/lib/gamification/streaks';
import { scheduleDriveSyncDebounced } from '@/lib/cloudSync/syncManager';
import { toast } from 'sonner';
import {
  rescheduleExpiryReminders,
  ensureExpiryReminderTicker,
  registerExpiryServiceWorker,
} from '@/lib/notifications/reminderScheduler';

const emptyVault: VaultData = {
  members: [],
  documents: [],
  exportHistory: [],
  documentStacks: [],
  shareLinks: [],
  emergencyContact: null,
  settings: defaultVaultSettings(),
  streakData: defaultStreakData(),
};

const GAMIFICATION_HYDRATE_SESSION = 'sv_gamification_hydrate_v1';

type VaultDataContextValue = {
  vaultData: VaultData;
  loading: boolean;
  setVaultData: React.Dispatch<React.SetStateAction<VaultData>>;
  persistVaultData: (data: VaultData) => Promise<void>;
  refreshVaultData: () => Promise<void>;
};

const VaultDataContext = createContext<VaultDataContextValue | null>(null);

function mergeUnlockedBadges(data: VaultData, newBadgeIds: string[]): VaultData {
  if (newBadgeIds.length === 0) return data;
  return {
    ...data,
    streakData: {
      ...data.streakData,
      badges: [...new Set([...data.streakData.badges, ...newBadgeIds])],
    },
  };
}

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

  useEffect(() => {
    ensureExpiryReminderTicker();
    void registerExpiryServiceWorker();
  }, []);

  useEffect(() => {
    if (loading) return;
    rescheduleExpiryReminders(vaultData.documents, vaultData.settings);
  }, [loading, vaultData.documents, vaultData.settings.notificationsEnabled]);

  /** Once per browser session: backfill badges for vaults that already qualify (survives React Strict Mode). */
  useEffect(() => {
    if (loading) return;
    try {
      if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem(GAMIFICATION_HYDRATE_SESSION)) {
        return;
      }
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem(GAMIFICATION_HYDRATE_SESSION, '1');
      }
    } catch {
      return;
    }
    checkInStreak();
    const unlocked = checkBadgeUnlocks(vaultData);
    if (unlocked.length === 0) return;
    const toSave = mergeUnlockedBadges(vaultData, unlocked.map((b) => b.id));
    void (async () => {
      await saveVaultDataAsync(toSave);
      setVaultData(toSave);
      unlocked.forEach((b) =>
        toast.success(`${b.icon} Badge unlocked: ${b.name}`, { description: b.description })
      );
    })();
  }, [loading, vaultData]);

  const persistVaultData = useCallback(async (data: VaultData) => {
    checkInStreak();
    const unlocked = checkBadgeUnlocks(data);
    const toSave =
      unlocked.length > 0 ? mergeUnlockedBadges(data, unlocked.map((b) => b.id)) : data;
    await saveVaultDataAsync(toSave);
    setVaultData(toSave);
    scheduleDriveSyncDebounced(toSave.settings.cloudSyncEnabled);
    unlocked.forEach((b) =>
      toast.success(`${b.icon} Badge unlocked: ${b.name}`, { description: b.description })
    );
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
