import React, { useState } from 'react';
import { BottomSheet, Button, ChipGroup, Stepper } from '../ui';
import { useCatalog } from '../../context/CatalogContext';
import { isPlausible, suggestCorrections } from '../../utils/plausibility';
import { minutesBetween } from '../../utils/time';
import { FIELD_LABELS, FIELD_UNITS } from './vitalsConfig';

/** One-tap AVPU (or any catalog choice): tapping a value saves it. */
function ChoiceEditor({ list, value, onSave }) {
  const { catalog } = useCatalog();
  const options = catalog[list].map((o) => ({ value: o.code, label: o.code, selectedClass: 'bg-blue-700 text-white border-blue-700' }));
  return (
    <>
      <ChipGroup ariaLabel={list} size="lg" stretch options={options} value={value} onChange={(v) => onSave({ [list]: v })} />
      <ul className="mt-3 space-y-0.5 text-sm text-gray-500">
        {catalog[list].map((o) => <li key={o.code}>{o.label}</li>)}
      </ul>
    </>
  );
}

/** Typo guard: shows suggested corrections and an explicit "save anyway". */
function PlausibilityWarning({ issues, onUse, onSaveAnyway }) {
  return (
    <div className="mt-4 space-y-3">
      {issues.map(({ field, value, suggestions }) => (
        <div key={field} className="rounded-2xl border-2 border-amber-500 bg-amber-50 p-3">
          <div className="font-bold text-amber-900">ערך לא סביר — {FIELD_LABELS[field]} {value}{FIELD_UNITS[field] || ''}?</div>
          {suggestions.length > 0 && (
            <div className="mt-2 flex gap-2">
              <span className="self-center text-sm text-amber-900">אולי:</span>
              {suggestions.map((s) => (
                <Button key={s} size="lg" className="flex-1" onClick={() => onUse(field, s)}>
                  {s}{FIELD_UNITS[field] || ''}
                </Button>
              ))}
            </div>
          )}
        </div>
      ))}
      <Button variant="secondary" size="lg" className="w-full" onClick={onSaveAnyway}>שמור בכל זאת</Button>
    </div>
  );
}

/** Steppers for the tile's numeric fields, starting from the last known value. */
function NumericEditor({ fields, latest, onSave }) {
  const { catalog } = useCatalog();
  const inputs = catalog.vitalInputs;
  const [values, setValues] = useState(() =>
    Object.fromEntries(fields.map((f) => [f, latest?.[f] ?? inputs[f].initial]))
  );
  const [issues, setIssues] = useState(null);

  const valid = fields.every((f) => Number.isFinite(values[f]));
  const set = (field, value) => {
    setIssues(null);
    setValues((v) => ({ ...v, [field]: value }));
  };

  const save = (force = false) => {
    const found = fields
      .filter((f) => !isPlausible(values[f], inputs[f].plausible))
      .map((f) => ({ field: f, value: values[f], suggestions: suggestCorrections(values[f], inputs[f].plausible) }));
    if (found.length && !force) return setIssues(found);
    return onSave(values);
  };

  return (
    <div className="space-y-4">
      {fields.map((f) => (
        <Stepper
          key={f}
          label={fields.length > 1 ? FIELD_LABELS[f] : undefined}
          value={values[f]}
          onChange={(v) => set(f, v)}
          min={inputs[f].min}
          max={inputs[f].max}
          unit={FIELD_UNITS[f]}
        />
      ))}
      {issues ? (
        <PlausibilityWarning issues={issues} onUse={(f, v) => onSave({ ...values, [f]: v })} onSaveAnyway={() => save(true)} />
      ) : (
        <Button size="lg" className="w-full" disabled={!valid} onClick={() => save()}>
          ✓ שמור
        </Button>
      )}
    </div>
  );
}

/** Bottom sheet for updating the vital behind one tile. */
export default function VitalSheet({ metric, casualty, onSave, onClose }) {
  const latest = casualty.latestVitals;
  const previous = latest && metric.value(latest);
  const subtitle = previous
    ? `אחרון: ${previous} · לפני ${minutesBetween(latest.recordedAt, Date.now())} ד׳`
    : 'אין מדידה קודמת';

  return (
    <BottomSheet title={metric.label} subtitle={subtitle} onClose={onClose}>
      {metric.choice ? (
        <ChoiceEditor list={metric.choice} value={latest?.[metric.choice]} onSave={onSave} />
      ) : (
        <NumericEditor fields={metric.fields} latest={latest} onSave={onSave} />
      )}
    </BottomSheet>
  );
}
