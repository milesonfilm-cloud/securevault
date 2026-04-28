import type { CSSProperties } from 'react';

/** Single shared viewpoint — use on `.carousel-scene` only, never on each card transform. */
export const COVERFLOW_PERSPECTIVE = '760px';

/** Flatter perspective + gentler Y-rotation so neighbor cards stay readable (family carousel). */
export const COVERFLOW_PERSPECTIVE_MEMBERS = '1400px';

type MapKey = -2 | -1 | 0 | 1 | 2;

/** Tight stack — strong rotation (widget demo). */
const COVERFLOW_MAP_DEFAULT: Record<
  MapKey,
  { ry: string; tx: string; tz: string; s: number; opacity: number }
> = {
  0: { ry: '0deg', tx: '0px', tz: '0px', s: 1, opacity: 1 },
  1: { ry: '-62deg', tx: '118px', tz: '-195px', s: 0.78, opacity: 0.95 },
  [-1]: { ry: '62deg', tx: '-118px', tz: '-195px', s: 0.78, opacity: 0.95 },
  2: { ry: '-76deg', tx: '248px', tz: '-395px', s: 0.6, opacity: 0.62 },
  [-2]: { ry: '76deg', tx: '-248px', tz: '-395px', s: 0.6, opacity: 0.62 },
};

/**
 * Wider “three in view” layout: shallower Z, milder rotateY, slightly larger side scales
 * so left / center / right stay partially overlapping on typical viewports.
 */
/** ~30% more “face” visible vs prior members preset: milder Y-rot, shallower Z, larger side scale. */
const COVERFLOW_MAP_MEMBERS: Record<
  MapKey,
  { ry: string; tx: string; tz: string; s: number; opacity: number }
> = {
  0: { ry: '0deg', tx: '0px', tz: '0px', s: 1, opacity: 1 },
  1: { ry: '-28deg', tx: '90px', tz: '-64px', s: 0.95, opacity: 1 },
  [-1]: { ry: '28deg', tx: '-90px', tz: '-64px', s: 0.95, opacity: 1 },
  2: { ry: '-36deg', tx: '198px', tz: '-148px', s: 0.82, opacity: 0.88 },
  [-2]: { ry: '36deg', tx: '-198px', tz: '-148px', s: 0.82, opacity: 0.88 },
};

/**
 * Narrow (mobile): side cards at **40%** opacity, with milder 3D than before so
 * neighbors show enough face to read as “there are more cards” (tight Z + scale
 * was reading as a ~5–10% sliver even at higher opacity).
 */
const COVERFLOW_MAP_MEMBERS_NARROW: Record<
  MapKey,
  { ry: string; tx: string; tz: string; s: number; opacity: number }
> = {
  0: { ry: '0deg', tx: '0px', tz: '10px', s: 1, opacity: 1 },
  1: { ry: '-9deg', tx: '40px', tz: '-20px', s: 0.92, opacity: 0.4 },
  [-1]: { ry: '9deg', tx: '-40px', tz: '-20px', s: 0.92, opacity: 0.4 },
  2: { ry: '-12deg', tx: '64px', tz: '-44px', s: 0.78, opacity: 0.4 },
  [-2]: { ry: '12deg', tx: '-64px', tz: '-44px', s: 0.78, opacity: 0.4 },
};

export type CoverflowPreset = 'default' | 'members' | 'membersNarrow';

function coverflowMap(preset: CoverflowPreset) {
  if (preset === 'membersNarrow') return COVERFLOW_MAP_MEMBERS_NARROW;
  if (preset === 'members') return COVERFLOW_MAP_MEMBERS;
  return COVERFLOW_MAP_DEFAULT;
}

export const COVERFLOW_TRANSITION =
  'transform 420ms cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 420ms ease, box-shadow 420ms ease';

/** Shortest circular offset from active index (for any list length). */
export function coverflowOffset(index: number, activeIndex: number, length: number): number {
  if (length <= 0) return 0;
  let o = index - activeIndex;
  if (o > length / 2) o -= length;
  if (o < -length / 2) o += length;
  return o;
}

export function coverflowWrapperShadow(
  offset: number,
  preset: CoverflowPreset = 'default'
): string {
  if (Math.abs(offset) > 2) return 'none';
  if (offset === 0) {
    return '0 36px 72px rgba(0,0,0,0.72), 0 16px 32px rgba(0,0,0,0.5), 0 2px 0 rgba(255,255,255,0.04)';
  }
  /** Lighter than default — heavy black shadow + 0.4 opacity was reading as ~5–10% visible. */
  if (preset === 'membersNarrow') {
    if (Math.abs(offset) === 1) {
      return '0 10px 26px rgba(0,0,0,0.32), 0 3px 10px rgba(0,0,0,0.22)';
    }
    return '0 8px 20px rgba(0,0,0,0.28), 0 2px 8px rgba(0,0,0,0.2)';
  }
  if (Math.abs(offset) === 1) {
    return '0 28px 48px rgba(0,0,0,0.55), 0 12px 24px rgba(0,0,0,0.45)';
  }
  return '0 20px 36px rgba(0,0,0,0.5), 0 8px 16px rgba(0,0,0,0.4)';
}

/** Card transforms only — parent supplies perspective. */
export function coverflowWrapperStyle(
  offset: number,
  preset: CoverflowPreset = 'default'
): CSSProperties {
  if (Math.abs(offset) > 2) {
    return {
      transform:
        'translate(-50%, -50%) translateX(0px) translateZ(-720px) rotateY(0deg) scale(0.22)',
      opacity: 0,
      pointerEvents: 'none',
      boxShadow: 'none',
      transition: COVERFLOW_TRANSITION,
      transformOrigin: 'center center',
    };
  }
  const map = coverflowMap(preset);
  const m = map[offset as MapKey];
  return {
    transform: `translate(-50%, -50%) translateX(${m.tx}) translateZ(${m.tz}) rotateY(${m.ry}) scale(${m.s})`,
    transformOrigin: 'center center',
    opacity: m.opacity,
    pointerEvents: 'auto',
    boxShadow: coverflowWrapperShadow(offset, preset),
    transition: COVERFLOW_TRANSITION,
    backfaceVisibility: 'hidden',
    WebkitBackfaceVisibility: 'hidden',
  };
}

export function coverflowZIndex(offset: number): number {
  if (Math.abs(offset) > 2) return 0;
  if (offset === 0) return 100;
  if (Math.abs(offset) === 1) return 45;
  return 18;
}
