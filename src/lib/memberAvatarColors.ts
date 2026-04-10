/**
 * Distinctive avatar colors for family members (vault theme).
 * Saturated enough for white initials; harmonizes with #312C51 / #48426D UI.
 */
export const MEMBER_AVATAR_COLORS = [
  '#5B4B8A', // royal violet
  '#4A6688', // slate blue
  '#9B5C7C', // dusty rose
  '#4D6B5C', // forest sage
  '#6B5B95', // soft purple
  '#A35F48', // terracotta
  '#2D6B7A', // deep teal
  '#7A6228', // antique gold
  '#5C5478', // mauve
  '#2F6F6B', // pine teal
] as const;

export type MemberAvatarColor = (typeof MEMBER_AVATAR_COLORS)[number];

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
