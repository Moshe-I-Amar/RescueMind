import React from 'react';
import { levelText } from '../../theme/styles';
import { formatClock } from '../../utils/time';
import { VITAL_METRICS, vitalItems } from './vitalsConfig';

/** Readings newest-first; each value is coloured by the status the server computed for it. */
export default function VitalsHistory({ vitals }) {
  if (!vitals.length) return null;
  const rows = [...vitals].reverse();

  return (
    <div className="rounded-xl bg-white shadow-sm overflow-x-auto">
      <table className="w-full text-sm text-center">
        <thead className="bg-gray-50 text-gray-500">
          <tr>
            <th className="p-2">שעה</th>
            {VITAL_METRICS.map((m) => <th key={m.key} className="p-2">{m.label}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((reading) => {
            const byKey = Object.fromEntries(vitalItems(reading, reading.status).map((i) => [i.key, i]));
            return (
              <tr key={reading.id} className="border-t">
                <td className="p-2 text-gray-500">{formatClock(reading.recordedAt)}</td>
                {VITAL_METRICS.map((m) => (
                  <td key={m.key} className={`p-2 font-semibold ${levelText(byKey[m.key]?.level)}`}>
                    {byKey[m.key]?.value ?? '–'}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
