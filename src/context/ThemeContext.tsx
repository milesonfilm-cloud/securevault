'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

export type AppTheme = 'pastel';

const STORAGE_KEY = 'sv_ui_theme';

type ThemeContextValue = {
  theme: AppTheme;
  setTheme: (t: AppTheme) => void;
  toggleTheme: () => void;
  mounted: boolean;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<AppTheme>('pastel');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Single-theme mode: force pastel and keep dataset consistent
    try {
      localStorage.setItem(STORAGE_KEY, 'pastel');
    } catch {
      /* ignore */
    }
    setThemeState('pastel');
    document.documentElement.dataset.theme = 'pastel';
  }, []);

  const setTheme = useCallback((t: AppTheme) => {
    setThemeState(t);
    try {
      localStorage.setItem(STORAGE_KEY, t);
    } catch {
      /* ignore */
    }
    document.documentElement.dataset.theme = t;
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.dataset.theme = theme;
  }, [theme, mounted]);

  /** Single-theme mode: keep pastel */
  const toggleTheme = useCallback(() => setTheme('pastel'), [setTheme]);

  const value: ThemeContextValue = {
    theme,
    setTheme,
    toggleTheme,
    mounted,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return ctx;
}
