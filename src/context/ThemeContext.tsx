'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
} from 'react';

/** Single app theme — light / family vault styling. Neon vault has been removed. */
export type AppTheme = 'pastel';

const STORAGE_KEY = 'sv_ui_theme';

type ThemeContextValue = {
  theme: AppTheme;
  /** No-op kept for call-site compatibility; theme is always pastel. */
  setTheme: (t: AppTheme) => void;
  mounted: boolean;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useLayoutEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, 'pastel');
    } catch {
      /* ignore */
    }
    document.documentElement.dataset.theme = 'pastel';
    setMounted(true);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = 'pastel';
  }, []);

  const value: ThemeContextValue = {
    theme: 'pastel',
    setTheme: () => {
      try {
        localStorage.setItem(STORAGE_KEY, 'pastel');
      } catch {
        /* ignore */
      }
      document.documentElement.dataset.theme = 'pastel';
    },
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
