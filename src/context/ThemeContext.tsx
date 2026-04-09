'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

export type AppTheme = 'light' | 'neon' | 'pastel';

const STORAGE_KEY = 'sv_ui_theme';

type ThemeContextValue = {
  theme: AppTheme;
  setTheme: (t: AppTheme) => void;
  toggleTheme: () => void;
  mounted: boolean;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<AppTheme>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw === 'neon' || raw === 'light' || raw === 'pastel') {
        setThemeState(raw);
        document.documentElement.dataset.theme = raw;
      } else {
        document.documentElement.dataset.theme = 'light';
      }
    } catch {
      document.documentElement.dataset.theme = 'light';
    }
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

  /** Cycles light → neon (black) → pastel (ledger) → light */
  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const order: AppTheme[] = ['light', 'neon', 'pastel'];
      const idx = order.indexOf(prev);
      const next = order[(idx + 1) % order.length];
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        /* ignore */
      }
      document.documentElement.dataset.theme = next;
      return next;
    });
  }, []);

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
