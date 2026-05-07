'use client';

import React, { memo, useMemo } from 'react';
import Image from 'next/image';

import { BRAND_LOGO_HEIGHT, BRAND_LOGO_SRC, BRAND_LOGO_WIDTH } from '@/lib/brandLogo';

interface AppLogoProps {
  /** Renders as CSS height; width follows asset aspect ratio. */
  size?: number;
  className?: string;
  onClick?: () => void;
}

const AppLogo = memo(function AppLogo({ size = 88, className = '', onClick }: AppLogoProps) {
  const containerClassName = useMemo(() => {
    const classes = ['flex items-center shrink-0'];
    if (onClick) classes.push('cursor-pointer hover:opacity-90 transition-opacity');
    if (className) classes.push(className);
    return classes.join(' ');
  }, [onClick, className]);

  return (
    <div className={containerClassName} onClick={onClick}>
      <Image
        src={BRAND_LOGO_SRC}
        alt="SecureVault"
        width={BRAND_LOGO_WIDTH}
        height={BRAND_LOGO_HEIGHT}
        className="w-auto max-w-[min(420px,92vw)] object-contain object-center"
        style={{ height: size, width: 'auto' }}
        priority={false}
      />
    </div>
  );
});

export default AppLogo;
