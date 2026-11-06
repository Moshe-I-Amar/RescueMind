import React from 'react';
import { SelectField } from '../ui';
import { useCatalog } from '../../context/CatalogContext';

const FIELDS = [
  { key: 'type', list: 'injuryTypes', label: 'סוג פציעה' },
  { key: 'location', list: 'bodyLocations', label: 'מיקום' },
  { key: 'severity', list: 'severities', label: 'חומרה' },
];

/** Controlled editor for one injury { type, location, severity }. */
export default function InjuryFields({ value, onChange }) {
  const { catalog } = useCatalog();
  return (
    <div className="grid grid-cols-3 gap-2">
      {FIELDS.map((f) => (
        <SelectField
          key={f.key}
          label={f.label}
          options={catalog[f.list]}
          value={value[f.key]}
          onChange={(v) => onChange({ ...value, [f.key]: v })}
        />
      ))}
    </div>
  );
}

export const isCompleteInjury = (injury) => Boolean(injury.type && injury.location);
