import React from 'react';
import cx from './cx';

/** tabs: [{ key, label }] */
export default function Tabs({ tabs, active, onChange }) {
  return (
    <div role="tablist" className="flex bg-white border-b border-gray-200">
      {tabs.map((t) => (
        <button
          key={t.key}
          type="button"
          role="tab"
          aria-selected={t.key === active}
          onClick={() => onChange(t.key)}
          className={cx(
            'flex-1 py-3 text-sm border-b-4',
            t.key === active ? 'border-blue-700 text-blue-700 font-bold' : 'border-transparent text-gray-500'
          )}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
