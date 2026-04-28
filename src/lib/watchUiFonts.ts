/** Google Fonts used by smartwatch-style member / widget cards */

export const WATCH_UI_INTER = "'Inter', system-ui, sans-serif";
export const WATCH_UI_MONO = "'DM Mono', ui-monospace, monospace";

const LINK_ID = 'sv-watch-ui-fonts';

export function loadWatchUiFonts(): void {
  if (typeof document === 'undefined' || document.getElementById(LINK_ID)) return;
  const link = document.createElement('link');
  link.id = LINK_ID;
  link.rel = 'stylesheet';
  link.href =
    'https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500;700&family=Inter:wght@400;500;600;700&display=swap';
  document.head.appendChild(link);
}

export function watchAccentGlow(hex: string, alpha = 0.35): string {
  if (!/^#[0-9A-Fa-f]{6}$/.test(hex)) return `rgba(57,255,20,${alpha})`;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

/** Cycle accents — SmartWidget / Neon coverflow */
export const MEMBER_WATCH_ACCENTS = [
  '#39FF14',
  '#D4FF00',
  '#FFE600',
  '#FF4800',
  '#FF2D78',
  '#39FF14',
] as const;
