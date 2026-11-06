import React from 'react';
import cx from './cx';

const SIZES = {
  md: 'rounded-full px-3 py-1.5 text-sm',
  lg: 'rounded-2xl px-4 min-h-[52px] text-lg font-bold justify-center',
};

/**
 * Single-select row of buttons.
 * options: [{ value, label, count?, dotClass?, selectedClass? }]
 * size 'lg' gives glove-friendly targets; `stretch` makes options share the row equally.
 */
export default function ChipGroup({ options, value, onChange, className, ariaLabel, size = 'md', stretch = false }) {
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
              'inline-flex items-center gap-1.5 border-2 whitespace-nowrap',
              SIZES[size],
              stretch && 'flex-1',
              selected ? o.selectedClass || 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-800 border-gray-300'
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
