import { MEMBER_AVATAR_COLORS } from './memberAvatarColors';

export type PastelLedgerTile = { bg: string; accent: string };

/** Neon — uniform charcoal tiles; soft edge tint only (avoids harsh diagonal bands). */
const NEON_TILE_GRADIENTS = [
  'linear-gradient(180deg, #141416 0%, #101012 50%, #0e0e10 100%)',
  'linear-gradient(180deg, #131315 0%, #101012 52%, rgba(0, 255, 65, 0.06) 100%)',
  'linear-gradient(180deg, #131315 0%, #101012 52%, rgba(255, 0, 85, 0.05) 100%)',
  'linear-gradient(180deg, #141416 0%, #0f0f12 50%, #0d0d10 100%)',
  'linear-gradient(180deg, #121214 0%, #0f1012 50%, rgba(0, 255, 65, 0.05) 100%)',
] as const;

const PASTEL_LEDGER_TILES_NEON: readonly PastelLedgerTile[] = MEMBER_AVATAR_COLORS.map(
  (accent, i) => ({
    bg: NEON_TILE_GRADIENTS[i % NEON_TILE_GRADIENTS.length],
    accent,
  })
);

export function getPastelLedgerTile(categoryIndex: number) {
  const i = categoryIndex >= 0 ? categoryIndex : 0;
  return PASTEL_LEDGER_TILES_NEON[i % PASTEL_LEDGER_TILES_NEON.length];
}
