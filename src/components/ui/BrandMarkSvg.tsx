'use client';

import React, { memo, useMemo } from 'react';

import { BRAND_MARK_SRC } from '@/lib/brandLogo';
import { cn } from '@/lib/utils';

export const BRAND_MARK_VIEWBOX_W = 512;
export const BRAND_MARK_VIEWBOX_H = 512;

export interface BrandMarkSvgProps {
  size?: number;
  className?: string;
  title?: string;
  'aria-hidden'?: boolean;
}

/**
 * Brand mark — plain <img> with equal width/height so Android WebView never stretches it.
 */
const BrandMarkSvg = memo(function BrandMarkSvg({
  size = 88,
  className,
  title = 'Strong Vault',
  'aria-hidden': ariaHidden,
}: BrandMarkSvgProps) {
  const alt = useMemo(() => (ariaHidden ? '' : title), [ariaHidden, title]);
  const px = Math.max(24, Math.round(size));

  return (
    // eslint-disable-next-line @next/next/no-img-element -- Capacitor WebView: next/image stretch bugs
    <img
      src={BRAND_MARK_SRC}
      alt={alt}
      width={px}
      height={px}
      decoding="async"
      draggable={false}
      className={cn('block shrink-0 select-none', className)}
      style={{
        width: px,
        height: px,
        maxWidth: px,
        maxHeight: px,
        minWidth: px,
        minHeight: px,
        objectFit: 'contain',
        objectPosition: 'center',
        aspectRatio: '1 / 1',
        backgroundColor: 'transparent',
      }}
      aria-hidden={ariaHidden || undefined}
    />
  );
});

export default BrandMarkSvg;
