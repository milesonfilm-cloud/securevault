'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

export type AppTheme = 'neon';

const STORAGE_KEY = 'sv_ui_theme';

function parseStoredTheme(raw: string | null): AppTheme {
  if (raw === 'neon') return 'neon';
  /* Any other stored value (removed themes) → Neon */
  return 'neon';
}

type ThemeContextValue = {
  theme: AppTheme;
  setTheme: (t: AppTheme) => void;
  mounted: boolean;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<AppTheme>('neon');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const next = parseStoredTheme(raw);
      setThemeState(next);
      if (raw && raw !== 'neon') {
        localStorage.setItem(STORAGE_KEY, 'neon');
      }
      document.documentElement.dataset.theme = 'neon';
    } catch {
      document.documentElement.dataset.theme = 'neon';
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

  const value: ThemeContextValue = {
    theme,
    setTheme,
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
