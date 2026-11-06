/**
 * Single description of every vital sign shown in the UI.
 * Card rows, tiles and the history table all render from this list,
 * so adding a metric is a one-line change.
 *
 * statusKey: which server status (vitalStatus[...]) colours this value.
 */
const hasValue = (v) => v !== undefined && v !== null && v !== '';

export const VITAL_METRICS = [
  { key: 'heartRate', label: 'דופק', unit: 'BPM', value: (r) => r.heartRate },
  { key: 'oxygenLevel', label: 'SpO₂', unit: '%', value: (r) => (hasValue(r.oxygenLevel) ? `${r.oxygenLevel}%` : null) },
  {
    key: 'bloodPressure',
    label: 'ל.ד',
    unit: 'mmHg',
    statusKey: 'systolic',
    value: (r) => (hasValue(r.systolic) ? `${r.systolic}/${r.diastolic ?? '–'}` : null),
  },
  { key: 'respiratoryRate', label: 'נשימות', unit: '/דק׳', value: (r) => r.respiratoryRate },
  { key: 'avpu', label: 'הכרה', unit: 'AVPU', value: (r) => r.avpu },
];

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

/** Numeric inputs of the manual vitals form (AVPU is a select). */
export const VITAL_INPUTS = [
  { key: 'heartRate', label: 'דופק', max: 300 },
  { key: 'oxygenLevel', label: 'SpO₂ %', max: 100 },
  { key: 'systolic', label: 'סיסטולי', max: 300 },
  { key: 'diastolic', label: 'דיאסטולי', max: 200 },
  { key: 'respiratoryRate', label: 'נשימות/דק׳', max: 80 },
];
