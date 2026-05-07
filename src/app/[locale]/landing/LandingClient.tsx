'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, Sparkles } from 'lucide-react';
import AuthWelcomePanel from '@/components/AuthWelcomePanel';
import { BRAND_LOGO_HEIGHT, BRAND_LOGO_SRC, BRAND_LOGO_WIDTH } from '@/lib/brandLogo';
import { getStoredVerifier } from '@/lib/vaultSession';
import { completeAuthIntroSession } from '@/lib/authIntroSession';

const TITLE_SECURE = 'SECURE';
const TITLE_VAULT = 'VAULT';
const TAG = 'SECURE DIGITAL MANAGER';

type Step = 'hero' | 'onboarding';

const FRAGMENTS = [
  {
    clip: 'polygon(50% 0%, 100% 100%, 0% 100%)',
    fromX: -180,
    fromY: -120,
    toX: -98,
    toY: -72,
    rotate: 12,
    delay: 0.15,
  },
  {
    clip: 'polygon(0 0, 100% 38%, 0 100%)',
    fromX: 200,
    fromY: -100,
    toX: 102,
    toY: -58,
    rotate: -18,
    delay: 0.22,
  },
  {
    clip: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
    fromX: -160,
    fromY: 160,
    toX: -88,
    toY: 78,
    rotate: 25,
    delay: 0.28,
  },
  {
    clip: 'polygon(25% 0%, 100% 0%, 75% 100%, 0% 100%)',
    fromX: 190,
    fromY: 140,
    toX: 92,
    toY: 70,
    rotate: -14,
    delay: 0.34,
  },
  {
    clip: 'polygon(0 0, 100% 0, 100% 100%, 0 85%)',
    fromX: 0,
    fromY: -200,
    toX: 0,
    toY: -92,
    rotate: 8,
    delay: 0.4,
  },
  {
    clip: 'polygon(50% 0%, 100% 75%, 25% 100%, 0 25%)',
    fromX: 40,
    fromY: 200,
    toX: 22,
    toY: 86,
    rotate: -22,
    delay: 0.46,
  },
] as const;

function LandingHero({ onContinue }: { onContinue: () => void }) {
  const [showCta, setShowCta] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setShowCta(true), 2200);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <div className="auth-welcome-banner relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden px-4 py-12">
      <button
        type="button"
        onClick={onContinue}
        className="absolute right-4 top-4 z-20 rounded-[10px] px-3 py-1.5 text-xs font-600 text-neutral-500 transition-colors hover:bg-black/[0.04] hover:text-violet-800"
      >
        Skip to tour
      </button>
      <div className="pointer-events-none absolute inset-0">
        <motion.div
          className="absolute -left-[30%] top-[10%] h-[min(520px,90vw)] w-[min(520px,90vw)] rounded-full blur-[100px]"
          style={{ backgroundColor: 'rgba(123, 111, 212, 0.16)' }}
          animate={{ x: [0, 30, 0], y: [0, 20, 0], opacity: [0.4, 0.55, 0.4] }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -right-[25%] bottom-[5%] h-[min(440px,80vw)] w-[min(440px,80vw)] rounded-full blur-[90px]"
          style={{ backgroundColor: 'rgba(167, 243, 208, 0.22)' }}
          animate={{ x: [0, -24, 0], scale: [1, 1.06, 1], opacity: [0.35, 0.5, 0.35] }}
          transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
        />
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.45) 1px, transparent 0)`,
            backgroundSize: '28px 28px',
          }}
        />
      </div>

      <div className="relative z-10 flex w-full max-w-lg flex-col items-center text-center">
        <div className="relative mb-2 flex min-h-[min(360px,78vw)] w-full max-w-[min(360px,92vw)] items-center justify-center">
          <motion.div
            className="pointer-events-none absolute left-1/2 top-1/2 h-[min(220px,52vw)] w-[min(220px,52vw)] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              background:
                'radial-gradient(circle, rgba(123,111,212,0.32) 0%, rgba(167,243,208,0.14) 42%, transparent 72%)',
            }}
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: [1, 1.12, 1], opacity: [0.75, 1, 0.75] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
          />

          {FRAGMENTS.map((f, i) => (
            <motion.div
              key={i}
              className="absolute left-1/2 top-1/2 h-11 w-11 border shadow-[0_0_24px_rgba(0,0,0,0.2)]"
              style={{
                clipPath: f.clip,
                marginLeft: -22,
                marginTop: -22,
                borderColor: i % 2 === 0 ? 'rgba(123, 111, 212, 0.35)' : 'rgba(52, 211, 153, 0.4)',
                backgroundColor: i % 2 === 0 ? 'rgba(123, 111, 212, 0.08)' : 'rgba(167, 243, 208, 0.2)',
              }}
              initial={{ x: f.fromX, y: f.fromY, opacity: 0, rotate: 0, scale: 0.3 }}
              animate={{ x: f.toX, y: f.toY, opacity: 0.92, rotate: f.rotate, scale: 1 }}
              transition={{
                type: 'spring',
                stiffness: 120,
                damping: 16,
                delay: f.delay,
                mass: 0.8,
              }}
            />
          ))}

          <motion.div
            className="relative z-10"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 220, damping: 18, delay: 0.05 }}
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="drop-shadow-[0_20px_40px_rgba(33,33,33,0.14)]"
            >
              <Image
                src={BRAND_LOGO_SRC}
                alt=""
                width={BRAND_LOGO_WIDTH}
                height={BRAND_LOGO_HEIGHT}
                className="h-[min(300px,64vw)] w-auto max-h-[360px] object-contain"
                priority
              />
            </motion.div>
          </motion.div>

          <motion.div
            className="absolute -right-1 top-[18%] z-20 flex h-9 w-9 items-center justify-center rounded-xl border border-violet-200/90 bg-white shadow-md"
            initial={{ scale: 0, rotate: -40 }}
            animate={{ scale: 1, rotate: [0, 6, -6, 0] }}
            transition={{
              scale: { delay: 0.85, type: 'spring', stiffness: 400, damping: 18 },
              rotate: { duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 },
            }}
          >
            <Sparkles className="h-4 w-4 text-[#4338C9]" aria-hidden />
          </motion.div>
        </div>

        <div className="mt-2" style={{ perspective: 800 }}>
          <h1 className="flex flex-wrap items-baseline justify-center gap-x-4 gap-y-1 text-[clamp(1.65rem,6.5vw,2.35rem)] font-semibold tracking-[0.12em]">
            <span className="flex">
              {TITLE_SECURE.split('').map((ch, i) => (
                <motion.span
                  key={`${ch}-s-${i}`}
                  className="inline-block text-neutral-800"
                  initial={{ opacity: 0, y: 36, rotateX: -78 }}
                  animate={{ opacity: 1, y: 0, rotateX: 0 }}
                  transition={{
                    delay: 0.35 + i * 0.045,
                    type: 'spring',
                    stiffness: 280,
                    damping: 22,
                  }}
                >
                  {ch}
                </motion.span>
              ))}
            </span>
            <span className="flex text-[#4338C9]">
              {TITLE_VAULT.split('').map((ch, i) => (
                <motion.span
                  key={`${ch}-v-${i}`}
                  className="inline-block"
                  initial={{ opacity: 0, y: 36, rotateX: -78 }}
                  animate={{ opacity: 1, y: 0, rotateX: 0 }}
                  transition={{
                    delay: 0.35 + (TITLE_SECURE.length + 1 + i) * 0.045,
                    type: 'spring',
                    stiffness: 280,
                    damping: 22,
                  }}
                >
                  {ch}
                </motion.span>
              ))}
            </span>
          </h1>
        </div>

        <motion.p
          className="mt-4 max-w-md text-[11px] font-700 uppercase tracking-[0.42em] text-neutral-500"
          initial={{ opacity: 0, letterSpacing: '0.65em' }}
          animate={{ opacity: 1, letterSpacing: '0.42em' }}
          transition={{ delay: 0.95, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          {TAG}
        </motion.p>

        <motion.p
          className="mt-5 max-w-sm text-sm leading-relaxed text-neutral-600"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.15, duration: 0.5 }}
        >
          Encrypted, offline-first document management for you and your family — one vault, zero
          cloud.
        </motion.p>

        <AnimatePresence>
          {showCta && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45 }}
              className="mt-10 flex w-full max-w-xs flex-col items-center gap-3"
            >
              <motion.button
                type="button"
                onClick={onContinue}
                className="inline-flex w-full items-center justify-center gap-2 rounded-[14px] bg-gradient-to-br from-[#7B6FD4] to-[#4338C9] px-6 py-3.5 text-sm font-800 text-white shadow-[0_14px_32px_rgba(67,56,201,0.28)]"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                Continue
                <ChevronRight className="h-4 w-4" strokeWidth={2.5} aria-hidden />
              </motion.button>
              <button
                type="button"
                onClick={onContinue}
                className="text-[11px] font-600 text-neutral-500 underline-offset-4 hover:text-violet-800 hover:underline"
              >
                Skip animation — go to tour
              </button>
              <p className="text-center text-[10px] text-neutral-400">
                Next: quick tour, then unlock your vault
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function LandingClient() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('hero');
  const [vaultPhase, setVaultPhase] = useState<'setup' | 'login'>('setup');

  useEffect(() => {
    setVaultPhase(getStoredVerifier() ? 'login' : 'setup');
  }, []);

  const goVault = () => {
    completeAuthIntroSession();
    router.push('/family-management');
  };

  return (
    <AnimatePresence mode="wait">
      {step === 'hero' ? (
        <motion.div
          key="hero"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, filter: 'blur(8px)' }}
          transition={{ duration: 0.45 }}
          className="min-h-[100dvh]"
        >
          <LandingHero onContinue={() => setStep('onboarding')} />
        </motion.div>
      ) : (
        <motion.div
          key="onboarding"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="flex min-h-[100dvh] flex-col items-center justify-center px-4 py-10 auth-welcome-banner"
        >
          <AuthWelcomePanel phase={vaultPhase} onFinish={goVault} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
