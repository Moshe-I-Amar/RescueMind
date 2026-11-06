/** Typo guard for numeric entries. `range` is [min, max] of plausible values (from the server catalog). */
export const isPlausible = (value, [min, max]) => value >= min && value <= max;

/** Likely intended values for a typo: 9 -> 90 / 99, 1200 -> 120. */
export function suggestCorrections(value, range) {
  const candidates = [value * 10, value * 10 + 9, Math.round(value / 10)];
  return [...new Set(candidates)].filter((v) => v !== value && isPlausible(v, range));
}
