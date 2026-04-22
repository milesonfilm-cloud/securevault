'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

export type AppTheme = 'vault' | 'wellness' | 'neon' | 'pastel' | 'voyager';

export const THEME_ORDER: AppTheme[] = ['vault', 'wellness', 'neon', 'pastel', 'voyager'];

export const THEME_LABEL: Record<AppTheme, string> = {
  vault: 'Vault',
  wellness: 'Calm',
  neon: 'Neon',
  pastel: 'Studio',
  voyager: 'Voyager',
};

const STORAGE_KEY = 'sv_ui_theme';

export function getNextTheme(current: AppTheme): AppTheme {
  const i = THEME_ORDER.indexOf(current);
  return THEME_ORDER[(i + 1) % THEME_ORDER.length];
}

function parseStoredTheme(raw: string | null): AppTheme {
  if (
    raw === 'wellness' ||
    raw === 'vault' ||
    raw === 'neon' ||
    raw === 'pastel' ||
    raw === 'voyager'
  )
    return raw;
  if (raw === 'cinema') return 'vault';
  if (raw === 'spectrum') return 'vault';
  return 'vault';
}

type ThemeContextValue = {
  theme: AppTheme;
  setTheme: (t: AppTheme) => void;
  toggleTheme: () => void;
  mounted: boolean;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<AppTheme>('vault');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const next = parseStoredTheme(raw);
      setThemeState(next);
      document.documentElement.dataset.theme = next;
    } catch {
      document.documentElement.dataset.theme = 'vault';
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

  const toggleTheme = useCallback(() => {
    const i = THEME_ORDER.indexOf(theme);
    setTheme(THEME_ORDER[(i + 1) % THEME_ORDER.length]);
  }, [theme, setTheme]);

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
