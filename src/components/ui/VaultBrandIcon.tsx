'use client';

import { useId } from 'react';

import type { AppTheme } from '@/context/ThemeContext';

export interface VaultBrandIconProps {
  size?: number;
  className?: string;
  /** Icon palette follows the active app theme */
  variant?: AppTheme;
  /** Accessible name; set empty string for decorative-only (parent supplies label) */
  'aria-label'?: string;
}

/**
 * SecureVault mark — chamfered vault cell + keyhole + accent.
 * Colors align with each [data-theme] token set (vault purple, calm teal, neon terminal, etc.).
 */
export default function VaultBrandIcon({
  size = 64,
  className = '',
  variant = 'vault',
  'aria-label': ariaLabel = 'SecureVault',
}: VaultBrandIconProps) {
  const uid = useId().replace(/:/g, '');
  const w = variant === 'wellness' || variant === 'pastel';
  const n = variant === 'neon';
  const v = variant === 'voyager';

  const frameStrokeOuter = w ? '#5AA3B8' : n ? '#00ff41' : v ? '#bdae8e' : '#F0C38E';
  const frameStrokeOuterOp = w ? 0.55 : n ? 0.5 : v ? 0.48 : 0.45;
  const frameStrokeInner = w ? '#4A96AC' : n ? '#00cc33' : v ? '#9c8f74' : '#F0C38E';
  const innerRecessFill = w ? '#FFFFFF' : n ? '#0e0e12' : v ? '#141414' : '#3D3666';
  const innerRecessStroke = w ? '#1A1A2E' : n ? '#00ff41' : v ? '#c9b896' : '#BFB4DF';
  const innerRecessStrokeOp = w ? 0.14 : n ? 0.42 : v ? 0.4 : 0.55;
  const keyholeSilhouetteFill = w ? '#1A1A2E' : n ? '#09090b' : v ? '#0a0a0a' : '#312C51';
  const facetStroke = w ? '#6BB8CC' : n ? '#00ff41' : v ? '#c9b896' : '#F0C38E';
  const accentDotStroke = w ? '#1A1A2E' : n ? '#09090b' : v ? '#0a0a0a' : '#312C51';

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
        {w ? (
          <>
            <linearGradient
              id={`vbo-${uid}`}
              x1="6"
              y1="4"
              x2="58"
              y2="60"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#E8F4F8" />
              <stop offset="0.42" stopColor="#9FD4E3" />
              <stop offset="1" stopColor="#6BB8CC" />
            </linearGradient>
            <linearGradient
              id={`vbi-${uid}`}
              x1="32"
              y1="16"
              x2="32"
              y2="46"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#F2D4D4" />
              <stop offset="0.45" stopColor="#E8C4A0" />
              <stop offset="1" stopColor="#D4B896" />
            </linearGradient>
            <linearGradient id={`vbc-${uid}`} x1="44" y1="40" x2="56" y2="56">
              <stop stopColor="#F28A8A" />
              <stop offset="1" stopColor="#E07070" />
            </linearGradient>
            <radialGradient id={`vbg-${uid}`} cx="32" cy="26" r="18" gradientUnits="userSpaceOnUse">
              <stop stopColor="#6BB8CC" stopOpacity="0.38" />
              <stop offset="1" stopColor="#6BB8CC" stopOpacity="0" />
            </radialGradient>
          </>
        ) : n ? (
          <>
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
          </>
        ) : v ? (
          <>
            <linearGradient
              id={`vbo-${uid}`}
              x1="6"
              y1="4"
              x2="58"
              y2="60"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#292524" />
              <stop offset="0.45" stopColor="#1c1917" />
              <stop offset="1" stopColor="#0c0a09" />
            </linearGradient>
            <linearGradient
              id={`vbi-${uid}`}
              x1="32"
              y1="16"
              x2="32"
              y2="46"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#e7e5e4" />
              <stop offset="0.4" stopColor="#c9b896" />
              <stop offset="1" stopColor="#a8a29e" />
            </linearGradient>
            <linearGradient id={`vbc-${uid}`} x1="44" y1="40" x2="56" y2="56">
              <stop stopColor="#a8a29e" />
              <stop offset="1" stopColor="#78716c" />
            </linearGradient>
            <radialGradient id={`vbg-${uid}`} cx="32" cy="26" r="18" gradientUnits="userSpaceOnUse">
              <stop stopColor="#c9b896" stopOpacity="0.32" />
              <stop offset="1" stopColor="#c9b896" stopOpacity="0" />
            </radialGradient>
          </>
        ) : (
          <>
            <linearGradient
              id={`vbo-${uid}`}
              x1="6"
              y1="4"
              x2="58"
              y2="60"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#5c5488" />
              <stop offset="0.45" stopColor="#48426D" />
              <stop offset="1" stopColor="#312C51" />
            </linearGradient>
            <linearGradient
              id={`vbi-${uid}`}
              x1="32"
              y1="16"
              x2="32"
              y2="46"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#F1AA9B" />
              <stop offset="0.4" stopColor="#F0C38E" />
              <stop offset="1" stopColor="#D4A574" />
            </linearGradient>
            <linearGradient id={`vbc-${uid}`} x1="44" y1="40" x2="56" y2="56">
              <stop stopColor="#F1AA9B" />
              <stop offset="1" stopColor="#E07D6A" />
            </linearGradient>
            <radialGradient id={`vbg-${uid}`} cx="32" cy="26" r="18" gradientUnits="userSpaceOnUse">
              <stop stopColor="#F0C38E" stopOpacity="0.45" />
              <stop offset="1" stopColor="#F0C38E" stopOpacity="0" />
            </radialGradient>
          </>
        )}
      </defs>

      <circle cx="32" cy="32" r="26" fill={`url(#vbg-${uid})`} />

      <path
        d="M18 3.5h28L56.5 18v28L46 56.5H18L3.5 46V18L18 3.5z"
        fill="none"
        stroke={frameStrokeOuter}
        strokeWidth="2.5"
        strokeLinejoin="round"
        opacity={frameStrokeOuterOp}
      />
      <path
        d="M18 5h28l13 13v28l-13 13H18L5 46V18L18 5z"
        fill={`url(#vbo-${uid})`}
        stroke={frameStrokeInner}
        strokeWidth="2.15"
        strokeLinejoin="round"
      />

      <path
        d="M22 12h20l9 9v22l-9 9H22l-9-9V21l9-9z"
        fill={innerRecessFill}
        stroke={innerRecessStroke}
        strokeWidth="0.85"
        strokeOpacity={innerRecessStrokeOp}
      />

      <path
        d="M32 17.5c-3.6 0-6.5 2.7-6.5 6 0 2.1 1 4 2.6 5.1V41.5h7.8V28.6c1.6-1.1 2.6-3 2.6-5.1 0-3.3-2.9-6-6.5-6z"
        fill={`url(#vbi-${uid})`}
      />
      <path
        d="M32 20.2a3.3 3.3 0 100 6.6 3.3 3.3 0 000-6.6zm-1.4 7.1h2.8v9.2h-2.8v-9.2z"
        fill={keyholeSilhouetteFill}
        fillOpacity={w ? 0.88 : 0.92}
      />

      <path
        d="M32 12v8M22 20l10 8 10-8"
        stroke={facetStroke}
        strokeWidth="1.1"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={w ? 0.42 : n ? 0.38 : v ? 0.36 : 0.35}
      />

      <circle
        cx="47.5"
        cy="45.5"
        r="4.25"
        fill={`url(#vbc-${uid})`}
        stroke={accentDotStroke}
        strokeWidth="0.65"
        opacity="0.98"
      />
    </svg>
  );
}
