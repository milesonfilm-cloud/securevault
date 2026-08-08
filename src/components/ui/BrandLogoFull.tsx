'use client';

import React, { memo } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { BRAND_LOGO_HEIGHT, BRAND_LOGO_SRC, BRAND_LOGO_WIDTH } from '@/lib/brandLogo';

export interface BrandLogoFullProps {
  /** Visual height of the full lockup in px. */
  iconSize?: number;
  className?: string;
}

/**
 * Full SecureVault lockup (icon + wordmark + tagline) from brand PNG.
 * For headers and navigation use `AppLogo` / `BrandMarkSvg` (icon only).
 */
const BrandLogoFull = memo(function BrandLogoFull({
  iconSize = 200,
  className,
}: BrandLogoFullProps) {
  const tb = useTranslations('brand');

  return (
    <div className={cn('flex flex-col items-center text-center', className)}>
      <Image
        src={BRAND_LOGO_SRC}
        alt={tb('appNameAlt')}
        width={BRAND_LOGO_WIDTH}
        height={BRAND_LOGO_HEIGHT}
        sizes={`${Math.ceil(iconSize * 1.4)}px`}
        priority
        className="h-auto w-auto max-w-[min(420px,92vw)] object-contain drop-shadow-[0_14px_32px_rgba(0,0,0,0.12)]"
        style={{ height: iconSize, width: 'auto' }}
      />
    </div>
  );
});

export default BrandLogoFull;
