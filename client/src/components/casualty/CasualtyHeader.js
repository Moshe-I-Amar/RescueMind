import React from 'react';
import { Link } from 'react-router-dom';
import { useCatalog } from '../../context/CatalogContext';
import { priorityStyle } from '../../theme/styles';
import { minutesBetween } from '../../utils/time';
import TourniquetTimer from './TourniquetTimer';
import StatusBadge from './StatusBadge';
import { casualtyTitle } from './casualtyText';

export default function CasualtyHeader({ casualty, now, onChangePriority }) {
  const { catalog, label } = useCatalog();

  return (
    <header className={`${priorityStyle(casualty.priority).header} text-white px-4 py-3 space-y-2`}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <Link to="/casualties" aria-label="חזרה לרשימה" className="text-2xl leading-none">→</Link>
          <h1 className="text-lg font-bold truncate">{casualtyTitle(casualty)}</h1>
        </div>
        <select
          aria-label="עדיפות"
          value={casualty.priority}
          onChange={(e) => onChangePriority(e.target.value)}
          className="rounded-md bg-white text-gray-900 text-sm font-bold px-2 py-1"
        >
          {catalog.priorities.map((p) => (
            <option key={p.code} value={p.code}>{p.label}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center justify-between gap-2 text-sm">
        <span className="flex items-center gap-2">
          זמן מפציעה: {minutesBetween(casualty.injuryTime, now)} ד׳
          {casualty.mechanism && <span>· {label('mechanisms', casualty.mechanism)}</span>}
          {casualty.status !== 'active' && <StatusBadge status={casualty.status} />}
        </span>
        <TourniquetTimer tourniquet={casualty.activeTourniquet} now={now} large />
      </div>
    </header>
  );
}
