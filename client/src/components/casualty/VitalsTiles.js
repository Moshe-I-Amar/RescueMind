import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { levelText } from '../../theme/styles';
import { VITAL_METRICS, vitalItems, shockIndexItem } from './vitalsConfig';
import VitalSheet from './VitalSheet';

const Tile = ({ label, value, level, as: Tag = 'div', ...props }) => (
  <Tag className="rounded-xl bg-white p-2 text-center shadow-sm" {...props}>
    <div className="text-xs text-gray-500">{label}</div>
    <div className={`text-2xl font-extrabold ${levelText(level)}`}>{value ?? '–'}</div>
  </Tag>
);

/**
 * Live vital-sign tiles. Every measurable tile is a button: tap -> update just that vital.
 * Shock index is derived by the server, so it is display-only.
 */
export default function VitalsTiles({ casualty, onSave }) {
  const toast = useToast();
  const [editing, setEditing] = useState(null);
  const byKey = Object.fromEntries(vitalItems(casualty.latestVitals, casualty.vitalStatus).map((i) => [i.key, i]));
  const shock = shockIndexItem(casualty);

  const save = async (reading) => {
    const metric = editing;
    setEditing(null);
    const fresh = await onSave(reading);
    toast({ message: `נשמר: ${metric.label} ${metric.value(fresh.latestVitals)}` });
  };

  return (
    <>
      <div className="grid grid-cols-3 gap-2 p-3">
        {VITAL_METRICS.map((m) => (
          <Tile
            key={m.key}
            as="button"
            type="button"
            aria-label={`עדכן ${m.label}`}
            label={m.label}
            value={byKey[m.key]?.value}
            level={byKey[m.key]?.level}
            onClick={() => setEditing(m)}
          />
        ))}
        {shock && <Tile label={shock.label} value={shock.value} level={shock.level} />}
      </div>
      {editing && <VitalSheet metric={editing} casualty={casualty} onSave={save} onClose={() => setEditing(null)} />}
    </>
  );
}
