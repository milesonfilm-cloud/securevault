import type { Document, DocumentStack } from './storage';

/** Stable “random” accent per folder id (UI only; not user-picked). */
const STACK_COLOR_PALETTE = [
  '#00FF41',
  '#00D97E',
  '#CCFF00',
  '#FFD700',
  '#FF5F00',
  '#FF0055',
  '#00BFFF',
  '#BF5FFF',
  '#FF00CC',
  '#39FF14',
  '#FFA500',
  '#7FFF00',
] as const;

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = Math.imul(31, h) + s.charCodeAt(i) | 0;
  return Math.abs(h);
}

/** Deterministic vibrant color from stack id — use for buttons, tab, vault banner. */
export function stackColorFromId(stackId: string): string {
  return STACK_COLOR_PALETTE[hashString(stackId) % STACK_COLOR_PALETTE.length];
}

/** Default accent when creating a new stack (keeps stored `accentColor` aligned with id-based UI). */
export function accentForNewStack(stackId: string): string {
  return stackColorFromId(stackId);
}

/** True when the document was explicitly placed in this folder (add/edit document form). */
export function documentMatchesStack(doc: Document, stack: DocumentStack): boolean {
  return doc.stackId === stack.id;
}

export function countDocumentsInStack(documents: Document[], stack: DocumentStack): number {
  return documents.reduce((n, d) => n + (documentMatchesStack(d, stack) ? 1 : 0), 0);
}
