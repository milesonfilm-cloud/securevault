'use client';

import React, { memo } from 'react';
import { useTranslations } from 'next-intl';

import BrandMarkSvg from '@/components/ui/BrandMarkSvg';
import { cn } from '@/lib/utils';

export interface BrandLogoFullProps {
  /** Mark height in px; wordmark scales with it. */
  iconSize?: number;
  className?: string;
  /** Hide tagline under the name (compact). */
  hideTagline?: boolean;
}

/**
 * Full Strong Vault lockup: mark + wordmark text (never uses the cropped PNG lockup).
 */
const BrandLogoFull = memo(function BrandLogoFull({
  iconSize = 220,
  className,
  hideTagline = false,
}: BrandLogoFullProps) {
  const tb = useTranslations('brand');
  const mark = Math.max(72, Math.min(220, Math.round(iconSize * 0.72)));
  const titlePx = Math.max(22, Math.min(40, Math.round(mark * 0.22)));

  return (
    <div
      className={cn(
        'flex w-full max-w-full flex-col items-center justify-center overflow-visible px-2 text-center',
        className
      )}
    >
      <BrandMarkSvg size={mark} title={tb('appNameAlt')} />
      <p
        className="mt-3 font-800 uppercase leading-none tracking-tight"
        style={{ fontSize: titlePx }}
      >
        <span className="text-[#1A1F2E]">{tb('wordmarkSecure')}</span>{' '}
        <span className="text-[#E07A6A]">{tb('wordmarkVault')}</span>
      </p>
      {hideTagline ? null : (
        <p className="mt-2.5 flex items-center justify-center gap-2 text-[10px] font-700 uppercase tracking-[0.18em] text-[#5C6578]">
          <span className="inline-block h-px w-5 shrink-0 bg-[#E07A6A]" aria-hidden />
          {tb('tagline')}
          <span className="inline-block h-px w-5 shrink-0 bg-[#5EC4B0]" aria-hidden />
        </p>
      )}
    </div>
  );
});

export default BrandLogoFull;
