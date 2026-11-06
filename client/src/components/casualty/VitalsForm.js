import React, { useState } from 'react';
import { Button, SelectField } from '../ui';
import { useCatalog } from '../../context/CatalogContext';
import { VITAL_INPUTS } from './vitalsConfig';

/** Manual vitals entry for casualties without a sensor. Sends only the filled fields. */
export default function VitalsForm({ onSubmit, busy }) {
  const { catalog } = useCatalog();
  const [values, setValues] = useState({});

  const set = (key, value) => setValues((v) => ({ ...v, [key]: value }));

  const payload = Object.fromEntries(
    Object.entries(values)
      .filter(([, v]) => v !== undefined && v !== '')
      .map(([k, v]) => [k, k === 'avpu' ? v : Number(v)])
  );
  const isEmpty = Object.keys(payload).length === 0;

  async function submit(e) {
    e.preventDefault();
    const ok = await onSubmit(payload);
    if (ok !== undefined) setValues({});
  }

  return (
    <form onSubmit={submit} className="rounded-xl bg-white p-3 shadow-sm space-y-3">
      <h3 className="font-bold">הזנת מדדים</h3>
      <div className="grid grid-cols-3 gap-2">
        {VITAL_INPUTS.map((input) => (
          <label key={input.key} className="text-xs text-gray-600">
            {input.label}
            <input
              type="number"
              inputMode="numeric"
              min="0"
              max={input.max}
              value={values[input.key] ?? ''}
              onChange={(e) => set(input.key, e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-base"
            />
          </label>
        ))}
        <SelectField label="הכרה" options={catalog.avpu} value={values.avpu} onChange={(v) => set('avpu', v)} placeholder="—" />
      </div>
      <Button type="submit" className="w-full" disabled={busy || isEmpty}>שמור מדדים</Button>
    </form>
  );
}
