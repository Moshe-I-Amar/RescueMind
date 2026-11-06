import React from 'react';
import { levelText } from '../../theme/styles';
import { vitalItems, shockIndexItem } from './vitalsConfig';

/** Large vital-sign tiles for the casualty screen. */
export default function VitalsTiles({ casualty }) {
  const items = [...vitalItems(casualty.latestVitals, casualty.vitalStatus), shockIndexItem(casualty)].filter(Boolean);

  if (!items.length) {
    return <div className="mx-3 my-3 rounded-xl bg-white p-4 text-center text-gray-500">אין מדדים עדיין — הזן ידנית בלשונית ניטור</div>;
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 p-3">
      {items.map((i) => (
        <div key={i.key} className="rounded-xl bg-white p-2 text-center shadow-sm">
          <div className="text-xs text-gray-500">{i.label}</div>
          <div className={`text-2xl font-extrabold ${levelText(i.level)}`}>{i.value}</div>
        </div>
      ))}
    </div>
  );
}
