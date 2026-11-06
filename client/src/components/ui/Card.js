import React from 'react';
import cx from './cx';

/** White rounded surface. Pass `accentClass` for a coloured edge (on the start side in RTL). */
export default function Card({ accentClass, className, children, ...props }) {
  return (
    <div className={cx('bg-white rounded-xl shadow-sm flex overflow-hidden', className)} {...props}>
      {accentClass && <div className={cx('w-2 shrink-0', accentClass)} />}
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
