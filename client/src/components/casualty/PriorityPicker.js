import React from 'react';
import { ChipGroup } from '../ui';
import { useCatalog } from '../../context/CatalogContext';
import { priorityStyle } from '../../theme/styles';

export default function PriorityPicker({ value, onChange }) {
  const { catalog } = useCatalog();
  const options = catalog.priorities.map((p) => ({
    value: p.code,
    label: p.label,
    dotClass: priorityStyle(p.code).dot,
  }));
  return <ChipGroup ariaLabel="עדיפות" options={options} value={value} onChange={onChange} />;
}
