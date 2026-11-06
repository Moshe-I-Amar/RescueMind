import React from 'react';
import { minutesBetween } from '../../utils/time';

export default function ElapsedSince({ since, now, prefix = '' }) {
  return (
    <span className="text-xs text-gray-500 whitespace-nowrap">
      {prefix}⏱ {minutesBetween(since, now)} ד׳
    </span>
  );
}
