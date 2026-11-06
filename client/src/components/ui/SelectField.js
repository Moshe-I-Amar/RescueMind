import React from 'react';

/** options: [{ code, label }] — the catalog option shape. */
export default function SelectField({ label, options, value, onChange, placeholder = 'בחר', ...props }) {
  return (
    <label className="block text-sm text-gray-700">
      {label && <span className="block mb-1">{label}</span>}
      <select
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value || undefined)}
        className="w-full rounded-lg border border-gray-300 bg-white p-2.5 text-base"
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.code} value={o.code}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
