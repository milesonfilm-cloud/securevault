'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import {
  FolderLock,
  Users,
  Download,
  ChevronRight,
  Smartphone,
  Shield,
  Sparkles,
  Layers,
  Lock,
  CalendarClock,
  Home,
  Heart,
  HardDrive,
  RefreshCw,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useMessages } from 'next-intl';
import { useTranslations } from 'next-intl';
import { BRAND_LOGO_HEIGHT, BRAND_LOGO_SRC, BRAND_LOGO_WIDTH } from '@/lib/brandLogo';
import { paletteForMemberIndex } from '@/lib/memberPastelPalettes';
import { subscribeMatchMedia } from '@/lib/matchMediaSubscribe';

interface AuthWelcomePanelProps {
  phase: 'setup' | 'login';
  onFinish: () => void;
}

type SlideId = 'welcome' | 'vault' | 'family' | 'backup';

interface SlideDef {
  id: SlideId;
  kicker: string;
  title: string;
  body: string;
}

type WelcomeCard = { t: string; b: string };

const slideTransitionSpring = { type: 'spring' as const, stiffness: 380, damping: 34, mass: 0.85 };
const slideTransitionFade = { duration: 0.2 };

/** In-card ambience — lavender, mint, mist (family pastel, not neon). */
const PASTEL_ORB_LAVENDER = 'rgba(123, 111, 212, 0.14)';
const PASTEL_ORB_MINT = 'rgba(167, 243, 208, 0.2)';
const PASTEL_ORB_MIST = 'rgba(216, 223, 233, 0.45)';

const WELCOME_ACCENT_SOFT = 'rgba(91, 33, 182, 0.88)';
const WELCOME_MUTED = 'rgba(33, 33, 33, 0.5)';
const WELCOME_FAINT = 'rgba(33, 33, 33, 0.35)';

const FEATURE_ICONS: Record<SlideId, LucideIcon[]> = {
  welcome: [Smartphone, Shield, Sparkles],
  vault: [Layers, Lock, CalendarClock],
  family: [Users, Home, Heart],
  backup: [Download, HardDrive, RefreshCw],
};

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    return subscribeMatchMedia('(prefers-reduced-motion: reduce)', setReduced);
  }, []);
  return reduced;
}

function DriftingSpecks({ reducedMotion }: { reducedMotion: boolean }) {
  if (reducedMotion) return null;
  const specks = [
    { left: '8%', top: '18%', size: 6, duration: 9, delay: 0 },
    { left: '88%', top: '12%', size: 5, duration: 11, delay: 0.4 },
    { left: '78%', top: '72%', size: 7, duration: 10, delay: 0.2 },
    { left: '14%', top: '68%', size: 5, duration: 12, delay: 0.6 },
  ];
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[24px]" aria-hidden>
      {specks.map((s, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full bg-violet-400/35"
          style={{ left: s.left, top: s.top, width: s.size, height: s.size }}
          animate={{
            y: [0, -10, 4, 0],
            x: [0, 6, -4, 0],
            opacity: [0.2, 0.45, 0.28, 0.2],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: s.duration,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: s.delay,
          }}
        />
      ))}
    </div>
  );
}

function AmbientOrbs({
  slideIndex,
  reducedMotion,
}: {
  slideIndex: number;
  reducedMotion: boolean;
}) {
  const hueShift = slideIndex * 0.15;
  if (reducedMotion) {
    return (
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[24px]">
        <div
          className="absolute -left-[20%] -top-[30%] h-[min(320px,70vw)] w-[min(320px,70vw)] rounded-full blur-[70px]"
          style={{ backgroundColor: PASTEL_ORB_LAVENDER, opacity: 0.35 + hueShift }}
        />
        <div
          className="absolute -bottom-[20%] -right-[10%] h-[min(280px,60vw)] w-[min(280px,60vw)] rounded-full blur-[60px]"
          style={{ backgroundColor: PASTEL_ORB_MINT }}
        />
      </div>
    );
  }
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[24px]">
      <motion.div
        className="absolute -left-[20%] -top-[30%] h-[min(420px,85vw)] w-[min(420px,85vw)] rounded-full blur-[80px]"
        style={{ backgroundColor: PASTEL_ORB_LAVENDER }}
        animate={{
          x: [0, 24, 0],
          y: [0, 18, 0],
          scale: [1, 1.08, 1],
          opacity: [0.35 + hueShift, 0.52, 0.35 + hueShift],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -bottom-[25%] -right-[15%] h-[min(360px,75vw)] w-[min(360px,75vw)] rounded-full blur-[70px]"
        style={{ backgroundColor: PASTEL_ORB_MINT }}
        animate={{
          x: [0, -20, 0],
          y: [0, -14, 0],
          scale: [1.05, 1, 1.05],
          opacity: [0.32, 0.48, 0.32],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
      />
      <motion.div
        className="absolute left-1/2 top-1/2 h-[min(240px,55vw)] w-[min(240px,55vw)] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[60px]"
        style={{ backgroundColor: PASTEL_ORB_MIST }}
        animate={{ scale: [1, 1.06, 1], opacity: [0.28, 0.4, 0.28] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
}

function WelcomeFeatureCards({
  slideId,
  reducedMotion,
}: {
  slideId: SlideId;
  reducedMotion: boolean;
}) {
  const messages = useMessages() as {
    welcome?: { cards?: Record<string, WelcomeCard[] | undefined> };
  };
  const items = (messages.welcome?.cards?.[slideId] ?? []) as WelcomeCard[];
  const icons = FEATURE_ICONS[slideId];
  if (!items.length) return null;

  const containerVars = {
    hidden: {},
    show: {
      transition: { staggerChildren: reducedMotion ? 0 : 0.085, delayChildren: reducedMotion ? 0 : 0.08 },
    },
  };
  const itemVars = reducedMotion
    ? {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { duration: 0.2 } },
      }
    : {
        hidden: { opacity: 0, y: 16, scale: 0.97 },
        show: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: { type: 'spring' as const, stiffness: 420, damping: 28 },
        },
      };

  return (
    <motion.ul
      role="list"
      className="mx-auto mt-5 w-full max-w-[360px] space-y-2.5"
      variants={containerVars}
      initial="hidden"
      animate="show"
      key={slideId}
    >
      {items.map((item, i) => {
        const Icon = icons[i] ?? Sparkles;
        return (
          <motion.li
            key={`${slideId}-${i}`}
            variants={itemVars}
            className="flex gap-3 rounded-2xl border border-neutral-200/85 bg-white/80 px-3.5 py-3 shadow-[0_10px_28px_rgba(67,56,201,0.06)] backdrop-blur-[2px]"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-100 to-emerald-50">
              {!reducedMotion ? (
                <motion.div
                  animate={{ scale: [1, 1.06, 1], rotate: [0, 2, -2, 0] }}
                  transition={{ duration: 4 + i * 0.35, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Icon className="h-[18px] w-[18px] text-[#4338C9]" strokeWidth={1.75} aria-hidden />
                </motion.div>
              ) : (
                <Icon className="h-[18px] w-[18px] text-[#4338C9]" strokeWidth={1.75} aria-hidden />
              )}
            </div>
            <div className="min-w-0 flex-1 text-left">
              <p className="text-[13px] font-700 leading-snug text-neutral-900">{item.t}</p>
              <p className="mt-0.5 text-[11px] leading-relaxed text-neutral-500">{item.b}</p>
            </div>
          </motion.li>
        );
      })}
    </motion.ul>
  );
}

function SlideVisual({ id, reducedMotion }: { id: SlideId; reducedMotion: boolean }) {
  switch (id) {
    case 'welcome':
      return (
        <div className="relative mx-auto flex min-h-[200px] w-full max-w-[280px] items-center justify-center py-2">
          {!reducedMotion && (
            <motion.div
              className="pointer-events-none absolute left-1/2 top-1/2 h-[200px] w-[200px] -translate-x-1/2 -translate-y-1/2"
              animate={{ rotate: 360 }}
              transition={{ duration: 36, repeat: Infinity, ease: 'linear' }}
              aria-hidden
            >
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-300/55"
                  style={{
                    transform: `rotate(${i * 120}deg) translateY(-86px)`,
                  }}
                  animate={{ opacity: [0.35, 0.85, 0.35], scale: [1, 1.2, 1] }}
                  transition={{ duration: 2.4 + i * 0.2, repeat: Infinity, ease: 'easeInOut' }}
                />
              ))}
            </motion.div>
          )}
          {[0, 1, 2].map((i) => {
            const ringC = i % 2 === 0 ? '#a78bfa' : '#86efac';
            return reducedMotion ? (
              <span
                key={i}
                className="absolute rounded-full border"
                style={{
                  borderColor: `${ringC}40`,
                  width: 64 + i * 40,
                  height: 64 + i * 40,
                  opacity: 0.16 + i * 0.08,
                }}
              />
            ) : (
              <motion.span
                key={i}
                className="absolute rounded-full border"
                style={{
                  borderColor: `${ringC}55`,
                  width: 64 + i * 40,
                  height: 64 + i * 40,
                }}
                initial={{ scale: 0.88, opacity: 0 }}
                animate={{
                  scale: [1, 1.03, 1],
                  opacity: [0.14 + i * 0.1, 0.32 + i * 0.06, 0.14 + i * 0.1],
                }}
                transition={{
                  duration: 2.8 + i * 0.45,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: i * 0.18,
                }}
              />
            );
          })}
          <motion.div
            className="relative z-10 overflow-hidden rounded-2xl border border-neutral-200/90 bg-white px-5 py-4 shadow-[0_16px_40px_rgba(33,33,33,0.06)]"
            initial={reducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
          >
            {!reducedMotion && (
              <motion.div
                className="pointer-events-none absolute inset-0 z-20 overflow-hidden rounded-2xl"
                aria-hidden
              >
                <motion.div
                  className="absolute inset-y-[-20%] w-[55%] bg-gradient-to-r from-transparent via-white/70 to-transparent"
                  style={{ skewX: -18, left: '-60%' }}
                  animate={{ left: ['-60%', '120%'] }}
                  transition={{
                    duration: 2.4,
                    repeat: Infinity,
                    repeatDelay: 4,
                    ease: 'easeInOut',
                  }}
                />
              </motion.div>
            )}
            <Image
              src={BRAND_LOGO_SRC}
              alt=""
              width={BRAND_LOGO_WIDTH}
              height={BRAND_LOGO_HEIGHT}
              className="relative z-10 mx-auto h-[min(180px,48vw)] w-auto object-contain"
              priority
            />
          </motion.div>
          {!reducedMotion && (
            <motion.div
              className="pointer-events-none absolute bottom-2 left-1/2 z-10 h-0.5 w-10 -translate-x-1/2 rounded-full"
              style={{
                background: 'linear-gradient(90deg, #7B6FD4, #34D399)',
                opacity: 0.75,
              }}
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 0.85 }}
              transition={{ delay: 0.35, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            />
          )}
        </div>
      );
    case 'vault':
      return (
        <div className="relative mx-auto flex h-[150px] w-full max-w-[260px] items-end justify-center gap-2 pb-2">
          {[0, 1, 2].map((i) => {
            const pal = paletteForMemberIndex(i);
            return reducedMotion ? (
              <div
                key={i}
                className="w-[26%] rounded-xl border border-neutral-200/80"
                style={{
                  height: 48 + i * 22,
                  backgroundColor: pal.ghost2,
                }}
              >
                <div
                  className="mx-2 mt-2 h-1.5 rounded-full opacity-50"
                  style={{ backgroundColor: pal.avatarInk }}
                />
                <div className="mx-2 mt-2 h-1 rounded-full bg-neutral-300/50" />
              </div>
            ) : (
              <motion.div
                key={i}
                className="w-[26%] rounded-xl border border-neutral-200/80"
                style={{ height: 48 + i * 22, backgroundColor: pal.ghost2 }}
                initial={{ y: 24, opacity: 0 }}
                animate={{ y: [0, -6 - i * 2, 0], opacity: 1 }}
                transition={{
                  y: {
                    duration: 2.4 + i * 0.3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: i * 0.15,
                  },
                  opacity: { duration: 0.4 },
                }}
              >
                <div
                  className="mx-2 mt-2 h-1.5 rounded-full opacity-50"
                  style={{ backgroundColor: pal.avatarInk }}
                />
                <div className="mx-2 mt-2 h-1 rounded-full bg-neutral-300/50" />
              </motion.div>
            );
          })}
          {reducedMotion ? (
            <div className="absolute bottom-0 left-1/2 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-2xl border border-violet-200/90 bg-white shadow-[0_12px_28px_rgba(67,56,201,0.15)]">
              <FolderLock className="h-7 w-7 text-[#4338C9]" strokeWidth={1.5} aria-hidden />
            </div>
          ) : (
            <motion.div
              className="absolute bottom-0 left-1/2 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-2xl border border-violet-200/90 bg-white shadow-[0_12px_28px_rgba(67,56,201,0.15)]"
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <FolderLock className="h-7 w-7 text-[#4338C9]" strokeWidth={1.5} aria-hidden />
            </motion.div>
          )}
          {!reducedMotion && (
            <>
              <motion.span
                className="pointer-events-none absolute bottom-2 left-1/2 h-16 w-16 -translate-x-1/2 rounded-full border border-violet-300/25"
                animate={{ scale: [1, 1.15, 1], opacity: [0.35, 0.08, 0.35] }}
                transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
                aria-hidden
              />
              <motion.span
                className="pointer-events-none absolute bottom-2 left-1/2 h-[5.25rem] w-[5.25rem] -translate-x-1/2 rounded-full border border-emerald-300/20"
                animate={{ scale: [1, 1.22, 1], opacity: [0.2, 0.05, 0.2] }}
                transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
                aria-hidden
              />
            </>
          )}
        </div>
      );
    case 'family':
      return (
        <div className="relative mx-auto flex h-[150px] w-full max-w-[280px] items-center justify-center">
          {reducedMotion ? (
            <div className="absolute h-[100px] w-[100px] rounded-full border border-dashed border-violet-200/60" />
          ) : (
            <motion.div
              className="absolute h-[100px] w-[100px] rounded-full border border-dashed border-violet-200/60"
              animate={{ rotate: 360 }}
              transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
            />
          )}
          {!reducedMotion && (
            <motion.div
              className="pointer-events-none absolute left-1/2 top-1/2 h-[118px] w-[118px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-400/10 blur-xl"
              animate={{ scale: [1, 1.08, 1], opacity: [0.5, 0.75, 0.5] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              aria-hidden
            />
          )}
          {[0, 1, 2].map((i) => {
            const angle = (i * 120 * Math.PI) / 180;
            const r = 38;
            const cx = Math.cos(angle) * r;
            const cy = Math.sin(angle) * r;
            const pal = paletteForMemberIndex(i);
            return reducedMotion ? (
              <div
                key={i}
                className="absolute flex h-11 w-11 items-center justify-center rounded-full border border-neutral-200/80 text-[10px] font-800"
                style={{
                  left: '50%',
                  top: '50%',
                  marginLeft: -22 + cx,
                  marginTop: -22 + cy,
                  backgroundColor: pal.avatarBg,
                  color: pal.avatarInk,
                }}
              >
                {String.fromCharCode(65 + i)}
              </div>
            ) : (
              <motion.div
                key={i}
                className="absolute flex h-11 w-11 items-center justify-center rounded-full border border-neutral-200/80 text-[10px] font-800"
                style={{
                  left: '50%',
                  top: '50%',
                  marginLeft: -22,
                  marginTop: -22,
                  backgroundColor: pal.avatarBg,
                  color: pal.avatarInk,
                }}
                animate={{
                  x: [Math.cos(angle) * r, Math.cos(angle + 0.4) * r, Math.cos(angle) * r],
                  y: [Math.sin(angle) * r, Math.sin(angle + 0.4) * r, Math.sin(angle) * r],
                }}
                transition={{ duration: 5 + i * 0.4, repeat: Infinity, ease: 'easeInOut' }}
              >
                {String.fromCharCode(65 + i)}
              </motion.div>
            );
          })}
          <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-xl border border-violet-200/90 bg-white shadow-[0_8px_22px_rgba(67,56,201,0.12)]">
            <Users className="h-6 w-6 text-[#4338C9]" strokeWidth={1.5} aria-hidden />
          </div>
        </div>
      );
    case 'backup':
      return (
        <div className="relative mx-auto flex h-[150px] w-full max-w-[220px] flex-col items-center justify-center gap-3">
          {reducedMotion ? (
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-sky-200/90 bg-white shadow-[0_12px_28px_rgba(8,145,178,0.12)]">
              <Download className="h-8 w-8 text-[#0891b2]" strokeWidth={1.5} aria-hidden />
            </div>
          ) : (
            <motion.div
              className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-sky-200/90 bg-white"
              animate={{
                boxShadow: [
                  '0 0 0 0 rgba(8,145,178,0)',
                  '0 0 32px 2px rgba(8,145,178,0.18)',
                  '0 0 0 0 rgba(8,145,178,0)',
                ],
                y: [0, -3, 0],
              }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <motion.div
                className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-cyan-200/0 via-cyan-200/25 to-sky-200/0"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
                aria-hidden
              />
              <Download className="relative z-10 h-8 w-8 text-[#0891b2]" strokeWidth={1.5} aria-hidden />
            </motion.div>
          )}
          <div className="flex flex-col items-center gap-1">
            {[0, 1, 2].map((i) =>
              reducedMotion ? (
                <div
                  key={i}
                  className="h-1 rounded-full bg-[#4338C9]/35"
                  style={{ width: 48 - i * 10 }}
                />
              ) : (
                <motion.div
                  key={i}
                  className="h-1 rounded-full bg-[#4338C9]/40"
                  style={{ width: 48 - i * 10 }}
                  animate={{ opacity: [0.25, 0.8, 0.25], x: [0, 2, 0] }}
                  transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.2 }}
                />
              )
            )}
          </div>
        </div>
      );
    default:
      return null;
  }
}

export default function AuthWelcomePanel({ phase, onFinish }: AuthWelcomePanelProps) {
  const tw = useTranslations('welcome');
  const reducedMotion = usePrefersReducedMotion();
  const slides = useMemo((): SlideDef[] => {
    const welcomeBody = phase === 'setup' ? tw('bodySetup') : tw('bodyLogin');
    return [
      {
        id: 'welcome',
        kicker: tw('kickerWelcome'),
        title: tw('titleSecureVault'),
        body: welcomeBody,
      },
      {
        id: 'vault',
        kicker: tw('kickerYourData'),
        title: tw('titlePrivateVault'),
        body: tw('bodyVault'),
      },
      {
        id: 'family',
        kicker: tw('kickerOrganize'),
        title: tw('titleBuiltFamilies'),
        body: tw('bodyFamily'),
      },
      {
        id: 'backup',
        kicker: tw('kickerStaySafe'),
        title: tw('titleBackup'),
        body: tw('bodyBackup'),
      },
    ];
  }, [phase, tw]);
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const slide = slides[index];
  const isLast = index === slides.length - 1;

  const goNext = () => {
    if (isLast) onFinish();
    else {
      setDir(1);
      setIndex((i) => i + 1);
    }
  };

  const handleSkip = () => onFinish();

  return (
    <div className="relative flex min-h-[min(680px,calc(100vh-2rem))] w-full max-w-[440px] flex-col">
      <motion.div
        className="relative flex flex-1 flex-col overflow-hidden rounded-[24px] border border-neutral-200/90 bg-white/95 shadow-[0_24px_60px_rgba(33,33,33,0.08)] backdrop-blur-sm"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <AmbientOrbs slideIndex={index} reducedMotion={reducedMotion} />
        <DriftingSpecks reducedMotion={reducedMotion} />

        <div className="relative z-10 flex items-start justify-between gap-3 px-6 pt-5">
          <p
            className="text-[10px] font-700 uppercase tracking-[0.28em]"
            style={{ color: WELCOME_FAINT }}
          >
            {index + 1} / {slides.length}
          </p>
          <button
            type="button"
            onClick={handleSkip}
            className="rounded-[10px] px-3 py-1.5 text-xs font-600 text-neutral-500 transition-colors hover:bg-violet-50 hover:text-violet-800"
          >
            {tw('skip')}
          </button>
        </div>

        <div className="relative z-10 flex flex-1 flex-col px-6 pb-6 pt-2">
          <div className="min-h-[120px] flex-1 overflow-y-auto overflow-x-hidden [-webkit-overflow-scrolling:touch]">
            <AnimatePresence mode="wait" custom={dir}>
              <motion.div
                key={slide.id}
                custom={dir}
                initial={
                  reducedMotion ? { opacity: 0 } : { opacity: 0, x: dir * 28, filter: 'blur(6px)' }
                }
                animate={reducedMotion ? { opacity: 1 } : { opacity: 1, x: 0, filter: 'blur(0px)' }}
                exit={
                  reducedMotion ? { opacity: 0 } : { opacity: 0, x: dir * -22, filter: 'blur(4px)' }
                }
                transition={reducedMotion ? slideTransitionFade : slideTransitionSpring}
                className="flex min-h-full flex-col pb-1"
              >
                <SlideVisual id={slide.id} reducedMotion={reducedMotion} />
                <p
                  className="mt-5 text-center text-[10px] font-700 uppercase tracking-[0.22em]"
                  style={{ color: WELCOME_ACCENT_SOFT }}
                >
                  {slide.kicker}
                </p>
                <h2 className="mt-2 text-center text-[22px] font-800 leading-tight tracking-tight text-neutral-900 sm:text-2xl">
                  {slide.title}
                </h2>
                <p
                  className="mx-auto mt-3 max-w-[340px] text-center text-sm leading-relaxed"
                  style={{ color: WELCOME_MUTED }}
                >
                  {slide.body}
                </p>
                <WelcomeFeatureCards slideId={slide.id} reducedMotion={reducedMotion} />
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-4 flex shrink-0 items-center justify-between gap-4 border-t border-neutral-100/90 pt-4">
            <div className="flex gap-1.5">
              {slides.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    setDir(i > index ? 1 : -1);
                    setIndex(i);
                  }}
                  className="group p-1"
                  aria-label={`Go to slide ${i + 1}`}
                >
                  <motion.span
                    className="block h-1.5 rounded-full bg-neutral-200/90"
                    animate={{
                      width: i === index ? 22 : 6,
                      backgroundColor:
                        i === index ? WELCOME_ACCENT_SOFT : 'rgba(33, 33, 33, 0.12)',
                    }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                </button>
              ))}
            </div>

            <motion.button
              type="button"
              onClick={goNext}
              className="inline-flex items-center gap-2 rounded-[12px] bg-gradient-to-br from-[#7B6FD4] to-[#4338C9] px-5 py-3 text-sm font-700 text-white shadow-[0_14px_32px_rgba(67,56,201,0.28)] transition-transform hover:brightness-[1.03] active:scale-[0.98]"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isLast ? (phase === 'setup' ? tw('createPassword') : tw('signIn')) : tw('next')}
              <ChevronRight className="h-4 w-4" strokeWidth={2.5} aria-hidden />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
