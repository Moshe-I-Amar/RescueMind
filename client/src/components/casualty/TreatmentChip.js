import React from 'react';
import { useCatalog } from '../../context/CatalogContext';
import { formatClock } from '../../utils/time';

/** A performed treatment: "✓ חוסם עורקים · רגל ימין 14:05  ×" */
export default function TreatmentChip({ treatment, onRemove, disabled }) {
  const { actionLabel, siteLabel } = useCatalog();
  const site = treatment.site && siteLabel(treatment.action, treatment.site);

  return (
    <span className="inline-flex items-center gap-2 rounded-lg border border-green-600 bg-green-50 px-2.5 py-1.5 text-sm font-semibold text-green-800">
      ✓ {actionLabel(treatment.action)}
      {site && <span>· {site}</span>}
      <span className="font-normal">{formatClock(treatment.performedAt)}</span>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onRemove(treatment)}
        aria-label={`בטל ${actionLabel(treatment.action)}`}
        className="text-green-900/60 hover:text-red-700"
      >
        ×
      </button>
    </span>
  );
}
