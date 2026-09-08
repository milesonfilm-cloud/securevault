'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from '@/i18n/navigation';
import { motion, AnimatePresence } from 'motion/react';
import AuthWelcomePanel from '@/components/AuthWelcomePanel';
import BrandLogoSplash from '@/components/ui/BrandLogoSplash';
import { getStoredVerifier } from '@/lib/vaultSession';
import { completeAuthIntroSession } from '@/lib/authIntroSession';
import { hasSeenLogoSplash } from '@/lib/logoSplash';

type Step = 'splash' | 'onboarding';

export default function LandingClient() {
  const router = useRouter();
  const [step, setStep] = useState<Step | null>(null);
  const [vaultPhase, setVaultPhase] = useState<'setup' | 'login'>('setup');

  useEffect(() => {
    const hasVault = Boolean(getStoredVerifier());
    setVaultPhase(hasVault ? 'login' : 'setup');
    setStep(hasSeenLogoSplash() ? 'onboarding' : 'splash');
  }, []);

  const goVault = () => {
    completeAuthIntroSession();
    router.push('/family-management');
  };

  if (!step) {
    return <div className="min-h-[100dvh] bg-[#F8F4F0]" />;
  }

  return (
    <AnimatePresence mode="wait">
      {step === 'splash' ? (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="min-h-[100dvh]"
        >
          <BrandLogoSplash onFinished={() => setStep('onboarding')} />
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
