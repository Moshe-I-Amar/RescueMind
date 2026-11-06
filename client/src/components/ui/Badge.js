import React from 'react';
import cx from './cx';

export default function Badge({ className, children }) {
  return (
    <span className={cx('inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-bold whitespace-nowrap', className)}>
      {children}
    </span>
  );
}
