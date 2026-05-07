'use client';

import React, { createContext, useCallback, useContext, useLayoutEffect, useState } from 'react';

const STORAGE_KEY = 'sv_pastel_accent_member_id';

function readStoredAccentMemberId(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

type PastelMemberAccentContextValue = {
  /** Focused family member for pastel accent (stack front card); persisted while unlocked. */
  accentMemberId: string | null;
  setAccentMemberId: (id: string | null) => void;
  /** True after localStorage accent has been read (client-only). */
  accentHydrated: boolean;
};

const PastelMemberAccentContext = createContext<PastelMemberAccentContextValue | null>(null);

export function PastelMemberAccentProvider({ children }: { children: React.ReactNode }) {
  const [accentMemberId, setAccentMemberIdState] = useState<string | null>(null);
  const [accentHydrated, setAccentHydrated] = useState(false);

  useLayoutEffect(() => {
    setAccentMemberIdState(readStoredAccentMemberId());
    setAccentHydrated(true);
  }, []);

  const setAccentMemberId = useCallback((id: string | null) => {
    setAccentMemberIdState(id);
    try {
      if (id) localStorage.setItem(STORAGE_KEY, id);
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  return (
    <PastelMemberAccentContext.Provider
      value={{ accentMemberId, setAccentMemberId, accentHydrated }}
    >
      {children}
    </PastelMemberAccentContext.Provider>
  );
}

export function usePastelMemberAccent() {
  const ctx = useContext(PastelMemberAccentContext);
  if (!ctx) {
    throw new Error('usePastelMemberAccent must be used within PastelMemberAccentProvider');
  }
  return ctx;
}
