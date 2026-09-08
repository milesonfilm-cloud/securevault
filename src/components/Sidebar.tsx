'use client';

import React from 'react';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import {
  Crown,
  Users,
  Settings,
  Info,
  ChevronLeft,
  ChevronRight,
  Lock,
  LogOut,
  CalendarClock,
  Trophy,
} from 'lucide-react';
import { lockVaultAndReload } from '@/lib/vaultKeyPersist';
import { useVaultData } from '@/context/VaultDataContext';
import { isPro } from '@/lib/subscription';
import { countRenewalBadgeDocuments } from '@/lib/notifications/reminderScheduler';
import { DEFAULT_EXPIRY_WARN_DAYS } from '@/lib/documentExpiry';
import BrandMarkSvg from '@/components/ui/BrandMarkSvg';
import { cn } from '@/lib/utils';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

function buildNavItems(
  renewalBadge: number,
  t: (k: string) => string,
  plan: 'free' | 'pro'
): NavItem[] {
  return [
    {
      href: '/family-management',
      label: t('familyMembers'),
      icon: <Users size={18} />,
    },
    {
      href: '/renewals',
      label: t('renewals'),
      icon: <CalendarClock size={18} />,
      badge: renewalBadge,
    },
    {
      href: '/progress',
      label: t('progress'),
      icon: <Trophy size={18} />,
    },
    {
      href: '/settings-export',
      label: t('settingsExport'),
      icon: <Settings size={18} />,
    },
    {
      href: '/about',
      label: t('about'),
      icon: <Info size={18} />,
    },
    {
      href: '/upgrade',
      label: plan === 'pro' ? 'Pro ✦' : 'Upgrade to Pro',
      icon: <Crown size={18} />,
    },
  ];
}

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  activePath: string;
}

function navItemClasses(isActive: boolean, collapsed: boolean): string {
  const base = `sidebar-item ${collapsed ? 'justify-center px-0' : ''}`;
  if (isActive) {
    return `${base} font-semibold text-white pastel-sidebar-active`;
  }
  return `${base} bg-transparent text-white/50 hover:bg-white/[0.06]`;
}

function navIconClass(isActive: boolean): string {
  return isActive ? 'text-[color:var(--pastel-member-ink,#cfdeca)]' : 'text-white/40';
}

export default function Sidebar({ collapsed, onToggleCollapse, activePath }: SidebarProps) {
  const t = useTranslations('nav');
  const { vaultData, loading } = useVaultData();
  const renewalBadge = loading
    ? 0
    : countRenewalBadgeDocuments(vaultData.documents, DEFAULT_EXPIRY_WARN_DAYS);
  const plan = isPro(vaultData.settings) ? 'pro' : 'free';
  const NAV_ITEMS = buildNavItems(renewalBadge, t, plan);

  return (
    <div
      className="flex h-full flex-col border-r border-white/10 bg-[#0c0c0e]/90 shadow-vault backdrop-blur-xl transition-all duration-300 ease-in-out"
      style={{
        width: collapsed ? 64 : 240,
      }}
    >
      <div
        className={cn(
          'flex min-h-[72px] flex-shrink-0 items-center border-b border-[color:var(--color-border)] py-2',
          collapsed ? 'justify-center px-1.5' : 'px-3'
        )}
      >
        <Link
          href="/family-management"
          className={cn(
            'flex min-w-0 items-center rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-vault-warm/50',
            collapsed ? 'justify-center' : 'gap-2.5'
          )}
          title={t('familyMembers')}
        >
          <BrandMarkSvg size={collapsed ? 52 : 62} aria-hidden />
          {!collapsed && (
            <div className="min-w-0 text-left">
              <span className="block truncate text-[15px] font-bold leading-tight tracking-tight text-vault-text">
                Strong Vault
              </span>
              <span className="mt-1 inline-block rounded-full bg-vault-elevated px-2 py-0.5 text-[9px] font-medium uppercase tracking-[2px] text-vault-muted">
                {t('private')}
              </span>
            </div>
          )}
        </Link>
      </div>

      <nav
        className="flex-1 space-y-0.5 overflow-y-auto px-2 py-4"
        data-walkthrough="app-menu"
      >
        {!collapsed && (
          <p className="mb-3 px-3 text-[9px] font-bold uppercase tracking-[3px] text-vault-faint">
            {t('navigation')}
          </p>
        )}
        {NAV_ITEMS.map((item) => {
          const isActive = activePath === item.href;
          const isUpgrade = item.href === '/upgrade';
          return (
            <Link
              key={`nav-${item.href}`}
              href={item.href}
              title={collapsed ? item.label : undefined}
              aria-current={isActive ? 'page' : undefined}
              className={
                isUpgrade
                  ? `sidebar-item mt-1 ${collapsed ? 'justify-center px-0' : ''} ${
                      isActive ? 'text-white' : 'text-white hover:brightness-110'
                    }`
                  : navItemClasses(isActive, collapsed)
              }
              style={
                isUpgrade
                  ? isActive
                    ? { background: 'linear-gradient(135deg, #7A3419 0%, #C2410C 100%)' }
                    : plan === 'pro'
                      ? {
                          background:
                            'linear-gradient(135deg, rgba(154,52,18,0.16) 0%, rgba(194,65,12,0.16) 100%)',
                          color: '#9A3412',
                        }
                      : {
                          background:
                            'linear-gradient(135deg, #9A3412 0%, #C2410C 50%, #B45309 100%)',
                        }
                  : undefined
              }
            >
              <span
                className={
                  isUpgrade
                    ? 'flex-shrink-0'
                    : `flex-shrink-0 transition-colors ${navIconClass(isActive)}`
                }
                style={
                  isUpgrade
                    ? plan === 'pro' && !isActive
                      ? { color: '#9A3412' }
                      : { color: '#FDE68A' }
                    : undefined
                }
              >
                {item.icon}
              </span>
              {!collapsed && (
                <span
                  className={isUpgrade ? 'truncate font-bold' : 'truncate'}
                  style={
                    isUpgrade && plan === 'pro' && !isActive ? { color: '#9A3412' } : undefined
                  }
                >
                  {item.label}
                </span>
              )}
              {!collapsed && item.badge && item.badge > 0 ? (
                <span className="ml-auto rounded-full bg-vault-elevated px-1.5 py-0.5 text-xs font-600 tabular-nums text-vault-muted">
                  {item.badge}
                </span>
              ) : null}
              {/* FREE badge for free users */}
              {isUpgrade && !collapsed && plan === 'free' && (
                <span className="ml-auto rounded-full bg-[#FDE68A] px-1.5 py-0.5 text-[9px] font-extrabold text-[#9A3412]">
                  FREE
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-1 border-t border-[color:var(--color-border)] px-2 py-3">
        {!collapsed && (
          <div className="mb-2 rounded-[12px] bg-vault-elevated px-3 py-2.5">
            <div className="flex items-center gap-2">
              <Lock size={14} className="flex-shrink-0 text-vault-warm" />
              <span className="text-xs font-bold text-vault-text">{t('offlineTitle')}</span>
            </div>
            <p className="mt-1 text-[10px] leading-snug text-vault-muted">{t('offlineSubtitle')}</p>
          </div>
        )}

        <button
          onClick={lockVaultAndReload}
          className={`sidebar-item w-full rounded-[10px] border border-vault-coral bg-transparent text-vault-coral hover:bg-vault-elevated/50 ${
            collapsed ? 'justify-center px-0' : ''
          }`}
          title={t('lockVault')}
          aria-label={t('lockVaultButton')}
        >
          <LogOut size={15} className="flex-shrink-0 text-vault-coral" />
          {!collapsed && (
            <span className="text-xs font-semibold text-vault-coral">{t('lockVaultButton')}</span>
          )}
        </button>

        <button
          onClick={onToggleCollapse}
          className={`sidebar-item w-full text-vault-faint hover:bg-vault-elevated/45 ${
            collapsed ? 'justify-center px-0' : ''
          }`}
          title={collapsed ? t('expandSidebar') : t('collapse')}
          aria-label={collapsed ? t('expandSidebar') : t('collapse')}
        >
          <span className="flex-shrink-0 text-vault-faint">
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </span>
          {!collapsed && <span className="text-xs text-vault-faint">{t('collapse')}</span>}
        </button>
      </div>
    </div>
  );
}
