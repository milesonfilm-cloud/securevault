'use client';

import React, { memo, useMemo } from 'react';

import BrandMarkSvg from '@/components/ui/BrandMarkSvg';

interface AppLogoProps {
  /** Renders as CSS height; width follows shield aspect ratio. */
  size?: number;
  className?: string;
  onClick?: () => void;
}

/**
 * **Icon only** (shield mark, no text). For full logo + wordmark see `BrandLogoFull`.
 */
const AppLogo = memo(function AppLogo({ size = 88, className = '', onClick }: AppLogoProps) {
  const containerClassName = useMemo(() => {
    const classes = ['flex items-center shrink-0 justify-center'];
    if (onClick) classes.push('cursor-pointer hover:opacity-90 transition-opacity');
    if (className) classes.push(className);
    return classes.join(' ');
  }, [onClick, className]);

  return (
    <div className={containerClassName} onClick={onClick}>
      <BrandMarkSvg size={size} title="SecureVault" className="max-w-[min(420px,92vw)] drop-shadow-sm" />
    </div>
  );
});

export default AppLogo;
