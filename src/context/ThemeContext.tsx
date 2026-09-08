'use client';

import React, { createContext, useContext, useLayoutEffect, useState } from 'react';

export type AppTheme = 'glass';

const STORAGE_KEY = 'sv_ui_theme';

type ThemeContextValue = {
  theme: AppTheme;
  mounted: boolean;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyGlassTheme() {
  document.documentElement.dataset.theme = 'glass';
  try {
    localStorage.setItem(STORAGE_KEY, 'glass');
  } catch {
    /* ignore */
  }
}

/** App uses the glass look only — pastel theme has been removed. */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useLayoutEffect(() => {
    applyGlassTheme();
    setMounted(true);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme: 'glass', mounted }}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return ctx;
}
