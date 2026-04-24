/** Deep-merge message trees (locale overlay onto English base). */
export function mergeMessages<T extends Record<string, unknown>>(
  base: T,
  overlay: Partial<T> | Record<string, unknown>
): T {
  const out = { ...base } as Record<string, unknown>;
  for (const key of Object.keys(overlay)) {
    const b = out[key];
    const o = overlay[key as keyof typeof overlay];
    if (
      o !== null &&
      typeof o === 'object' &&
      !Array.isArray(o) &&
      b !== null &&
      typeof b === 'object' &&
      !Array.isArray(b)
    ) {
      out[key] = mergeMessages(b as Record<string, unknown>, o as Record<string, unknown>);
    } else if (o !== undefined) {
      out[key] = o;
    }
  }
  return out as T;
}
