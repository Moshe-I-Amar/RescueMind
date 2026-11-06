import React from 'react';
import { Badge } from '../ui';
import { useCatalog } from '../../context/CatalogContext';
import { priorityStyle } from '../../theme/styles';

export default function PriorityBadge({ priority }) {
  const { label } = useCatalog();
  return <Badge className={priorityStyle(priority).badge}>{label('priorities', priority)}</Badge>;
}
