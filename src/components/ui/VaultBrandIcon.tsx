'use client';

import { useId } from 'react';

import type { AppTheme } from '@/context/ThemeContext';

export interface VaultBrandIconProps {
  size?: number;
  className?: string;
  /** Icon palette (app is Neon-only; kept for API compatibility). */
  variant?: AppTheme;
  /** Accessible name; set empty string for decorative-only (parent supplies label) */
  'aria-label'?: string;
}

/**
 * SecureVault mark — chamfered vault cell + keyhole + accent (Neon terminal palette).
 */
export default function VaultBrandIcon({
  size = 64,
  className = '',
  variant: _variant = 'neon',
  'aria-label': ariaLabel = 'SecureVault',
}: VaultBrandIconProps) {
  void _variant;
  const uid = useId().replace(/:/g, '');

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={className}
      role={ariaLabel ? 'img' : 'presentation'}
      aria-hidden={!ariaLabel}
      aria-label={ariaLabel || undefined}
    >
      <defs>
        <linearGradient
          id={`vbo-${uid}`}
          x1="6"
          y1="4"
          x2="58"
          y2="60"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#2a2a2e" />
          <stop offset="0.45" stopColor="#171717" />
          <stop offset="1" stopColor="#0a0a0c" />
        </linearGradient>
        <linearGradient
          id={`vbi-${uid}`}
          x1="32"
          y1="16"
          x2="32"
          y2="46"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#4ade80" />
          <stop offset="0.45" stopColor="#00ff41" />
          <stop offset="1" stopColor="#00cc33" />
        </linearGradient>
        <linearGradient id={`vbc-${uid}`} x1="44" y1="40" x2="56" y2="56">
          <stop stopColor="#ff4d7d" />
          <stop offset="1" stopColor="#ff0055" />
        </linearGradient>
        <radialGradient id={`vbg-${uid}`} cx="32" cy="26" r="18" gradientUnits="userSpaceOnUse">
          <stop stopColor="#00ff41" stopOpacity="0.28" />
          <stop offset="1" stopColor="#00ff41" stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx="32" cy="32" r="26" fill={`url(#vbg-${uid})`} />

      <path
        d="M18 3.5h28L56.5 18v28L46 56.5H18L3.5 46V18L18 3.5z"
        fill="none"
        stroke="#00ff41"
        strokeWidth="2.5"
        strokeLinejoin="round"
        opacity={0.5}
      />
      <path
        d="M18 5h28l13 13v28l-13 13H18L5 46V18L18 5z"
        fill={`url(#vbo-${uid})`}
        stroke="#00cc33"
        strokeWidth="2.15"
        strokeLinejoin="round"
      />

      <path
        d="M22 12h20l9 9v22l-9 9H22l-9-9V21l9-9z"
        fill="#0e0e12"
        stroke="#00ff41"
        strokeWidth="0.85"
        strokeOpacity={0.42}
      />

      <path
        d="M32 17.5c-3.6 0-6.5 2.7-6.5 6 0 2.1 1 4 2.6 5.1V41.5h7.8V28.6c1.6-1.1 2.6-3 2.6-5.1 0-3.3-2.9-6-6.5-6z"
        fill={`url(#vbi-${uid})`}
      />
      <path
        d="M32 20.2a3.3 3.3 0 100 6.6 3.3 3.3 0 000-6.6zm-1.4 7.1h2.8v9.2h-2.8v-9.2z"
        fill="#09090b"
        fillOpacity={0.92}
      />

      <path
        d="M32 12v8M22 20l10 8 10-8"
        stroke="#00ff41"
        strokeWidth="1.1"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.38}
      />

      <circle
        cx="47.5"
        cy="45.5"
        r="4.25"
        fill={`url(#vbc-${uid})`}
        stroke="#09090b"
        strokeWidth="0.65"
        opacity="0.98"
      />
    </svg>
  );
}
