'use client';

import React from 'react';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import AppLogo from './ui/AppLogo';
import {
  FolderLock,
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
import ThemeAppearanceSwitch from '@/components/ThemeAppearanceSwitch';
import { useVaultData } from '@/context/VaultDataContext';
import { useVaultPermissions } from '@/hooks/useVaultPermissions';
import {
  countRenewalBadgeDocuments,
} from '@/lib/notifications/reminderScheduler';
import { DEFAULT_EXPIRY_WARN_DAYS } from '@/lib/documentExpiry';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

function buildNavItems(renewalBadge: number, t: (k: string) => string): NavItem[] {
  return [
    {
      href: '/family-management',
      label: t('familyMembers'),
      icon: <Users size={18} />,
    },
    {
      href: '/document-vault',
      label: t('documentVault'),
      icon: <FolderLock size={18} />,
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
    return `${base} bg-vault-elevated text-vault-text font-semibold`;
  }
  return `${base} text-vault-faint bg-transparent hover:bg-vault-elevated/45`;
}

function navIconClass(isActive: boolean): string {
  return isActive ? 'text-vault-warm' : 'text-vault-faint';
}

export default function Sidebar({ collapsed, onToggleCollapse, activePath }: SidebarProps) {
  const t = useTranslations('nav');
  const { vaultData, loading } = useVaultData();
  const { visibleDocuments } = useVaultPermissions();
  const renewalBadge = loading
    ? 0
    : countRenewalBadgeDocuments(visibleDocuments, DEFAULT_EXPIRY_WARN_DAYS);
  const NAV_ITEMS = buildNavItems(renewalBadge, t);

  return (
    <div
      className="flex h-full flex-col border-r border-[color:var(--color-border)] bg-vault-panel shadow-vault transition-all duration-300 ease-in-out"
      style={{
        width: collapsed ? 64 : 240,
      }}
    >
      <div className="flex h-16 flex-shrink-0 items-center border-b border-[color:var(--color-border)] px-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <Link href="/family-management" className="flex-shrink-0 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-vault-warm/50" title={t('familyMembers')}>
            <AppLogo size={32} />
          </Link>
          {!collapsed && (
            <div>
              <span className="block truncate text-[15px] font-bold leading-tight tracking-tight text-vault-text">
                SecureVault
              </span>
              <span className="mt-1 inline-block rounded-full bg-vault-elevated px-2 py-0.5 text-[9px] font-medium uppercase tracking-[2px] text-vault-muted">
                {t('private')}
              </span>
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 py-4">
        {!collapsed && (
          <p className="mb-3 px-3 text-[9px] font-bold uppercase tracking-[3px] text-vault-faint">
            {t('navigation')}
          </p>
        )}
        {NAV_ITEMS.map((item) => {
          const isActive = activePath === item.href;
          return (
            <Link
              key={`nav-${item.href}`}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={navItemClasses(isActive, collapsed)}
            >
              <span className={`flex-shrink-0 transition-colors ${navIconClass(isActive)}`}>
                {item.icon}
              </span>
              {!collapsed && <span className="truncate">{item.label}</span>}
              {!collapsed && item.badge && item.badge > 0 ? (
                <span className="ml-auto rounded-full bg-vault-elevated px-1.5 py-0.5 text-xs font-600 tabular-nums text-vault-muted">
                  {item.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="mx-2 border-t border-[color:var(--color-border)] px-2 pb-2 pt-3">
        <div className="flex justify-start">
          <ThemeAppearanceSwitch collapsed={collapsed} layout="sidebar" />
        </div>
      </div>

      <div className="space-y-1 border-t border-[color:var(--color-border)] px-2 py-3">
        {!collapsed && (
          <div className="mb-2 rounded-[12px] bg-vault-elevated px-3 py-2.5">
            <div className="flex items-center gap-2">
              <Lock size={14} className="flex-shrink-0 text-vault-warm" />
              <span className="text-xs font-bold text-vault-text">{t('offlineTitle')}</span>
            </div>
            <p className="mt-1 text-[10px] leading-snug text-vault-muted">
              {t('offlineSubtitle')}
            </p>
          </div>
        )}

        <button
          onClick={lockVaultAndReload}
          className={`sidebar-item w-full rounded-[10px] border border-vault-coral bg-transparent text-vault-coral hover:bg-vault-elevated/50 ${
            collapsed ? 'justify-center px-0' : ''
          }`}
          title={t('lockVault')}
        >
          <LogOut size={15} className="flex-shrink-0 text-vault-coral" />
          {!collapsed && <span className="text-xs font-semibold text-vault-coral">{t('lockVaultButton')}</span>}
        </button>

        <button
          onClick={onToggleCollapse}
          className={`sidebar-item w-full text-vault-faint hover:bg-vault-elevated/45 ${
            collapsed ? 'justify-center px-0' : ''
          }`}
          title={collapsed ? t('expandSidebar') : t('collapse')}
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
