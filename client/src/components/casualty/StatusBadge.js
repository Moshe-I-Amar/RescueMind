import React from 'react';
import { Badge } from '../ui';
import { useCatalog } from '../../context/CatalogContext';
import { STATUS_BADGE } from '../../theme/styles';

export default function StatusBadge({ status }) {
  const { label } = useCatalog();
  return <Badge className={STATUS_BADGE[status]}>{label('statuses', status)}</Badge>;
}
