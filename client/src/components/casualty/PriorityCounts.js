import React from 'react';
import { useCatalog } from '../../context/CatalogContext';
import { priorityStyle } from '../../theme/styles';

/** "● 2  ● 2  ● 1" — count of casualties per priority (zeros hidden). */
export default function PriorityCounts({ casualties }) {
  const { catalog, label } = useCatalog();
  const counts = catalog.priorities
    .map((p) => ({ ...p, count: casualties.filter((c) => c.priority === p.code).length }))
    .filter((p) => p.count);

  return (
    <div className="flex gap-3 text-sm">
      {counts.map((p) => (
        <span key={p.code} title={label('priorities', p.code)} className="flex items-center gap-1">
          <span className={`h-2.5 w-2.5 rounded-full ${priorityStyle(p.code).dot}`} />
          {p.count}
        </span>
      ))}
    </div>
  );
}
