import React, { useState } from 'react';
import { Button, ChipGroup, SelectField, StateMessage, TextField } from '../ui';
import { useCatalog } from '../../context/CatalogContext';
import { useAsyncAction } from '../../hooks/useAsyncAction';
import InjuryFields, { isCompleteInjury } from './InjuryFields';

const NEW_INJURY = { severity: 'moderate' };

const Section = ({ title, children }) => (
  <section className="rounded-xl bg-white p-3 shadow-sm space-y-3">
    <h3 className="font-bold">{title}</h3>
    {children}
  </section>
);

/** Identity, evacuation status and injuries. Every change is saved immediately. */
export default function DetailsPanel({ casualty, onUpdate }) {
  const { catalog, label } = useCatalog();
  const { run, busy, error } = useAsyncAction();
  const [name, setName] = useState(casualty.name || '');
  const [injury, setInjury] = useState(NEW_INJURY);

  const save = (fields) => run(() => onUpdate(fields));
  const injuries = casualty.injuries || [];

  const addInjury = async () => {
    await save({ injuries: [...injuries.map(stripId), injury] });
    setInjury(NEW_INJURY);
  };
  const removeInjury = (index) => save({ injuries: injuries.filter((_, i) => i !== index).map(stripId) });

  return (
    <div className="space-y-3 p-3">
      {error && <StateMessage tone="error">{error.message}</StateMessage>}

      <Section title="סטטוס פינוי">
        <ChipGroup
          ariaLabel="סטטוס"
          options={catalog.statuses.map((s) => ({ value: s.code, label: s.label }))}
          value={casualty.status}
          onChange={(status) => save({ status })}
        />
      </Section>

      <Section title="זיהוי">
        <TextField
          label="שם"
          value={name}
          onChange={setName}
          onBlur={() => name !== (casualty.name || '') && save({ name: name.trim() })}
          placeholder="לא מזוהה"
        />
        <SelectField
          label="מנגנון פציעה"
          options={catalog.mechanisms}
          value={casualty.mechanism}
          onChange={(mechanism) => mechanism && save({ mechanism })}
        />
      </Section>

      <Section title="פציעות">
        {injuries.length === 0 && <div className="text-sm text-gray-500">לא תועדו פציעות</div>}
        <ul className="space-y-1">
          {injuries.map((i, index) => (
            <li key={i.id || index} className="flex items-center justify-between border-b pb-1 text-sm">
              <span>
                <b>{label('injuryTypes', i.type)}</b> · {label('bodyLocations', i.location)} · {label('severities', i.severity)}
              </span>
              <button type="button" disabled={busy} onClick={() => removeInjury(index)} aria-label="הסר פציעה" className="text-red-600 text-lg">
                ×
              </button>
            </li>
          ))}
        </ul>
        <InjuryFields value={injury} onChange={setInjury} />
        <Button variant="secondary" disabled={busy || !isCompleteInjury(injury)} onClick={addInjury}>
          + הוסף פציעה
        </Button>
      </Section>
    </div>
  );
}

/** Server returns sub-document ids; send back only the editable fields. */
const stripId = ({ type, location, severity }) => ({ type, location, severity });
