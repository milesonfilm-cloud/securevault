'use client';

import { useId } from 'react';

export interface VaultBrandIconProps {
  size?: number;
  className?: string;
  /** Accessible name; set empty string for decorative-only (parent supplies label) */
  'aria-label'?: string;
}

/**
 * Custom SecureVault mark — chamfered “vault cell” + warm keyhole + coral accent.
 * Built from the vault palette (#312C51, #48426D, #3D3666, #F0C38E, #F1AA9B).
 */
export default function VaultBrandIcon({
  size = 64,
  className = '',
  'aria-label': ariaLabel = 'SecureVault',
}: VaultBrandIconProps) {
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
      </defs>

      {/* Ambient glow behind mark */}
      <circle cx="32" cy="32" r="26" fill={`url(#vbg-${uid})`} />

      {/* Outer chamfered frame — reads like a vault plate / gem */}
      <path
        d="M18 3.5h28L56.5 18v28L46 56.5H18L3.5 46V18L18 3.5z"
        fill="none"
        stroke="#F0C38E"
        strokeWidth="2.5"
        strokeLinejoin="round"
        opacity="0.45"
      />
      <path
        d="M18 5h28l13 13v28l-13 13H18L5 46V18L18 5z"
        fill={`url(#vbo-${uid})`}
        stroke="#F0C38E"
        strokeWidth="2.15"
        strokeLinejoin="round"
      />

      {/* Inner recess */}
      <path
        d="M22 12h20l9 9v22l-9 9H22l-9-9V21l9-9z"
        fill="#3D3666"
        stroke="#BFB4DF"
        strokeWidth="0.85"
        strokeOpacity="0.55"
      />

      {/* Keyhole */}
      <path
        d="M32 17.5c-3.6 0-6.5 2.7-6.5 6 0 2.1 1 4 2.6 5.1V41.5h7.8V28.6c1.6-1.1 2.6-3 2.6-5.1 0-3.3-2.9-6-6.5-6z"
        fill={`url(#vbi-${uid})`}
      />
      <path
        d="M32 20.2a3.3 3.3 0 100 6.6 3.3 3.3 0 000-6.6zm-1.4 7.1h2.8v9.2h-2.8v-9.2z"
        fill="#312C51"
        fillOpacity="0.92"
      />

      {/* Facet lines — subtle “V” / structure */}
      <path
        d="M32 12v8M22 20l10 8 10-8"
        stroke="#F0C38E"
        strokeWidth="1.1"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.35"
      />

      {/* Coral lock-point accent */}
      <circle
        cx="47.5"
        cy="45.5"
        r="4.25"
        fill={`url(#vbc-${uid})`}
        stroke="#312C51"
        strokeWidth="0.65"
        opacity="0.98"
      />
    </svg>
  );
}
