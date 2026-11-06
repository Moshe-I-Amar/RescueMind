import React, { useState } from 'react';
import cx from './cx';

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

/**
 * Large numeric stepper (−big −1 [value] +1 +big) with an optional keyboard fallback.
 * Always laid out left-to-right so numbers read naturally in RTL pages.
 */
export default function Stepper({ label, value, onChange, min = 0, max = 999, steps = [1, 5], unit, valueClassName }) {
  const [typing, setTyping] = useState(false);
  const deltas = [...steps].reverse().map((s) => -s).concat(steps);
  const left = deltas.slice(0, steps.length);
  const right = deltas.slice(steps.length);

  const button = (delta) => (
    <button
      key={delta}
      type="button"
      onClick={() => onChange(clamp(value + delta, min, max))}
      aria-label={`${label} ${delta > 0 ? '+' : ''}${delta}`}
      className="h-16 w-16 shrink-0 rounded-2xl border-2 border-gray-300 bg-gray-50 text-xl font-extrabold active:bg-gray-200"
    >
      {delta > 0 ? `+${delta}` : `−${-delta}`}
    </button>
  );

  return (
    <div>
      {label && <div className="mb-1 text-sm font-bold text-gray-700">{label}</div>}
      <div dir="ltr" className="flex items-center justify-between gap-1.5">
        {left.map(button)}
        {typing ? (
          <input
            autoFocus
            type="number"
            inputMode="numeric"
            aria-label={label}
            value={Number.isFinite(value) ? value : ''}
            onChange={(e) => onChange(e.target.value === '' ? NaN : Number(e.target.value))}
            onBlur={() => setTyping(false)}
            className="w-24 rounded-xl border-2 border-blue-600 p-1 text-center text-4xl font-black"
          />
        ) : (
          <button
            type="button"
            onClick={() => setTyping(true)}
            aria-label={`${label}: ${value}. הקלדה`}
            className={cx('min-w-0 flex-1 text-center text-5xl font-black leading-none', valueClassName)}
          >
            {Number.isFinite(value) ? value : '–'}
            {unit && <span className="text-2xl">{unit}</span>}
          </button>
        )}
        {right.map(button)}
      </div>
    </div>
  );
}
