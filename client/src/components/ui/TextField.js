import React from 'react';

export default function TextField({ label, value, onChange, ...props }) {
  return (
    <label className="block text-sm text-gray-700">
      {label && <span className="block mb-1">{label}</span>}
      <input
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-gray-300 p-2.5 text-base"
        {...props}
      />
    </label>
  );
}
