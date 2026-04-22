'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FolderLock, Users, Download, ChevronRight, Sparkles } from 'lucide-react';
import VaultBrandIcon from '@/components/ui/VaultBrandIcon';
import { useTheme, type AppTheme } from '@/context/ThemeContext';

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

const BASE_SLIDES: Omit<SlideDef, 'body'>[] = [
  { id: 'welcome', kicker: 'Welcome', title: 'SecureVault' },
  { id: 'vault', kicker: 'Your data', title: 'Private document vault' },
  { id: 'family', kicker: 'Organize', title: 'Built for families' },
  { id: 'backup', kicker: 'Stay safe', title: 'Back up regularly' },
];

function getSlides(phase: 'setup' | 'login'): SlideDef[] {
  const welcomeBody =
    phase === 'setup'
      ? 'Create a strong password to encrypt your vault. Nothing is uploaded — your secrets stay on this device.'
      : 'Sign in with your password to decrypt your vault. Everything remains local and offline.';

  return [
    { ...BASE_SLIDES[0], body: welcomeBody },
    {
      ...BASE_SLIDES[1],
      body: 'Store government IDs, bank details, passwords, and more — organized by category and encrypted at rest.',
    },
    {
      ...BASE_SLIDES[2],
      body: 'Link documents to family members so household records stay structured and easy to find.',
    },
    {
      ...BASE_SLIDES[3],
      body: 'Export encrypted JSON backups from Settings. If you reset or lose access, a backup is your safety net.',
    },
  ];
}

const slideTransitionSpring = { type: 'spring' as const, stiffness: 380, damping: 34, mass: 0.85 };
const slideTransitionFade = { duration: 0.2 };

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const fn = () => setReduced(mq.matches);
    mq.addEventListener('change', fn);
    return () => mq.removeEventListener('change', fn);
  }, []);
  return reduced;
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
          className="absolute -left-[20%] -top-[30%] h-[min(320px,70vw)] w-[min(320px,70vw)] rounded-full bg-vault-warm/15 blur-[70px]"
          style={{ opacity: 0.14 + hueShift }}
        />
        <div className="absolute -bottom-[20%] -right-[10%] h-[min(280px,60vw)] w-[min(280px,60vw)] rounded-full bg-vault-coral/12 blur-[60px]" />
      </div>
    );
  }
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[24px]">
      <motion.div
        className="absolute -left-[20%] -top-[30%] h-[min(420px,85vw)] w-[min(420px,85vw)] rounded-full bg-vault-warm/20 blur-[80px]"
        animate={{
          x: [0, 24, 0],
          y: [0, 18, 0],
          scale: [1, 1.08, 1],
          opacity: [0.12 + hueShift, 0.22, 0.12 + hueShift],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -bottom-[25%] -right-[15%] h-[min(360px,75vw)] w-[min(360px,75vw)] rounded-full bg-vault-coral/15 blur-[70px]"
        animate={{
          x: [0, -20, 0],
          y: [0, -14, 0],
          scale: [1.05, 1, 1.05],
          opacity: [0.1, 0.18, 0.1],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
      />
      <motion.div
        className="absolute left-1/2 top-1/2 h-[min(280px,60vw)] w-[min(280px,60vw)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-vault-ink/25 blur-[60px]"
        animate={{ scale: [1, 1.06, 1], opacity: [0.5, 0.65, 0.5] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
}

function SlideVisual({
  id,
  reducedMotion,
  theme,
}: {
  id: SlideId;
  reducedMotion: boolean;
  theme: AppTheme;
}) {
  switch (id) {
    case 'welcome':
      return (
        <div className="relative mx-auto flex h-[140px] w-full max-w-[220px] items-center justify-center">
          {[0, 1, 2].map((i) =>
            reducedMotion ? (
              <span
                key={i}
                className="absolute rounded-full border border-vault-warm/30"
                style={{ width: 56 + i * 36, height: 56 + i * 36, opacity: 0.18 + i * 0.1 }}
              />
            ) : (
              <motion.span
                key={i}
                className="absolute rounded-full border border-vault-warm/35"
                style={{ width: 56 + i * 36, height: 56 + i * 36 }}
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{
                  scale: [1, 1.04, 1],
                  opacity: [0.15 + i * 0.12, 0.35 + i * 0.08, 0.15 + i * 0.12],
                }}
                transition={{
                  duration: 2.8 + i * 0.4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: i * 0.2,
                }}
              />
            )
          )}
          <motion.div
            className="relative flex h-[72px] w-[72px] items-center justify-center rounded-2xl border border-[color:var(--color-border)] bg-vault-elevated shadow-vault"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
          >
            <VaultBrandIcon variant={theme} size={44} aria-label="" className="shrink-0" />
            {reducedMotion ? (
              <div className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-lg bg-vault-warm/20">
                <Sparkles className="h-3.5 w-3.5 text-vault-warm" aria-hidden />
              </div>
            ) : (
              <motion.div
                className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-lg bg-vault-warm/20"
                animate={{ rotate: [0, 8, -8, 0], scale: [1, 1.05, 1] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Sparkles className="h-3.5 w-3.5 text-vault-warm" aria-hidden />
              </motion.div>
            )}
          </motion.div>
        </div>
      );
    case 'vault':
      return (
        <div className="relative mx-auto flex h-[140px] w-full max-w-[240px] items-end justify-center gap-2 pb-2">
          {[0, 1, 2].map((i) =>
            reducedMotion ? (
              <div
                key={i}
                className="w-[26%] rounded-xl border border-border bg-vault-panel/80"
                style={{ height: 48 + i * 22 }}
              >
                <div className="mx-2 mt-2 h-1.5 rounded-full bg-vault-warm/40" />
                <div className="mx-2 mt-2 h-1 rounded-full bg-vault-faint/40" />
              </div>
            ) : (
              <motion.div
                key={i}
                className="w-[26%] rounded-xl border border-border bg-vault-panel/80"
                style={{ height: 48 + i * 22 }}
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
                <div className="mx-2 mt-2 h-1.5 rounded-full bg-vault-warm/40" />
                <div className="mx-2 mt-2 h-1 rounded-full bg-vault-faint/40" />
              </motion.div>
            )
          )}
          {reducedMotion ? (
            <div className="absolute bottom-0 left-1/2 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-2xl border border-vault-warm/30 bg-vault-elevated shadow-vault">
              <FolderLock className="h-7 w-7 text-vault-warm" strokeWidth={1.5} aria-hidden />
            </div>
          ) : (
            <motion.div
              className="absolute bottom-0 left-1/2 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-2xl border border-vault-warm/30 bg-vault-elevated shadow-vault"
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <FolderLock className="h-7 w-7 text-vault-warm" strokeWidth={1.5} aria-hidden />
            </motion.div>
          )}
        </div>
      );
    case 'family':
      return (
        <div className="relative mx-auto flex h-[140px] w-full max-w-[260px] items-center justify-center">
          {reducedMotion ? (
            <div className="absolute h-[100px] w-[100px] rounded-full border border-dashed border-vault-faint/25" />
          ) : (
            <motion.div
              className="absolute h-[100px] w-[100px] rounded-full border border-dashed border-vault-faint/25"
              animate={{ rotate: 360 }}
              transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
            />
          )}
          {[0, 1, 2].map((i) => {
            const angle = (i * 120 * Math.PI) / 180;
            const r = 38;
            const cx = Math.cos(angle) * r;
            const cy = Math.sin(angle) * r;
            return reducedMotion ? (
              <div
                key={i}
                className="absolute flex h-11 w-11 items-center justify-center rounded-full border border-border bg-vault-elevated text-[10px] font-800 text-vault-warm"
                style={{
                  left: '50%',
                  top: '50%',
                  marginLeft: -22 + cx,
                  marginTop: -22 + cy,
                }}
              >
                {String.fromCharCode(65 + i)}
              </div>
            ) : (
              <motion.div
                key={i}
                className="absolute flex h-11 w-11 items-center justify-center rounded-full border border-border bg-vault-elevated text-[10px] font-800 text-vault-warm"
                style={{ left: '50%', top: '50%', marginLeft: -22, marginTop: -22 }}
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
          <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-xl border border-vault-coral/35 bg-vault-panel">
            <Users className="h-6 w-6 text-vault-coral" strokeWidth={1.5} aria-hidden />
          </div>
        </div>
      );
    case 'backup':
      return (
        <div className="relative mx-auto flex h-[140px] w-full max-w-[200px] flex-col items-center justify-center gap-3">
          {reducedMotion ? (
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-vault-elevated shadow-[0_0_20px_rgba(240,195,142,0.12)]">
              <Download className="h-8 w-8 text-vault-warm" strokeWidth={1.5} aria-hidden />
            </div>
          ) : (
            <motion.div
              className="flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-vault-elevated"
              animate={{
                boxShadow: [
                  '0 0 0 0 rgba(240,195,142,0)',
                  '0 0 28px 2px rgba(240,195,142,0.15)',
                  '0 0 0 0 rgba(240,195,142,0)',
                ],
              }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Download className="h-8 w-8 text-vault-warm" strokeWidth={1.5} aria-hidden />
            </motion.div>
          )}
          <div className="flex flex-col items-center gap-1">
            {[0, 1, 2].map((i) =>
              reducedMotion ? (
                <div
                  key={i}
                  className="h-1 rounded-full bg-vault-warm/45"
                  style={{ width: 48 - i * 10 }}
                />
              ) : (
                <motion.div
                  key={i}
                  className="h-1 rounded-full bg-vault-warm/50"
                  style={{ width: 48 - i * 10 }}
                  animate={{ opacity: [0.25, 0.85, 0.25], x: [0, 2, 0] }}
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
  const { theme } = useTheme();
  const reducedMotion = usePrefersReducedMotion();
  const slides = getSlides(phase);
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
    <div className="relative flex min-h-[min(520px,calc(100vh-3rem))] w-full max-w-[420px] flex-col">
      <motion.div
        className="relative flex flex-1 flex-col overflow-hidden rounded-[24px] border border-[color:var(--color-border)] bg-vault-panel/95 shadow-vault"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <AmbientOrbs slideIndex={index} reducedMotion={reducedMotion} />

        <div className="relative z-10 flex items-start justify-between gap-3 px-6 pt-5">
          <p className="text-[10px] font-700 uppercase tracking-[0.28em] text-vault-faint">
            {index + 1} / {slides.length}
          </p>
          <button
            type="button"
            onClick={handleSkip}
            className="rounded-[10px] px-3 py-1.5 text-xs font-600 text-vault-muted transition-colors hover:bg-white/5 hover:text-vault-warm"
          >
            Skip intro
          </button>
        </div>

        <div className="relative z-10 flex flex-1 flex-col px-6 pb-6 pt-2">
          <div className="min-h-[200px] flex-1">
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
                className="flex h-full flex-col"
              >
                <SlideVisual id={slide.id} reducedMotion={reducedMotion} theme={theme} />
                <p className="mt-6 text-center text-[10px] font-700 uppercase tracking-[0.22em] text-vault-warm/90">
                  {slide.kicker}
                </p>
                <h2 className="mt-2 text-center text-[22px] font-800 leading-tight tracking-tight text-vault-text sm:text-2xl">
                  {slide.title}
                </h2>
                <p className="mx-auto mt-3 max-w-[300px] text-center text-sm leading-relaxed text-vault-muted">
                  {slide.body}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-6 flex items-center justify-between gap-4">
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
                    className="block h-1.5 rounded-full bg-vault-faint/40"
                    animate={{
                      width: i === index ? 22 : 6,
                      backgroundColor:
                        i === index ? 'rgba(240, 195, 142, 0.95)' : 'rgba(122, 114, 153, 0.35)',
                    }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                </button>
              ))}
            </div>

            <motion.button
              type="button"
              onClick={goNext}
              className="inline-flex items-center gap-2 rounded-[12px] bg-vault-warm px-5 py-3 text-sm font-700 text-vault-ink shadow-vault transition-transform hover:brightness-105 active:scale-[0.98]"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isLast ? (phase === 'setup' ? 'Create password' : 'Sign in') : 'Next'}
              <ChevronRight className="h-4 w-4" strokeWidth={2.5} aria-hidden />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
