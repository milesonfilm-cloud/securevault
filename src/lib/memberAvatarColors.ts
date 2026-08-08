/**
 * Curated member accent palette — each member gets a distinct color on creation.
 * `avatarColor` stores the `border` hex for backward compatibility.
 */
export const MEMBER_COLORS = [
  { name: 'purple', bg: '#F3E8FF', border: '#A855F7', text: '#7C3AED' },
  { name: 'teal', bg: '#E0F7FA', border: '#14B8A6', text: '#0D9488' },
  { name: 'amber', bg: '#FFF8E1', border: '#F59E0B', text: '#D97706' },
  { name: 'rose', bg: '#FFF1F2', border: '#F43F5E', text: '#E11D48' },
  { name: 'slate', bg: '#F1F5F9', border: '#64748B', text: '#475569' },
  { name: 'sky', bg: '#E0F2FE', border: '#0EA5E9', text: '#0284C7' },
  { name: 'emerald', bg: '#ECFDF5', border: '#10B981', text: '#059669' },
  { name: 'orange', bg: '#FFF7ED', border: '#F97316', text: '#EA580C' },
] as const;

export type MemberColorDef = (typeof MEMBER_COLORS)[number];

/** Border hex values used as `FamilyMember.avatarColor`. */
export const MEMBER_AVATAR_COLORS = MEMBER_COLORS.map((c) => c.border) as readonly string[];

export type MemberAvatarColor = (typeof MEMBER_AVATAR_COLORS)[number];

export function resolveMemberColor(avatarColor: string): MemberColorDef {
  const normalized = avatarColor.trim().toLowerCase();
  const exact = MEMBER_COLORS.find((c) => c.border.toLowerCase() === normalized);
  if (exact) return exact;
  // Legacy bright swatches — map to nearest palette entry by hue proximity (simple fallback).
  return MEMBER_COLORS[0];
}

/** Auto-assign the next unused member color; cycles when all are taken. */
export function pickNextMemberColor(members: { avatarColor: string }[]): string {
  const used = new Set(members.map((m) => m.avatarColor.toLowerCase()));
  for (const c of MEMBER_COLORS) {
    if (!used.has(c.border.toLowerCase())) return c.border;
  }
  return MEMBER_COLORS[members.length % MEMBER_COLORS.length].border;
}

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
