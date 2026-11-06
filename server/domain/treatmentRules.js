/**
 * Pure rules evaluated before a treatment is logged.
 * Warnings are structured (no text) so clients format them in their own locale/time zone.
 */

/** Same action on the same site (or both without a site) was already logged. */
function duplicateWarnings(existing, { action, site }) {
  return existing
    .filter((t) => t.action === action && (t.site || null) === (site || null))
    .map((t) => ({ code: 'duplicate', action, site: t.site || null, performedAt: t.performedAt }));
}

/** All warnings for a new treatment; empty = safe to log without asking. */
function treatmentWarnings(existing, treatment) {
  return [...duplicateWarnings(existing, treatment)];
}

module.exports = { treatmentWarnings };
