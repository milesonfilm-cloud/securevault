'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import BrandLogoFull from '@/components/ui/BrandLogoFull';
import {
  BRAND_LOGO_ANIMATION_MP4_SRC,
  BRAND_LOGO_ANIMATION_SRC,
  BRAND_LOGO_SRC,
} from '@/lib/brandLogo';
import { markLogoSplashSeen } from '@/lib/logoSplash';

type BrandLogoSplashProps = {
  onFinished: () => void;
};

/**
 * First-launch only: plays the brand logo animation, then continues.
 */
export default function BrandLogoSplash({ onFinished }: BrandLogoSplashProps) {
  const finishedRef = useRef(false);
  const [useFallback, setUseFallback] = useState(false);

  const finish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    markLogoSplashSeen();
    onFinished();
  }, [onFinished]);

  useEffect(() => {
    const t = window.setTimeout(finish, useFallback ? 2200 : 12000);
    return () => window.clearTimeout(t);
  }, [finish, useFallback]);

  return (
    <div className="auth-welcome-banner relative flex min-h-[100dvh] w-full flex-col items-center justify-center overflow-x-hidden bg-[#F8F4F0] p-4 py-10">
      <button
        type="button"
        onClick={finish}
        className="absolute right-4 top-4 z-20 rounded-[10px] px-3 py-1.5 text-xs font-600 text-vault-muted transition-colors hover:bg-black/5 hover:text-vault-text"
      >
        Skip
      </button>
      {useFallback ? (
        <BrandLogoFull iconSize={280} className="w-full max-w-[min(360px,90vw)] px-2" />
      ) : (
        <video
          autoPlay
          muted
          playsInline
          poster={BRAND_LOGO_SRC}
          onEnded={finish}
          onError={() => setUseFallback(true)}
          className="h-auto max-h-[min(420px,70vh)] w-auto max-w-[min(360px,90vw)] bg-transparent object-contain"
          aria-label="Strong Vault"
        >
          <source src={BRAND_LOGO_ANIMATION_SRC} type="video/webm" />
          <source src={BRAND_LOGO_ANIMATION_MP4_SRC} type="video/mp4" />
        </video>
      )}
    </div>
  );
}
