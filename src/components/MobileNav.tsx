'use client';

import React from 'react';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { Crown, FolderLock, Users, Settings, Info, LogOut, CalendarClock, Trophy } from 'lucide-react';
import { lockVaultAndReload } from '@/lib/vaultKeyPersist';
import { cn } from '@/lib/utils';
import { useVaultData } from '@/context/VaultDataContext';
import { useTheme } from '@/context/ThemeContext';
import { countRenewalBadgeDocuments } from '@/lib/notifications/reminderScheduler';
import { DEFAULT_EXPIRY_WARN_DAYS } from '@/lib/documentExpiry';

export default function MobileNav({ activePath }: { activePath: string }) {
  const t = useTranslations('nav');
  const { theme } = useTheme();
  const pastel = theme === 'pastel';
  const { vaultData, loading } = useVaultData();
  const badge = loading
    ? 0
    : countRenewalBadgeDocuments(vaultData.documents, DEFAULT_EXPIRY_WARN_DAYS);

  const isPro = (vaultData.settings.plan ?? 'free') === 'pro';

  const MOBILE_LINKS = [
    { href: '/family-management', label: t('family'), icon: <Users size={20} />, badge: 0 },
    { href: '/document-vault', label: t('vault'), icon: <FolderLock size={20} />, badge: 0 },
    { href: '/renewals', label: t('renew'), icon: <CalendarClock size={20} />, badge },
    { href: '/progress', label: t('progress'), icon: <Trophy size={20} />, badge: 0 },
    { href: '/settings-export', label: t('settings'), icon: <Settings size={20} />, badge: 0 },
    {
      href: '/upgrade',
      label: isPro ? 'Pro' : 'Upgrade',
      icon: <Crown size={20} />,
      badge: 0,
      isPro,
    },
  ];

  return (
    <nav
      className={cn(
        'pl-safe pr-safe pb-safe [touch-action:manipulation]',
        pastel
          ? 'pastel-mobile-nav'
          : 'border-t border-[color:var(--color-border)] bg-vault-panel shadow-vault'
      )}
    >
      <div className="flex min-h-[52px] items-stretch sm:min-h-0">
        {MOBILE_LINKS.map((item) => {
          const isActive = activePath === item.href;
          const isUpgrade = item.href === '/upgrade';
          return (
            <Link
              key={`mobile-nav-${item.href}`}
              href={item.href}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'relative flex min-h-[52px] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 py-2 transition-all duration-150 sm:min-h-0 sm:gap-1 sm:py-3',
                isUpgrade
                  ? 'text-[#4338C9]'
                  : pastel
                    ? isActive
                      ? 'text-[color:var(--pastel-member-ink,#212121)]'
                      : 'text-[#212121]/50 hover:text-[#212121]/70'
                    : isActive
                      ? 'text-vault-warm'
                      : 'text-vault-faint hover:text-vault-muted'
              )}
            >
              {pastel && isActive ? (
                <span
                  className="absolute left-1/2 top-0 h-[3px] w-8 -translate-x-1/2 rounded-full"
                  style={{ background: isUpgrade ? '#4338C9' : 'var(--pastel-member-ink, #212121)' }}
                  aria-hidden
                />
              ) : null}
              <div
                className={cn(
                  'relative transition-all duration-200',
                  !pastel && isActive ? 'scale-110' : '',
                  pastel && !isActive && !isUpgrade ? 'opacity-[0.35]' : ''
                )}
              >
                {!pastel && isActive ? (
                  <div className="absolute inset-0 scale-150 rounded-lg bg-vault-warm/15 blur-sm" />
                ) : null}
                <span className="relative [&_svg]:stroke-[1.5]">{item.icon}</span>
                {item.badge > 0 ? (
                  <span
                    className={cn(
                      'absolute -right-1.5 -top-1 min-w-[16px] rounded-full bg-red-500 px-0.5 text-center text-[9px] font-800 leading-4 text-white',
                      pastel ? 'pastel-nav-badge-reveal' : ''
                    )}
                  >
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                ) : null}
                {/* Pro sparkle for upgrade tab when free */}
                {isUpgrade && !('isPro' in item && item.isPro) && (
                  <span
                    className="absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#4338C9] text-[7px] font-extrabold text-yellow-300 shadow"
                  >
                    ✦
                  </span>
                )}
              </div>
              <span
                className={cn(
                  'max-w-full truncate px-0.5 text-center text-[11px] sm:text-xs',
                  isUpgrade
                    ? isActive ? 'font-extrabold' : 'font-bold'
                    : pastel
                      ? isActive
                        ? 'font-bold text-[color:var(--pastel-member-ink,#212121)]'
                        : 'font-semibold text-[#212121]/35'
                      : isActive
                        ? 'font-semibold text-vault-text'
                        : 'font-semibold text-vault-muted'
                )}
                style={isUpgrade ? { color: '#4338C9' } : undefined}
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
          aria-label={t('lockVault')}
          className={cn(
            'flex min-h-[52px] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 py-2 transition-colors active:opacity-90 sm:min-h-0 sm:gap-1 sm:py-3',
            pastel
              ? 'text-[#c62828] hover:bg-[#212121]/04'
              : 'text-vault-coral hover:bg-vault-coral/10'
          )}
        >
          <span className="relative [&_svg]:stroke-[1.5]">
            <LogOut size={20} />
          </span>
          <span
            className={cn(
              'max-w-full truncate px-0.5 text-center text-[11px] font-semibold sm:text-xs',
              pastel ? 'font-bold text-[#c62828]' : 'text-vault-coral'
            )}
          >
            {t('lock')}
          </span>
        </button>
      </div>
    </nav>
  );
}
