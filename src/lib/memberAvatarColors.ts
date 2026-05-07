/**
 * Bright accent swatches for family member profiles.
 * Initials pick white vs dark ink via `contrastingInitialsHex` in `MemberAvatar`.
 */
export const MEMBER_AVATAR_COLORS = [
  '#8B5CF6', // violet
  '#3B82F6', // blue
  '#10B981', // emerald
  '#F59E0B', // amber
  '#EF4444', // red
  '#EC4899', // pink
  '#06B6D4', // cyan
  '#84CC16', // lime
  '#F97316', // orange
  '#6366F1', // indigo
] as const;

export type MemberAvatarColor = (typeof MEMBER_AVATAR_COLORS)[number];

function parseHexRgb(hex: string): { r: number; g: number; b: number } | null {
  const h = hex.trim().replace(/^#/, '');
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

/** Foreground for initials on `avatarColor` (dark on bright/yellow tints, white on deeper hues). */
export function contrastingInitialsHex(bgHex: string): string {
  const rgb = parseHexRgb(bgHex);
  if (!rgb) return '#ffffff';
  const yiq = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
  return yiq >= 165 ? '#212121' : '#ffffff';
}

/** rgba() from #RRGGBB for pills and soft fills */
export function hexAlpha(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  if (h.length !== 6) return `rgba(196,189,220,${alpha})`;
  const n = parseInt(h, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}
