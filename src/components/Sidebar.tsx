'use client';

import React from 'react';
import Link from 'next/link';
import AppLogo from './ui/AppLogo';
import { FolderLock, Users, Settings, ChevronLeft, ChevronRight, Lock, LogOut } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { clearPersistedVaultKey } from '@/lib/vaultKeyPersist';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

const NAV_ITEMS: NavItem[] = [
  {
    href: '/document-vault',
    label: 'Document Vault',
    icon: <FolderLock size={18} />,
  },
  {
    href: '/family-management',
    label: 'Family Members',
    icon: <Users size={18} />,
  },
  {
    href: '/settings-export',
    label: 'Settings & Export',
    icon: <Settings size={18} />,
  },
];

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  activePath: string;
}

function handleLockVault() {
  sessionStorage.removeItem('sv_session_unlocked');
  clearPersistedVaultKey();
  window.location.reload();
}

function navItemClasses(isActive: boolean, collapsed: boolean): string {
  const base = `sidebar-item ${collapsed ? 'justify-center px-0' : ''}`;
  if (isActive) {
    return `${base} bg-vault-elevated text-white font-semibold`;
  }
  return `${base} text-vault-faint bg-transparent`;
}

function navIconClass(isActive: boolean): string {
  return isActive ? 'text-vault-warm' : 'text-vault-faint';
}

export default function Sidebar({ collapsed, onToggleCollapse, activePath }: SidebarProps) {
  useTheme();

  return (
    <div
      className="flex flex-col h-full transition-all duration-300 ease-in-out bg-vault-panel"
      style={{
        width: collapsed ? 64 : 240,
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center h-16 px-3 flex-shrink-0 border-b"
        style={{ borderColor: 'rgba(255,255,255,0.07)' }}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex-shrink-0">
            <AppLogo size={32} />
          </div>
          {!collapsed && (
            <div>
              <span className="font-bold text-[15px] text-white tracking-tight truncate block leading-tight">
                SecureVault
              </span>
              <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-vault-elevated text-vault-muted text-[9px] font-medium tracking-[2px] uppercase">
                Private
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
        {!collapsed && (
          <p className="px-3 mb-3 text-[9px] font-bold uppercase tracking-[3px] text-vault-faint">
            Navigation
          </p>
        )}
        {NAV_ITEMS.map((item) => {
          const isActive = activePath === item.href;
          return (
            <Link
              key={`nav-${item.href}`}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={`${navItemClasses(isActive, collapsed)} ${
                !isActive ? 'hover:bg-white/[0.05]' : ''
              }`}
            >
              <span className={`flex-shrink-0 transition-colors ${navIconClass(isActive)}`}>
                {item.icon}
              </span>
              {!collapsed && <span className="truncate">{item.label}</span>}
              {!collapsed && item.badge && item.badge > 0 ? (
                <span className="ml-auto bg-vault-elevated text-vault-muted text-xs font-600 px-1.5 py-0.5 rounded-full tabular-nums">
                  {item.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div
        className="px-2 py-3 space-y-1 border-t"
        style={{ borderColor: 'rgba(255,255,255,0.07)' }}
      >
        {!collapsed && (
          <div className="px-3 py-2.5 rounded-[12px] mb-2 bg-vault-elevated">
            <div className="flex items-center gap-2">
              <Lock size={14} className="text-vault-warm flex-shrink-0" />
              <span className="text-xs font-bold text-white">100% Offline</span>
            </div>
            <p className="text-[10px] mt-1 text-vault-muted leading-snug">
              Data never leaves this device
            </p>
          </div>
        )}

        <button
          onClick={handleLockVault}
          className={`sidebar-item w-full border border-vault-coral bg-transparent text-vault-coral hover:bg-white/[0.05] rounded-[10px] ${
            collapsed ? 'justify-center px-0' : ''
          }`}
          title="Lock vault"
        >
          <LogOut size={15} className="flex-shrink-0 text-vault-coral" />
          {!collapsed && <span className="text-xs font-semibold text-vault-coral">Lock Vault</span>}
        </button>

        <button
          onClick={onToggleCollapse}
          className={`sidebar-item w-full text-vault-faint hover:bg-white/[0.05] ${collapsed ? 'justify-center px-0' : ''}`}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <span className="flex-shrink-0 text-vault-faint">
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </span>
          {!collapsed && <span className="text-xs text-vault-faint">Collapse</span>}
        </button>
      </div>
    </div>
  );
}
