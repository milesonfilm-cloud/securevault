'use client';

import React, { useEffect, useId, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import type { LucideIcon } from 'lucide-react';
import {
  CalendarClock,
  Crown,
  Info,
  LogOut,
  Menu,
  Settings,
  Trophy,
  Users,
  X,
} from 'lucide-react';
import { useVaultData } from '@/context/VaultDataContext';
import { isPro as isProPlan } from '@/lib/subscription';
import { useWalkthroughUi } from '@/components/ui/AppWalkthrough';
import { lockVaultAndReload } from '@/lib/vaultKeyPersist';
import { DEFAULT_EXPIRY_WARN_DAYS } from '@/lib/documentExpiry';
import { countRenewalBadgeDocuments } from '@/lib/notifications/reminderScheduler';
import { cn } from '@/lib/utils';

type FabLink = {
  href?: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
  upgrade?: true;
  lock?: true;
};

const fabBtnClass =
  'sv-fab-chip flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] bg-[#121212] text-white shadow-[0_10px_24px_rgba(0,0,0,0.22)] transition-transform active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40';

const FAN_CHIP = 48;
const FAN_GAP = 12;

/**
 * Quarter-arc fan in the upper-left quadrant from a bottom-right FAB.
 * Radius is chosen so chip centers are spaced enough to read every icon.
 */
function fanPose(index: number, total: number, radius: number) {
  const t = total <= 1 ? 0.5 : index / (total - 1);
  const start = Math.PI;
  const end = Math.PI / 2;
  const angle = start + t * (end - start);
  return {
    x: Math.cos(angle) * radius,
    y: -Math.sin(angle) * radius,
    rotate: 0,
  };
}

function fanRadius(total: number, viewportH: number, viewportW: number): number {
  if (total <= 1) return 128;
  const arcSpan = Math.PI / 2;
  const stepRad = arcSpan / (total - 1);
  const centerSpacing = FAN_CHIP + FAN_GAP;
  const needed = centerSpacing / (2 * Math.sin(stepRad / 2));
  const maxByHeight = viewportH * 0.42;
  const maxByWidth = viewportW * 0.55;
  return Math.round(Math.min(Math.max(needed, 128), maxByHeight, maxByWidth));
}

export default function MobileFabMenu({ activePath }: { activePath: string }) {
  const t = useTranslations('nav');
  const tc = useTranslations('common');
  const menuId = useId();
  const [open, setOpen] = useState(false);
  const [fanRadiusPx, setFanRadiusPx] = useState(168);
  const { vaultData, loading } = useVaultData();
  const walkthrough = useWalkthroughUi();
  const forceOpen = walkthrough.active && walkthrough.stepId === 'menu';
  const renewalBadge = loading
    ? 0
    : countRenewalBadgeDocuments(vaultData.documents, DEFAULT_EXPIRY_WARN_DAYS);
  const isPro = isProPlan(vaultData.settings);

  const items: FabLink[] = [
    { href: '/family-management', label: t('family'), icon: Users },
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
    { label: t('lockVault'), icon: LogOut, lock: true },
  ];

  const fanCount = items.length;

  useEffect(() => {
    const sync = () =>
      setFanRadiusPx(fanRadius(fanCount, window.innerHeight, window.innerWidth));
    sync();
    window.addEventListener('resize', sync);
    return () => window.removeEventListener('resize', sync);
  }, [fanCount]);

  useEffect(() => {
    setOpen(Boolean(forceOpen));
  }, [forceOpen, walkthrough.active]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !forceOpen) setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, forceOpen]);

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
            className={cn(
              'fixed inset-0 z-[45] bg-black/20',
              !forceOpen && 'backdrop-blur-[2px]'
            )}
            onClick={() => {
              if (!forceOpen) setOpen(false);
            }}
          />
        ) : null}
      </AnimatePresence>

      <div
        className={cn(
          'pointer-events-none fixed z-50',
          'right-[max(0.85rem,env(safe-area-inset-right,0px))]',
          'bottom-[max(0.85rem,env(safe-area-inset-bottom,0px))]'
        )}
      >
        <div
          className="pointer-events-auto relative h-14 w-14"
          data-walkthrough="app-menu"
        >
          <AnimatePresence>
            {open
              ? items.map((item, i) => {
                  const Icon = item.icon;
                  const { x, y, rotate } = fanPose(i, fanCount, fanRadiusPx);
                  const active = Boolean(item.href) && activePath === item.href;
                  const isUpgradeTab = item.upgrade === true;
                  const btn = (
                    <span
                      className={cn(
                        fabBtnClass,
                        'relative',
                        active && 'ring-2 ring-vault-warm ring-offset-2 ring-offset-transparent',
                        item.lock && 'sv-fab-lock bg-[#c62828] text-white hover:brightness-110'
                      )}
                    >
                      <Icon
                        className={cn('h-5 w-5', isUpgradeTab && 'text-[#F5C518]')}
                        strokeWidth={isUpgradeTab ? 1.75 : 2}
                        fill={isUpgradeTab ? 'currentColor' : 'none'}
                        aria-hidden
                      />
                      {item.badge != null && item.badge > 0 ? (
                        <span className="absolute -right-0.5 -top-0.5 flex min-w-[1.125rem] items-center justify-center rounded-full bg-[#c62828] px-1 py-px text-[10px] font-bold leading-none text-white shadow-md">
                          {item.badge > 9 ? '9+' : item.badge}
                        </span>
                      ) : null}
                    </span>
                  );

                  return (
                    <motion.div
                      key={item.href ?? 'fab-lock-vault'}
                      initial={{ opacity: 0, x: 0, y: 0, scale: 0.45, rotate: 0 }}
                      animate={{ opacity: 1, x, y, scale: 1, rotate }}
                      exit={{ opacity: 0, x: 0, y: 0, scale: 0.45, rotate: 0 }}
                      transition={{
                        type: 'spring',
                        stiffness: 480,
                        damping: 30,
                        delay: i * 0.028,
                      }}
                      className="absolute left-1/2 top-1/2 z-[1] h-12 w-12"
                      style={{ marginLeft: -24, marginTop: -24 }}
                    >
                      {item.lock ? (
                        <button
                          type="button"
                          aria-label={t('lockVaultButton')}
                          title={item.label}
                          onClick={() => {
                            setOpen(false);
                            lockVaultAndReload();
                          }}
                        >
                          {btn}
                        </button>
                      ) : (
                        <Link
                          href={item.href!}
                          aria-label={item.label}
                          aria-current={active ? 'page' : undefined}
                          title={item.label}
                          onClick={() => setOpen(false)}
                        >
                          {btn}
                        </Link>
                      )}
                    </motion.div>
                  );
                })
              : null}
          </AnimatePresence>

          <motion.button
            type="button"
            id={menuId}
            aria-label={open ? tc('close') : t('navigation')}
            aria-expanded={open}
            aria-controls={open ? `${menuId}-items` : undefined}
            onClick={() => {
              if (forceOpen) return;
              setOpen((v) => !v);
            }}
            className="relative z-[2] flex h-14 w-14 items-center justify-center rounded-full bg-[#121212] text-white shadow-[0_8px_28px_rgba(0,0,0,0.28)] transition-transform active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
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

      <span id={`${menuId}-items`} className="sr-only" aria-live="polite">
        {open ? t('navigation') : ''}
      </span>
    </>
  );
}
