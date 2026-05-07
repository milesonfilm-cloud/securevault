/** Distinct gradient + ghost/avatar tints for pastel home stacked cards (cycles for 9+ members). */
export type MemberPastelPalette = {
  gradient: string;
  cardShadow: string;
  ghost1: string;
  ghost2: string;
  avatarBg: string;
  avatarInk: string;
};

function clamp255(n: number): number {
  return Math.max(0, Math.min(255, Math.round(n)));
}

function parseHexRgb(input: string): { r: number; g: number; b: number } | null {
  const h = input.trim().replace(/^#/, '');
  if (h.length === 3 && /^[0-9a-fA-F]{3}$/.test(h)) {
    return {
      r: parseInt(h[0]! + h[0]!, 16),
      g: parseInt(h[1]! + h[1]!, 16),
      b: parseInt(h[2]! + h[2]!, 16),
    };
  }
  if (h.length === 6 && /^[0-9a-fA-F]{6}$/.test(h)) {
    const n = parseInt(h, 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }
  return null;
}

function mix(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function rgbToHex(r: number, g: number, b: number): string {
  return (
    '#' +
    clamp255(r).toString(16).padStart(2, '0') +
    clamp255(g).toString(16).padStart(2, '0') +
    clamp255(b).toString(16).padStart(2, '0')
  );
}

/**
 * Neutral chrome when the selected member id is not in the list yet (vault loading)
 * or missing — avoids flashing wrong tints by mistake.
 */
export const PASTEL_ACCENT_PLACEHOLDER_PALETTE: MemberPastelPalette = {
  gradient: 'linear-gradient(135deg, #e4e6ed, #d8dfe9)',
  cardShadow: 'rgba(33,33,33,0.12)',
  ghost1: '#e8eaef',
  ghost2: '#f0f1f5',
  avatarBg: '#eceef2',
  avatarInk: '#212121',
};

/**
 * Card + global accent palette from the member profile color (edit / swatch).
 */
export function pastelPaletteFromAvatarColor(avatarColor: string): MemberPastelPalette {
  const rgb = parseHexRgb(avatarColor);
  if (!rgb) {
    return PASTEL_ACCENT_PLACEHOLDER_PALETTE;
  }
  const { r, g, b } = rgb;
  const light = (t: number) => ({
    r: mix(r, 255, t),
    g: mix(g, 255, t),
    b: mix(b, 255, t),
  });
  const dark = (t: number) => ({
    r: mix(r, 0, t),
    g: mix(g, 0, t),
    b: mix(b, 0, t),
  });
  const gHi = light(0.28);
  const gLo = dark(0.22);
  const lg52 = light(0.52);
  const lg68 = light(0.68);
  const lg86 = light(0.86);
  const dk32 = dark(0.32);
  return {
    gradient: `linear-gradient(135deg, ${rgbToHex(gHi.r, gHi.g, gHi.b)}, ${rgbToHex(gLo.r, gLo.g, gLo.b)})`,
    cardShadow: `rgba(${clamp255(r)},${clamp255(g)},${clamp255(b)},0.34)`,
    ghost1: rgbToHex(lg52.r, lg52.g, lg52.b),
    ghost2: rgbToHex(lg68.r, lg68.g, lg68.b),
    avatarBg: rgbToHex(lg86.r, lg86.g, lg86.b),
    avatarInk: rgbToHex(dk32.r, dk32.g, dk32.b),
  };
}

export const MEMBER_PASTEL_PALETTES: MemberPastelPalette[] = [
  {
    gradient: 'linear-gradient(135deg, #7B6FD4, #4338C9)',
    cardShadow: 'rgba(67,56,201,0.35)',
    ghost1: '#b8b0e8',
    ghost2: '#cec8f0',
    avatarBg: '#e8e4f8',
    avatarInk: '#4338C9',
  },
  {
    gradient: 'linear-gradient(135deg, #5B8DEF, #2563EB)',
    cardShadow: 'rgba(37,99,235,0.35)',
    ghost1: '#a8c4f5',
    ghost2: '#c5daf9',
    avatarBg: '#e8f0fe',
    avatarInk: '#1d4ed8',
  },
  {
    gradient: 'linear-gradient(135deg, #F472B6, #DB2777)',
    cardShadow: 'rgba(219,39,119,0.32)',
    ghost1: '#f9c2e0',
    ghost2: '#fcdcec',
    avatarBg: '#fce7f3',
    avatarInk: '#be185d',
  },
  {
    gradient: 'linear-gradient(135deg, #FBBF24, #D97706)',
    cardShadow: 'rgba(217,119,6,0.32)',
    ghost1: '#fde68a',
    ghost2: '#fef3c7',
    avatarBg: '#fffbeb',
    avatarInk: '#b45309',
  },
  {
    gradient: 'linear-gradient(135deg, #34D399, #059669)',
    cardShadow: 'rgba(5,150,105,0.32)',
    ghost1: '#a7f3d0',
    ghost2: '#d1fae5',
    avatarBg: '#ecfdf5',
    avatarInk: '#047857',
  },
  {
    gradient: 'linear-gradient(135deg, #A78BFA, #6D28D9)',
    cardShadow: 'rgba(109,40,217,0.32)',
    ghost1: '#ddd6fe',
    ghost2: '#ede9fe',
    avatarBg: '#f5f3ff',
    avatarInk: '#5b21b6',
  },
  {
    gradient: 'linear-gradient(135deg, #22D3EE, #0891B2)',
    cardShadow: 'rgba(8,145,178,0.32)',
    ghost1: '#a5f3fc',
    ghost2: '#cffafe',
    avatarBg: '#ecfeff',
    avatarInk: '#0e7490',
  },
  {
    gradient: 'linear-gradient(135deg, #FB923C, #EA580C)',
    cardShadow: 'rgba(234,88,12,0.32)',
    ghost1: '#fed7aa',
    ghost2: '#ffedd5',
    avatarBg: '#fff7ed',
    avatarInk: '#c2410c',
  },
  {
    gradient: 'linear-gradient(135deg, #BEF264, #65A30D)',
    cardShadow: 'rgba(101,163,13,0.32)',
    ghost1: '#d9f99d',
    ghost2: '#ecfccb',
    avatarBg: '#f7fee7',
    avatarInk: '#4d7c0f',
  },
];

export function paletteForMemberIndex(index: number): MemberPastelPalette {
  return MEMBER_PASTEL_PALETTES[index % MEMBER_PASTEL_PALETTES.length];
}

const PASTEL_MEMBER_CSS_KEYS = [
  '--pastel-member-gradient',
  '--pastel-member-ink',
  '--pastel-member-shadow',
  '--pastel-member-ghost1',
  '--pastel-member-ghost2',
  '--pastel-member-avatar-bg',
] as const;

/** Push selected member palette to `documentElement` for global pastel UI (nav, tiles, etc.). */
export function applyPastelMemberCssVars(root: HTMLElement, pal: MemberPastelPalette) {
  root.style.setProperty('--pastel-member-gradient', pal.gradient);
  root.style.setProperty('--pastel-member-ink', pal.avatarInk);
  root.style.setProperty('--pastel-member-shadow', pal.cardShadow);
  root.style.setProperty('--pastel-member-ghost1', pal.ghost1);
  root.style.setProperty('--pastel-member-ghost2', pal.ghost2);
  root.style.setProperty('--pastel-member-avatar-bg', pal.avatarBg);
}

export function clearPastelMemberCssVars(root: HTMLElement) {
  for (const k of PASTEL_MEMBER_CSS_KEYS) {
    root.style.removeProperty(k);
  }
}
