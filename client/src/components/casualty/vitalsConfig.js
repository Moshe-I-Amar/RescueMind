/**
 * Single description of every vital sign shown in the UI.
 * Card rows, tiles and the history table all render from this list,
 * so adding a metric is a one-line change.
 *
 * statusKey: which server status (vitalStatus[...]) colours this value.
 */
const hasValue = (v) => v !== undefined && v !== null && v !== '';

/**
 * fields: reading fields edited from this tile (numeric -> stepper per field).
 * choice: catalog list edited with one-tap buttons instead.
 */
export const VITAL_METRICS = [
  { key: 'heartRate', label: 'דופק', unit: 'BPM', fields: ['heartRate'], value: (r) => r.heartRate },
  {
    key: 'oxygenLevel',
    label: 'SpO₂',
    unit: '%',
    fields: ['oxygenLevel'],
    value: (r) => (hasValue(r.oxygenLevel) ? `${r.oxygenLevel}%` : null),
  },
  {
    key: 'bloodPressure',
    label: 'ל.ד',
    unit: 'mmHg',
    statusKey: 'systolic',
    fields: ['systolic', 'diastolic'],
    value: (r) => (hasValue(r.systolic) ? `${r.systolic}/${r.diastolic ?? '–'}` : null),
  },
  { key: 'respiratoryRate', label: 'נשימות', unit: '/דק׳', fields: ['respiratoryRate'], value: (r) => r.respiratoryRate },
  { key: 'avpu', label: 'הכרה', unit: 'AVPU', choice: 'avpu', value: (r) => r.avpu },
];

/** Labels for individual reading fields (stepper titles, messages). */
export const FIELD_LABELS = {
  heartRate: 'דופק',
  oxygenLevel: 'SpO₂',
  systolic: 'סיסטולי',
  diastolic: 'דיאסטולי',
  respiratoryRate: 'נשימות',
};

export const FIELD_UNITS = { oxygenLevel: '%' };

/** Displayable items for one reading: [{ key, label, unit, value, level }] (missing values skipped). */
export function vitalItems(reading, status = {}) {
  if (!reading) return [];
  return VITAL_METRICS.map((m) => ({
    key: m.key,
    label: m.label,
    unit: m.unit,
    value: m.value(reading),
    level: status[m.statusKey || m.key],
  })).filter((item) => hasValue(item.value));
}

/** Shock index is derived by the server for the latest reading. */
export function shockIndexItem(casualty) {
  if (!hasValue(casualty.shockIndex)) return null;
  return {
    key: 'shockIndex',
    label: 'מדד הלם',
    unit: 'SI',
    value: casualty.shockIndex.toFixed(2),
    level: casualty.vitalStatus?.shockIndex,
  };
}
