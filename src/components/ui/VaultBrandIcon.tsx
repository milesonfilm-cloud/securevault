'use client';

import BrandMarkSvg from '@/components/ui/BrandMarkSvg';

export interface VaultBrandIconProps {
  size?: number;
  className?: string;
  /** Accessible name; set empty string for decorative-only (parent supplies label) */
  'aria-label'?: string;
}

/**
 * Strong Vault mark — uses the official brand artwork.
 */
export default function VaultBrandIcon({
  size = 64,
  className = '',
  'aria-label': ariaLabel = 'Strong Vault',
}: VaultBrandIconProps) {
  return (
    <BrandMarkSvg
      size={size}
      className={className}
      title={ariaLabel || 'Strong Vault'}
      aria-hidden={!ariaLabel}
    />
  );
}
