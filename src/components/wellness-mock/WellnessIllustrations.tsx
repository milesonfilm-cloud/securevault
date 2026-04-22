import React from 'react';

/** Flat line-art placeholders — soft fills, no gradients */
export function StretchIllustration({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 200 140" fill="none" aria-hidden>
      <ellipse cx="100" cy="118" rx="70" ry="8" fill="#6BB8CC" opacity="0.25" />
      <circle
        cx="100"
        cy="48"
        r="18"
        fill="#E8C4A0"
        opacity="0.5"
        stroke="#1A1A2E"
        strokeWidth="1.2"
      />
      <path
        d="M100 66 L100 95 M88 78 L112 78 M92 95 L85 118 M108 95 L115 118"
        stroke="#1A1A2E"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M78 58 Q100 40 122 58"
        stroke="#6BB8CC"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function SleepNightIllustration({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 200 160" fill="none" aria-hidden>
      <circle
        cx="150"
        cy="36"
        r="22"
        fill="#FAF0D4"
        opacity="0.35"
        stroke="#1A1A2E"
        strokeWidth="1"
      />
      <path
        d="M40 28 L42 34 L48 34 L43 38 L45 44 L40 40 L35 44 L37 38 L32 34 L38 34 Z"
        fill="#FAF0D4"
        opacity="0.7"
      />
      <path
        d="M62 52 L63 55 L66 55 L64 57 L65 60 L62 58 L59 60 L60 57 L58 55 L61 55 Z"
        fill="#FAF0D4"
        opacity="0.5"
      />
      <ellipse cx="100" cy="125" rx="72" ry="10" fill="#1A1A2E" opacity="0.08" />
      <path
        d="M70 100 Q100 88 130 100 L125 118 L75 118 Z"
        fill="#FFFFFF"
        opacity="0.4"
        stroke="#1A1A2E"
        strokeWidth="1"
      />
      <circle
        cx="100"
        cy="72"
        r="16"
        fill="#F2D4D4"
        opacity="0.6"
        stroke="#1A1A2E"
        strokeWidth="1"
      />
      <path d="M100 88 L100 102" stroke="#1A1A2E" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function MoodThumbPlaceholder({ variant }: { variant: 'pink' | 'yellow' }) {
  const fill = variant === 'pink' ? '#F2D4D4' : '#FAF0D4';
  return (
    <svg viewBox="0 0 64 48" className="h-full w-full" fill="none" aria-hidden>
      <rect
        x="8"
        y="10"
        width="48"
        height="32"
        rx="8"
        fill={fill}
        stroke="#1A1A2E"
        strokeWidth="0.8"
        opacity="0.9"
      />
      <circle cx="28" cy="28" r="4" fill="#1A1A2E" opacity="0.35" />
      <circle cx="38" cy="28" r="4" fill="#1A1A2E" opacity="0.35" />
      <path
        d="M26 36 Q32 40 38 36"
        stroke="#1A1A2E"
        strokeWidth="1"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ListThumbPlaceholder() {
  return (
    <svg viewBox="0 0 48 48" className="h-full w-full" fill="none" aria-hidden>
      <rect
        width="48"
        height="48"
        rx="12"
        fill="#D6EAF2"
        stroke="#1A1A2E"
        strokeWidth="0.8"
        opacity="0.5"
      />
      <circle cx="24" cy="20" r="6" fill="#6BB8CC" opacity="0.4" />
      <path
        d="M16 34 H32"
        stroke="#1A1A2E"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.25"
      />
    </svg>
  );
}
