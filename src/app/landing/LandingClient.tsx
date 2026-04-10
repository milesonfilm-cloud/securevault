'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, Sparkles } from 'lucide-react';
import AuthWelcomePanel from '@/components/AuthWelcomePanel';
import VaultBrandIcon from '@/components/ui/VaultBrandIcon';
import { getStoredVerifier } from '@/lib/vaultSession';
import { completeAuthIntroSession } from '@/lib/authIntroSession';

const TITLE = 'SECUREVAULT';
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
    <div className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden bg-[#312C51] px-4 py-12">
      <button
        type="button"
        onClick={onContinue}
        className="absolute right-4 top-4 z-20 rounded-[10px] px-3 py-1.5 text-xs font-600 text-vault-muted transition-colors hover:bg-white/5 hover:text-vault-warm"
      >
        Skip to tour
      </button>
      <div className="pointer-events-none absolute inset-0">
        <motion.div
          className="absolute -left-[30%] top-[10%] h-[min(520px,90vw)] w-[min(520px,90vw)] rounded-full bg-vault-warm/18 blur-[100px]"
          animate={{ x: [0, 30, 0], y: [0, 20, 0], opacity: [0.12, 0.22, 0.12] }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -right-[25%] bottom-[5%] h-[min(440px,80vw)] w-[min(440px,80vw)] rounded-full bg-vault-coral/14 blur-[90px]"
          animate={{ x: [0, -24, 0], scale: [1, 1.06, 1], opacity: [0.1, 0.18, 0.1] }}
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
        <div className="relative mb-2 flex h-[min(280px,62vw)] w-[min(280px,62vw)] items-center justify-center">
          <motion.div
            className="pointer-events-none absolute left-1/2 top-1/2 h-[min(200px,48vw)] w-[min(200px,48vw)] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              background:
                'radial-gradient(circle, rgba(240,195,142,0.55) 0%, rgba(240,195,142,0.08) 42%, transparent 70%)',
            }}
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: [1, 1.12, 1], opacity: [0.75, 1, 0.75] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
          />

          {FRAGMENTS.map((f, i) => (
            <motion.div
              key={i}
              className="absolute left-1/2 top-1/2 h-11 w-11 border border-vault-warm/35 bg-vault-warm/10 shadow-[0_0_24px_rgba(240,195,142,0.12)]"
              style={{
                clipPath: f.clip,
                marginLeft: -22,
                marginTop: -22,
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
              className="drop-shadow-[0_24px_56px_rgba(0,0,0,0.55)]"
            >
              <VaultBrandIcon
                aria-label=""
                size={64}
                className="h-[min(220px,52vw)] w-[min(220px,52vw)] max-h-[260px] max-w-[260px]"
              />
            </motion.div>
          </motion.div>

          <motion.div
            className="absolute -right-1 top-[18%] z-20 flex h-9 w-9 items-center justify-center rounded-xl border border-vault-warm/40 bg-vault-warm/15"
            initial={{ scale: 0, rotate: -40 }}
            animate={{ scale: 1, rotate: [0, 6, -6, 0] }}
            transition={{
              scale: { delay: 0.85, type: 'spring', stiffness: 400, damping: 18 },
              rotate: { duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 },
            }}
          >
            <Sparkles className="h-4 w-4 text-vault-warm" aria-hidden />
          </motion.div>
        </div>

        <div className="mt-2" style={{ perspective: 800 }}>
          <h1 className="flex flex-wrap justify-center gap-y-1 font-sans text-[clamp(1.65rem,6.5vw,2.35rem)] font-800 tracking-[0.12em] text-vault-muted">
            {TITLE.split('').map((ch, i) => (
              <motion.span
                key={`${ch}-${i}`}
                className="inline-block"
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
          </h1>
        </div>

        <motion.p
          className="mt-4 max-w-md text-[11px] font-700 uppercase tracking-[0.42em] text-vault-muted"
          initial={{ opacity: 0, letterSpacing: '0.65em' }}
          animate={{ opacity: 1, letterSpacing: '0.42em' }}
          transition={{ delay: 0.95, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          {TAG}
        </motion.p>

        <motion.p
          className="mt-5 max-w-sm text-sm leading-relaxed text-vault-faint"
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
                className="inline-flex w-full items-center justify-center gap-2 rounded-[14px] bg-vault-warm px-6 py-3.5 text-sm font-800 text-vault-ink shadow-vault"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                Continue
                <ChevronRight className="h-4 w-4" strokeWidth={2.5} aria-hidden />
              </motion.button>
              <button
                type="button"
                onClick={onContinue}
                className="text-[11px] font-600 text-vault-muted underline-offset-4 hover:text-vault-warm hover:underline"
              >
                Skip animation — go to tour
              </button>
              <p className="text-center text-[10px] text-vault-faint">
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
    router.push('/document-vault');
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
          className="flex min-h-[100dvh] flex-col items-center justify-center bg-[#312C51] px-4 py-10"
        >
          <AuthWelcomePanel phase={vaultPhase} onFinish={goVault} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
