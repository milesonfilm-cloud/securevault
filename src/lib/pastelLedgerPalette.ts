/** Expense-ledger theme: light tint card + deep accent (matches reference UI). */
export const PASTEL_LEDGER_TILES = [
  { bg: '#EDE8F5', accent: '#4A3F6B' },
  { bg: '#EEF6C8', accent: '#4A5A24' },
  { bg: '#E2DFF8', accent: '#4338CA' },
  { bg: '#DCEAF5', accent: '#1E3A5F' },
  { bg: '#E8F5E9', accent: '#2E5C2E' },
  { bg: '#FFE8E0', accent: '#8B3A2A' },
  { bg: '#F0E8FF', accent: '#5B21B6' },
] as const;

export function getPastelLedgerTile(categoryIndex: number) {
  const i = categoryIndex >= 0 ? categoryIndex : 0;
  return PASTEL_LEDGER_TILES[i % PASTEL_LEDGER_TILES.length];
}
