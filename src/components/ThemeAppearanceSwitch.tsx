'use client';

import React from 'react';
import { Compass, Moon, Palette, Sun, Zap } from 'lucide-react';
import { getNextTheme, THEME_LABEL, useTheme } from '@/context/ThemeContext';
import { cn } from '@/lib/utils';

type Props = {
  collapsed?: boolean;
  layout: 'sidebar' | 'mobile';
};

export default function ThemeAppearanceSwitch({ collapsed, layout }: Props) {
  const { theme, toggleTheme } = useTheme();
  const next = getNextTheme(theme);
  const nextLabel = THEME_LABEL[next];
  const title = `Current: ${THEME_LABEL[theme]} — switch to ${nextLabel}`;

  const DestIcon =
    next === 'vault'
      ? Moon
      : next === 'wellness'
        ? Sun
        : next === 'neon'
          ? Zap
          : next === 'pastel'
            ? Palette
            : Compass;

  if (layout === 'mobile') {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className="flex items-center gap-2 rounded-full bg-vault-elevated px-3 py-2 text-left text-vault-text shadow-sm transition-colors hover:bg-vault-elevated/80"
        title={title}
      >
        <DestIcon size={18} className="shrink-0 text-vault-warm" />
        <span className="text-[11px] font-semibold leading-tight text-vault-muted">
          {THEME_LABEL[theme]}
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={title}
      className={cn(
        'sidebar-item w-full border border-[color:var(--color-border)] bg-vault-elevated/50 text-vault-text transition-colors hover:bg-vault-elevated',
        collapsed ? 'justify-center px-0' : 'justify-start'
      )}
    >
      <span className="flex-shrink-0">
        <DestIcon size={18} className="text-vault-warm" />
      </span>
      {!collapsed && (
        <span className="truncate text-xs font-semibold text-vault-muted">
          {THEME_LABEL[theme]}
        </span>
      )}
    </button>
  );
}
