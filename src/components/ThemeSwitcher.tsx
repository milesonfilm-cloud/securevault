'use client';

import React from 'react';
import { Moon, Sun, Receipt } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

type ThemeSwitcherProps = {
  className?: string;
  /** Smaller hit target for dense headers */
  compact?: boolean;
};

export default function ThemeSwitcher({ className = '', compact }: ThemeSwitcherProps) {
  const { theme, toggleTheme, mounted } = useTheme();
  const sz = compact ? 17 : 18;

  const { title, ring, btn, icon } =
    theme === 'neon'
      ? {
          title: 'Switch to pastel ledger theme',
          ring: 'focus-visible:ring-[#40E0D0] focus-visible:ring-offset-black',
          btn: 'bg-white/10 text-[#DFFF4F] hover:bg-white/15',
          icon: <Receipt size={sz} strokeWidth={2} />,
        }
      : theme === 'pastel'
        ? {
            title: 'Switch to light theme',
            ring: 'focus-visible:ring-slate-400 focus-visible:ring-offset-white',
            btn: 'bg-white text-slate-800 shadow-sm border border-slate-200/90 hover:bg-slate-50',
            icon: <Sun size={sz} strokeWidth={2} />,
          }
        : {
            title: 'Switch to black theme',
            ring: 'focus-visible:ring-violet-500 focus-visible:ring-offset-white',
            btn: 'bg-white/80 text-slate-600 shadow-sm border border-slate-200/80 hover:bg-white',
            icon: <Moon size={sz} strokeWidth={2} />,
          };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={title}
      aria-label={title}
      className={[
        'rounded-full flex items-center justify-center transition-all duration-200 active:scale-95',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        compact ? 'w-9 h-9' : 'w-10 h-10',
        ring,
        btn,
        className,
      ].join(' ')}
      disabled={!mounted}
    >
      {icon}
    </button>
  );
}
