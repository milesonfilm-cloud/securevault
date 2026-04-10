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
  useTheme();

  return (
    <nav className="pb-safe bg-vault-panel border-t border-[rgba(255,255,255,0.07)] shadow-vault">
      <div className="flex">
        {MOBILE_NAV.map((item) => {
          const isActive = activePath === item.href;
          return (
            <Link
              key={`mobile-nav-${item.href}`}
              href={item.href}
              className={`flex-1 flex flex-col items-center gap-1 py-3 transition-all duration-150 ${
                isActive ? 'text-vault-warm' : 'text-vault-faint hover:text-vault-muted'
              }`}
            >
              <div
                className={`relative transition-all duration-200 ${isActive ? 'scale-110' : ''}`}
              >
                {isActive && (
                  <div className="absolute inset-0 rounded-lg blur-sm scale-150 bg-vault-warm/15" />
                )}
                <span className="relative [&_svg]:stroke-[1.5]">{item.icon}</span>
              </div>
              <span className={`text-xs font-semibold ${isActive ? 'text-white' : ''}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
