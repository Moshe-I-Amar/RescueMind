import React from 'react';
import { cx } from '../ui';
import { LEVEL_PANEL } from '../../theme/styles';

/** Server-generated alerts: message + what to do. */
export default function AlertList({ alerts = [], limit, className }) {
  const shown = limit ? alerts.slice(0, limit) : alerts;
  const hidden = alerts.length - shown.length;
  if (!shown.length) return null;

  return (
    <ul className={cx('space-y-1', className)}>
      {shown.map((a) => (
        <li key={a.code} className={cx('rounded-md border px-2 py-1 text-xs', LEVEL_PANEL[a.level])}>
          <span aria-hidden>⚠ </span>
          <b>{a.message}</b>
          {a.hint && <span> — {a.hint}</span>}
        </li>
      ))}
      {hidden > 0 && <li className="text-xs text-gray-500">+{hidden} התראות נוספות</li>}
    </ul>
  );
}
