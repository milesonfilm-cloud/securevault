'use client';

import React from 'react';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { FolderLock, Users, Settings, Info, LogOut, CalendarClock, Trophy } from 'lucide-react';
import { lockVaultAndReload } from '@/lib/vaultKeyPersist';
import { cn } from '@/lib/utils';
import { useVaultData } from '@/context/VaultDataContext';
import { useVaultPermissions } from '@/hooks/useVaultPermissions';
import { countRenewalBadgeDocuments } from '@/lib/notifications/reminderScheduler';
import { DEFAULT_EXPIRY_WARN_DAYS } from '@/lib/documentExpiry';

export default function MobileNav({ activePath }: { activePath: string }) {
  const t = useTranslations('nav');
  const { loading } = useVaultData();
  const { visibleDocuments } = useVaultPermissions();
  const badge = loading
    ? 0
    : countRenewalBadgeDocuments(visibleDocuments, DEFAULT_EXPIRY_WARN_DAYS);

  const MOBILE_LINKS = [
    { href: '/family-management', label: t('family'), icon: <Users size={20} />, badge: 0 },
    { href: '/document-vault', label: t('vault'), icon: <FolderLock size={20} />, badge: 0 },
    { href: '/renewals', label: t('renew'), icon: <CalendarClock size={20} />, badge },
    { href: '/progress', label: t('progress'), icon: <Trophy size={20} />, badge: 0 },
    { href: '/settings-export', label: t('settings'), icon: <Settings size={20} />, badge: 0 },
    { href: '/about', label: t('about'), icon: <Info size={20} />, badge: 0 },
  ];

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
                {item.badge > 0 ? (
                  <span className="absolute -right-1.5 -top-1 min-w-[16px] rounded-full bg-red-500 px-0.5 text-center text-[9px] font-800 leading-4 text-white">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                ) : null}
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
          title={t('lockVault')}
          className="flex min-w-0 flex-1 flex-col items-center gap-1 py-3 text-vault-coral transition-colors hover:bg-vault-coral/10 active:opacity-90"
        >
          <span className="relative [&_svg]:stroke-[1.5]">
            <LogOut size={20} />
          </span>
          <span className="max-w-full truncate px-0.5 text-center text-[11px] font-semibold text-vault-coral sm:text-xs">
            {t('lock')}
          </span>
        </button>
      </div>
    </nav>
  );
}
