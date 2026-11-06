import React from 'react';
import { Button } from '../ui';
import AlertList from './AlertList';
import TreatmentChip from './TreatmentChip';

/** One MARCH step: its alerts, what was done, and its actions. */
export default function MarchSection({ category, treatments, alerts, onChoose, onRemove, busy }) {
  return (
    <section className="rounded-xl bg-white p-3 shadow-sm space-y-2" aria-label={category.label}>
      <h3 className="flex items-center gap-2 font-bold">
        <span className="flex h-8 min-w-8 px-1.5 items-center justify-center rounded-lg bg-blue-700 text-white text-sm">
          {category.code}
        </span>
        {category.label}
      </h3>

      <AlertList alerts={alerts} />

      {treatments.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {treatments.map((t) => (
            <TreatmentChip key={t.id} treatment={t} onRemove={onRemove} disabled={busy} />
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {category.actions.map((action) => (
          <Button key={action.code} variant="secondary" disabled={busy} onClick={() => onChoose(action)} className="min-h-[48px]">
            + {action.label}
          </Button>
        ))}
      </div>
    </section>
  );
}
