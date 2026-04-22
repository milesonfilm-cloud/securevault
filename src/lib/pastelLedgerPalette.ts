import { MEMBER_AVATAR_COLORS } from './memberAvatarColors';

export type PastelLedgerTile = { bg: string; accent: string };

export type LedgerTileTheme = 'vault' | 'wellness' | 'pastel' | 'voyager' | 'neon';

/** Dark vault panel tones — used when UI theme is Vault */
export const PASTEL_LEDGER_TILES: readonly PastelLedgerTile[] = MEMBER_AVATAR_COLORS.map(
  (accent, i) => ({
    bg: i % 2 === 0 ? '#48426D' : '#3D3666',
    accent,
  })
);

/** Calm theme: soft whites and tints (no purple) */
const WELLNESS_TILE_BACKGROUNDS = ['#FFFFFF', '#D6EAF2', '#FAF0D4', '#F2D4D4', '#E8C4A0'] as const;

const PASTEL_LEDGER_TILES_WELLNESS: readonly PastelLedgerTile[] = MEMBER_AVATAR_COLORS.map(
  (accent, i) => ({
    bg: WELLNESS_TILE_BACKGROUNDS[i % WELLNESS_TILE_BACKGROUNDS.length],
    accent,
  })
);

/** Studio theme: soft vertical gradients (peach, mint, sky, tan, lime) */
const PASTEL_STUDIO_TILE_GRADIENTS = [
  'linear-gradient(180deg, #ffe8dc 0%, #ffd0b8 100%)',
  'linear-gradient(180deg, #dcf8ee 0%, #bfe8d8 100%)',
  'linear-gradient(180deg, #dbeafe 0%, #bfdbfe 100%)',
  'linear-gradient(180deg, #f5e6d3 0%, #e8d4bc 100%)',
  'linear-gradient(180deg, #ecfccb 0%, #d9f99d 100%)',
] as const;

const PASTEL_LEDGER_TILES_STUDIO: readonly PastelLedgerTile[] = MEMBER_AVATAR_COLORS.map(
  (accent, i) => ({
    bg: PASTEL_STUDIO_TILE_GRADIENTS[i % PASTEL_STUDIO_TILE_GRADIENTS.length],
    accent,
  })
);

/** Voyager — near-black editorial tiles with warm silver / ink accents */
const VOYAGER_TILE_GRADIENTS = [
  'linear-gradient(165deg, #050506 0%, #121212 42%, #1c1917 100%)',
  'linear-gradient(168deg, #0a0a0c 0%, #18181b 40%, #27272a 100%)',
  'linear-gradient(170deg, #030303 0%, #141414 50%, #262626 100%)',
  'linear-gradient(165deg, #0c0a09 0%, #1c1917 45%, #292524 100%)',
  'linear-gradient(172deg, #09090b 0%, #18181b 48%, rgba(30, 27, 75, 0.35) 100%)',
] as const;

const PASTEL_LEDGER_TILES_VOYAGER: readonly PastelLedgerTile[] = MEMBER_AVATAR_COLORS.map(
  (accent, i) => ({
    bg: VOYAGER_TILE_GRADIENTS[i % VOYAGER_TILE_GRADIENTS.length],
    accent,
  })
);

/** Neon — charcoal panels with green / magenta rim light (matches [data-theme='neon']) */
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

export function getPastelLedgerTile(categoryIndex: number, theme: LedgerTileTheme = 'vault') {
  const i = categoryIndex >= 0 ? categoryIndex : 0;
  if (theme === 'pastel') {
    return PASTEL_LEDGER_TILES_STUDIO[i % PASTEL_LEDGER_TILES_STUDIO.length];
  }
  if (theme === 'voyager') {
    return PASTEL_LEDGER_TILES_VOYAGER[i % PASTEL_LEDGER_TILES_VOYAGER.length];
  }
  if (theme === 'neon') {
    return PASTEL_LEDGER_TILES_NEON[i % PASTEL_LEDGER_TILES_NEON.length];
  }
  const tiles = theme === 'wellness' ? PASTEL_LEDGER_TILES_WELLNESS : PASTEL_LEDGER_TILES;
  return tiles[i % tiles.length];
}
