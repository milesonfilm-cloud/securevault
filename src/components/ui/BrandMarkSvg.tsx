'use client';

import React, { memo, useMemo } from 'react';
import Image from 'next/image';

import { BRAND_MARK_HEIGHT, BRAND_MARK_SRC, BRAND_MARK_WIDTH } from '@/lib/brandLogo';
import { cn } from '@/lib/utils';

/** Kept for imports that expected SVG sizing; image is square — aspect 1. */
export const BRAND_MARK_VIEWBOX_W = BRAND_MARK_WIDTH;
export const BRAND_MARK_VIEWBOX_H = BRAND_MARK_HEIGHT;

export interface BrandMarkSvgProps {
  size?: number;
  className?: string;
  title?: string;
  'aria-hidden'?: boolean;
}

/**
 * Brand mark from bundled artwork (`/public/brand/securevault-icon.png`).
 * Component name unchanged for minimal churn.
 */
const BrandMarkSvg = memo(function BrandMarkSvg({
  size = 88,
  className,
  title = 'SecureVault',
  'aria-hidden': ariaHidden,
}: BrandMarkSvgProps) {
  const alt = useMemo(() => (ariaHidden ? '' : title), [ariaHidden, title]);

  return (
    <Image
      src={BRAND_MARK_SRC}
      alt={alt}
      width={BRAND_MARK_WIDTH}
      height={BRAND_MARK_HEIGHT}
      sizes={`${Math.ceil(size * 1.5)}px`}
      className={cn('h-auto w-auto max-w-[min(420px,92vw)] object-contain', className)}
      style={{ height: size, width: 'auto' }}
      priority={false}
      aria-hidden={ariaHidden || undefined}
    />
  );
});

export default BrandMarkSvg;
