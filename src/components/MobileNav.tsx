'use client';

import React from 'react';
import Link from 'next/link';
import { FolderLock, Users, Settings, Info, LogOut } from 'lucide-react';
import { lockVaultAndReload } from '@/lib/vaultKeyPersist';
import { cn } from '@/lib/utils';

const MOBILE_LINKS = [
  { href: '/family-management', label: 'Family', icon: <Users size={20} /> },
  { href: '/document-vault', label: 'Vault', icon: <FolderLock size={20} /> },
  { href: '/settings-export', label: 'Settings', icon: <Settings size={20} /> },
  { href: '/about', label: 'About', icon: <Info size={20} /> },
] as const;

export default function MobileNav({ activePath }: { activePath: string }) {
  return (
    <nav className="border-t border-[color:var(--color-border)] bg-vault-panel pb-safe shadow-vault">
      <div className="flex">
        {MOBILE_LINKS.map((item) => {
          const isActive = activePath === item.href;
          return (
            <Link
              key={`mobile-nav-${item.href}`}
              href={item.href}
              className={cn(
                'flex min-w-0 flex-1 flex-col items-center gap-1 py-3 transition-all duration-150',
                isActive ? 'text-vault-warm' : 'text-vault-faint hover:text-vault-muted'
              )}
            >
              <div
                className={cn('relative transition-all duration-200', isActive ? 'scale-110' : '')}
              >
                {isActive && (
                  <div className="absolute inset-0 scale-150 rounded-lg bg-vault-warm/15 blur-sm" />
                )}
                <span className="relative [&_svg]:stroke-[1.5]">{item.icon}</span>
              </div>
              <span
                className={cn(
                  'max-w-full truncate px-0.5 text-center text-[11px] font-semibold sm:text-xs',
                  isActive ? 'text-vault-text' : 'text-vault-muted'
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
        <button
          type="button"
          onClick={lockVaultAndReload}
          title="Lock vault"
          className="flex min-w-0 flex-1 flex-col items-center gap-1 py-3 text-vault-coral transition-colors hover:bg-vault-coral/10 active:opacity-90"
        >
          <span className="relative [&_svg]:stroke-[1.5]">
            <LogOut size={20} />
          </span>
          <span className="max-w-full truncate px-0.5 text-center text-[11px] font-semibold text-vault-coral sm:text-xs">
            Lock
          </span>
        </button>
      </div>
    </nav>
  );
}
