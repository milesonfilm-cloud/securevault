import { MEMBER_AVATAR_COLORS } from './memberAvatarColors';

export type PastelLedgerTile = { bg: string; accent: string };

/** Neon — charcoal panels with green / magenta rim light */
const NEON_TILE_GRADIENTS = [
  'linear-gradient(165deg, #0a0a0c 0%, #121212 42%, #151518 100%)',
  'linear-gradient(168deg, #080808 0%, #101010 40%, rgba(0, 255, 65, 0.09) 100%)',
  'linear-gradient(170deg, #0c0c0e 0%, #141416 50%, rgba(255, 0, 85, 0.07) 100%)',
  'linear-gradient(165deg, #09090b 0%, #121212 45%, #0e0e12 100%)',
  'linear-gradient(172deg, #050506 0%, #0f0f12 48%, rgba(0, 255, 65, 0.07) 100%)',
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
