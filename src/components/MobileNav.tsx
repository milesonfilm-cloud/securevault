'use client';

import React from 'react';
import Link from 'next/link';
import { FolderLock, Users, Settings } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

const MOBILE_NAV = [
  { href: '/document-vault', label: 'Vault', icon: <FolderLock size={20} /> },
  { href: '/family-management', label: 'Family', icon: <Users size={20} /> },
  { href: '/settings-export', label: 'Settings', icon: <Settings size={20} /> },
];

export default function MobileNav({ activePath }: { activePath: string }) {
  const { theme } = useTheme();

  const barStyle =
    theme === 'neon'
      ? {
          background: 'rgba(0, 0, 0, 0.96)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(255,255,255,0.08)',
        }
      : theme === 'pastel'
        ? {
            background: 'rgba(255, 255, 255, 0.94)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderTop: '1px solid rgba(15,23,42,0.08)',
          }
        : {
            background: 'rgba(255, 255, 255, 0.92)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            borderTop: '1px solid rgba(15,23,42,0.08)',
          };

  return (
    <nav className="pb-safe" style={barStyle}>
      <div className="flex">
        {MOBILE_NAV.map((item) => {
          const isActive = activePath === item.href;
          const activeClass =
            theme === 'neon' ? 'text-[#40E0D0]' : theme === 'pastel' ? 'text-slate-900' : 'text-violet-600';
          const inactiveClass =
            theme === 'neon'
              ? 'text-zinc-500 hover:text-zinc-300'
              : 'text-slate-500 hover:text-slate-800';
          const glowClass =
            theme === 'neon' ? 'bg-[#40E0D0]/15' : theme === 'pastel' ? 'bg-black/8' : 'bg-violet-500/20';
          return (
            <Link
              key={`mobile-nav-${item.href}`}
              href={item.href}
              className={`flex-1 flex flex-col items-center gap-1 py-3 transition-all duration-150 ${
                isActive ? activeClass : inactiveClass
              }`}
            >
              <div
                className={`relative transition-all duration-200 ${isActive ? 'scale-110' : ''}`}
              >
                {isActive && (
                  <div className={`absolute inset-0 rounded-lg blur-sm scale-150 ${glowClass}`} />
                )}
                <span className="relative [&_svg]:stroke-[1.5]">{item.icon}</span>
              </div>
              <span className={`text-xs font-600 ${isActive ? activeClass : ''}`}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
