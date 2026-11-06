import React from 'react';
import { useCatalog } from '../../context/CatalogContext';
import { formatClock } from '../../utils/time';
import { treatmentText } from './casualtyText';

/** A performed treatment: "✓ חוסם עורקים · רגל ימין 14:05  ×" (× = undo, restorable from the toast). */
export default function TreatmentChip({ treatment, onRemove, disabled }) {
  const lookups = useCatalog();
  const text = treatmentText(treatment, lookups);

  return (
    <span className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border-2 border-green-600 bg-green-50 px-3 text-sm font-semibold text-green-800">
      ✓ {text}
      <span className="font-normal">{formatClock(treatment.performedAt)}</span>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onRemove(treatment)}
        aria-label={`בטל ${text}`}
        className="-me-1 h-9 w-9 text-xl text-green-900/50 hover:text-red-700"
      >
        ×
      </button>
    </span>
  );
}
