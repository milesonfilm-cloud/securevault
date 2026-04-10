import { MEMBER_AVATAR_COLORS } from './memberAvatarColors';

/** Panel backgrounds alternate; accent matches member avatar palette for distinction */
export const PASTEL_LEDGER_TILES = MEMBER_AVATAR_COLORS.map((accent, i) => ({
  bg: i % 2 === 0 ? '#48426D' : '#3D3666',
  accent,
})) as readonly { bg: string; accent: string }[];

export function getPastelLedgerTile(categoryIndex: number) {
  const i = categoryIndex >= 0 ? categoryIndex : 0;
  return PASTEL_LEDGER_TILES[i % PASTEL_LEDGER_TILES.length];
}
