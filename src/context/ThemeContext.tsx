'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
} from 'react';

export type AppTheme = 'neon' | 'pastel';

const STORAGE_KEY = 'sv_ui_theme';

function parseStoredTheme(raw: string | null): AppTheme {
  if (raw === 'pastel') return 'pastel';
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

  useLayoutEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const next = parseStoredTheme(raw);
      setThemeState(next);
      document.documentElement.dataset.theme = next;
    } catch {
      document.documentElement.dataset.theme = 'neon';
    }
    setMounted(true);
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
