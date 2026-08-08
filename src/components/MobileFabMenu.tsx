'use client';

import React, { useEffect, useId, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import type { LucideIcon } from 'lucide-react';
import {
  CalendarClock,
  Crown,
  FolderLock,
  Info,
  LogOut,
  Menu,
  Settings,
  Trophy,
  Users,
  X,
} from 'lucide-react';
import { useVaultData } from '@/context/VaultDataContext';
import { DEFAULT_EXPIRY_WARN_DAYS } from '@/lib/documentExpiry';
import { countRenewalBadgeDocuments } from '@/lib/notifications/reminderScheduler';
import { lockVaultAndReload } from '@/lib/vaultKeyPersist';
import { cn } from '@/lib/utils';

type FabLink = {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
  upgrade?: true;
};

const fabBtnClass =
  'flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#121212] text-white shadow-[0_8px_28px_rgba(0,0,0,0.28)] transition-transform active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40';

export default function MobileFabMenu({ activePath }: { activePath: string }) {
  const t = useTranslations('nav');
  const tc = useTranslations('common');
  const menuId = useId();
  const [open, setOpen] = useState(false);
  const { vaultData, loading } = useVaultData();
  const renewalBadge = loading
    ? 0
    : countRenewalBadgeDocuments(vaultData.documents, DEFAULT_EXPIRY_WARN_DAYS);
  const isPro = (vaultData.settings.plan ?? 'free') === 'pro';

  const links: FabLink[] = [
    { href: '/family-management', label: t('family'), icon: Users },
    { href: '/document-vault', label: t('vault'), icon: FolderLock },
    { href: '/renewals', label: t('renew'), icon: CalendarClock, badge: renewalBadge },
    { href: '/progress', label: t('progress'), icon: Trophy },
    { href: '/settings-export', label: t('settings'), icon: Settings },
    { href: '/about', label: t('about'), icon: Info },
    {
      href: '/upgrade',
      label: isPro ? 'Pro' : 'Upgrade',
      icon: Crown,
      upgrade: true,
    },
  ];

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      <AnimatePresence>
        {open ? (
          <motion.button
            key="fab-backdrop"
            type="button"
            aria-label={tc('close')}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[45] bg-black/20 backdrop-blur-[2px] lg:hidden"
            onClick={() => setOpen(false)}
          />
        ) : null}
      </AnimatePresence>

      <div
        className={cn(
          'pointer-events-none fixed z-50 lg:hidden',
          'right-[max(1rem,env(safe-area-inset-right,0px))]',
          'bottom-[max(1rem,env(safe-area-inset-bottom,0px))]'
        )}
      >
        <div className="pointer-events-auto flex flex-col items-end gap-3">
          <AnimatePresence>
            {open
              ? [
                  ...links.map((item, i) => {
                    const Icon = item.icon;
                    const active = activePath === item.href;
                    const isUpgradeTab = item.upgrade === true;
                    return (
                      <motion.div
                        key={item.href}
                        initial={{ opacity: 0, y: 22, scale: 0.86 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 16, scale: 0.86 }}
                        transition={{
                          type: 'spring',
                          stiffness: 520,
                          damping: 34,
                          delay: i * 0.04,
                        }}
                      >
                        <Link
                          href={item.href}
                          aria-label={item.label}
                          aria-current={active ? 'page' : undefined}
                          title={item.label}
                          onClick={() => setOpen(false)}
                          className={cn(
                            fabBtnClass,
                            'relative',
                            active && 'ring-2 ring-vault-warm ring-offset-2 ring-offset-transparent',
                            isUpgradeTab &&
                              !active &&
                              !isPro &&
                              'bg-gradient-to-br from-[#4338C9] to-[#7c3aed] text-white',
                            isUpgradeTab && !active && isPro && 'bg-[#212121]/85 text-white'
                          )}
                        >
                          <Icon className="h-6 w-6" strokeWidth={2} aria-hidden />
                          {item.badge != null && item.badge > 0 ? (
                            <span className="absolute -right-0.5 -top-0.5 flex min-w-[1.125rem] items-center justify-center rounded-full bg-[#c62828] px-1 py-px text-[10px] font-bold leading-none text-white shadow-md">
                              {item.badge > 9 ? '9+' : item.badge}
                            </span>
                          ) : null}
                        </Link>
                      </motion.div>
                    );
                  }),
                  <motion.div
                    key="logout"
                    initial={{ opacity: 0, y: 22, scale: 0.86 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 16, scale: 0.86 }}
                    transition={{
                      type: 'spring',
                      stiffness: 520,
                      damping: 34,
                      delay: links.length * 0.04,
                    }}
                  >
                    <button
                      type="button"
                      aria-label={t('logout')}
                      title={t('logout')}
                      onClick={() => {
                        setOpen(false);
                        lockVaultAndReload();
                      }}
                      className={cn(fabBtnClass, 'bg-[#c62828] text-white hover:bg-[#b71c1c]')}
                    >
                      <LogOut className="h-6 w-6" strokeWidth={2} aria-hidden />
                    </button>
                  </motion.div>,
                ]
              : null}
          </AnimatePresence>

          <motion.button
            type="button"
            id={menuId}
            aria-label={open ? tc('close') : t('navigation')}
            aria-expanded={open}
            aria-controls={open ? `${menuId}-items` : undefined}
            onClick={() => setOpen((v) => !v)}
            className={fabBtnClass}
          >
            <AnimatePresence mode="wait" initial={false}>
              {open ? (
                <motion.span
                  key="x"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="flex"
                >
                  <X className="h-7 w-7" strokeWidth={2.25} aria-hidden />
                </motion.span>
              ) : (
                <motion.span
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="flex"
                >
                  <Menu className="h-7 w-7" strokeWidth={2.25} aria-hidden />
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      {/* Invisible landmark for assistive tech when open */}
      <span id={`${menuId}-items`} className="sr-only" aria-live="polite">
        {open ? t('navigation') : ''}
      </span>
    </>
  );
}
