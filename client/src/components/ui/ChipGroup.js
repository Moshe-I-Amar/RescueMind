import React from 'react';
import cx from './cx';

/**
 * Single-select row of pill buttons.
 * options: [{ value, label, count?, dotClass? }]
 */
export default function ChipGroup({ options, value, onChange, className, ariaLabel }) {
  return (
    <div role="radiogroup" aria-label={ariaLabel} className={cx('flex flex-wrap gap-2', className)}>
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(o.value)}
            className={cx(
              'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm whitespace-nowrap',
              selected ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-800 border-gray-300'
            )}
          >
            {o.dotClass && <span className={cx('h-2 w-2 rounded-full', o.dotClass)} />}
            {o.label}
            {o.count !== undefined && <span className="opacity-70">({o.count})</span>}
          </button>
        );
      })}
    </div>
  );
}
