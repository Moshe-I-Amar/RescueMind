import React from 'react';
import { Badge, cx } from '../ui';
import { useCatalog } from '../../context/CatalogContext';
import { formatDuration } from '../../utils/time';

const TONE = {
  normal: 'bg-red-100 text-red-800',
  warning: 'bg-amber-400 text-gray-900',
  critical: 'bg-red-700 text-white animate-pulse',
};

/** Live tourniquet clock; escalates using the server's thresholds. */
export default function TourniquetTimer({ tourniquet, now, large = false }) {
  const { catalog } = useCatalog();
  if (!tourniquet) return null;

  const elapsed = now - new Date(tourniquet.startedAt);
  const minutes = elapsed / 60000;
  const limits = catalog.tourniquetMinutes;
  const tone = minutes >= limits.critical ? 'critical' : minutes >= limits.warning ? 'warning' : 'normal';

  return (
    <Badge className={cx(TONE[tone], large && 'text-base px-3 py-1')}>
      <span aria-hidden>⏱</span> ח.ע {formatDuration(elapsed)}
      {tourniquet.count > 1 && <span>(×{tourniquet.count})</span>}
    </Badge>
  );
}
