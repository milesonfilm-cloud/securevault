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
 * Strong Vault brand mark. Prefer `BrandLogoFull` when the full lockup is needed.
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
      <BrandMarkSvg size={size} title="Strong Vault" />
    </div>
  );
});

export default AppLogo;
