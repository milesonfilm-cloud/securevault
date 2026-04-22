'use client';

import React, { memo, useMemo } from 'react';
import { useTheme } from '@/context/ThemeContext';
import VaultBrandIcon from './VaultBrandIcon';

interface AppLogoProps {
  size?: number;
  className?: string;
  onClick?: () => void;
}

const AppLogo = memo(function AppLogo({ size = 64, className = '', onClick }: AppLogoProps) {
  const { theme } = useTheme();
  const containerClassName = useMemo(() => {
    const classes = ['flex items-center shrink-0'];
    if (onClick) classes.push('cursor-pointer hover:opacity-90 transition-opacity');
    if (className) classes.push(className);
    return classes.join(' ');
  }, [onClick, className]);

  return (
    <div className={containerClassName} onClick={onClick}>
      <VaultBrandIcon variant={theme} size={size} aria-label="SecureVault" />
    </div>
  );
});

export default AppLogo;
