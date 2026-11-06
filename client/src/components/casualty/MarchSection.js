import React, { useState } from 'react';
import { Button, ChipGroup } from '../ui';
import AlertList from './AlertList';
import TreatmentChip from './TreatmentChip';

/**
 * One MARCH step: its alerts, what was done, and one-tap actions.
 * Actions with `sites` open an inline site picker; tapping a site logs the action.
 */
export default function MarchSection({ category, treatments, alerts, onAdd, onRemove, busy }) {
  const [pendingAction, setPendingAction] = useState(null);

  const choose = (action) => (action.sites ? setPendingAction(action) : onAdd({ action: action.code }));

  const chooseSite = (site) => {
    onAdd({ action: pendingAction.code, site });
    setPendingAction(null);
  };

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
          <Button
            key={action.code}
            variant={pendingAction?.code === action.code ? 'primary' : 'secondary'}
            size="sm"
            disabled={busy}
            onClick={() => choose(action)}
          >
            + {action.label}
          </Button>
        ))}
      </div>

      {pendingAction && (
        <div className="rounded-lg bg-blue-50 p-2 space-y-2">
          <div className="text-sm font-semibold">{pendingAction.label} — בחר מיקום:</div>
          <ChipGroup
            ariaLabel="מיקום"
            options={pendingAction.sites.map((s) => ({ value: s.code, label: s.label }))}
            value={null}
            onChange={chooseSite}
          />
          <Button variant="ghost" size="sm" onClick={() => setPendingAction(null)}>ביטול</Button>
        </div>
      )}
    </section>
  );
}
