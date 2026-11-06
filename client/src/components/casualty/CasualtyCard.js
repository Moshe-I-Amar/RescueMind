import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../ui';
import { useCatalog } from '../../context/CatalogContext';
import { priorityStyle } from '../../theme/styles';
import PriorityBadge from './PriorityBadge';
import StatusBadge from './StatusBadge';
import TourniquetTimer from './TourniquetTimer';
import ElapsedSince from './ElapsedSince';
import VitalsInline from './VitalsInline';
import AlertList from './AlertList';
import { casualtyTitle, injurySummary } from './casualtyText';

export default function CasualtyCard({ casualty, now }) {
  const { label } = useCatalog();

  return (
    <Link to={`/casualties/${casualty.id}`} className="block" aria-label={casualtyTitle(casualty)}>
      <Card accentClass={priorityStyle(casualty.priority).strip} className="hover:shadow-md transition-shadow">
        <div className="p-3 space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <span className="font-bold text-base truncate">{casualtyTitle(casualty)}</span>
            <span className="flex gap-1">
              {casualty.status !== 'active' && <StatusBadge status={casualty.status} />}
              <PriorityBadge priority={casualty.priority} />
            </span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="text-sm text-gray-600 truncate">{injurySummary(casualty, label) || 'פציעות לא תועדו'}</span>
            {casualty.activeTourniquet ? (
              <TourniquetTimer tourniquet={casualty.activeTourniquet} now={now} />
            ) : (
              <ElapsedSince since={casualty.injuryTime} now={now} />
            )}
          </div>

          <VitalsInline casualty={casualty} />
          <AlertList alerts={casualty.alerts} limit={1} />
        </div>
      </Card>
    </Link>
  );
}
