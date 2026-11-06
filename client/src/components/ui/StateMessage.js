import React from 'react';
import cx from './cx';

/** Loading / error / empty placeholder. */
export default function StateMessage({ tone = 'muted', children }) {
  return (
    <div className={cx('p-6 text-center text-sm', tone === 'error' ? 'text-red-700' : 'text-gray-500')}>
      {children}
    </div>
  );
}
