import React from 'react';
import { levelText } from '../../theme/styles';
import { vitalItems, shockIndexItem } from './vitalsConfig';

/** Compact one-line vitals for list cards. */
export default function VitalsInline({ casualty }) {
  const items = [
    ...vitalItems(casualty.latestVitals, casualty.vitalStatus).filter((i) => i.key !== 'respiratoryRate'),
    shockIndexItem(casualty),
  ].filter(Boolean);

  if (!items.length) {
    return <div className="text-sm text-gray-400">אין מדדים · אין חיישן מחובר</div>;
  }

  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
      {items.map((i) => (
        <span key={i.key}>
          {i.key === 'shockIndex' ? 'SI' : i.label}{' '}
          <b className={`text-base ${levelText(i.level)}`}>{i.value}</b>
        </span>
      ))}
    </div>
  );
}
