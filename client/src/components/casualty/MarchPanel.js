import React from 'react';
import { useCatalog } from '../../context/CatalogContext';
import { useAsyncAction } from '../../hooks/useAsyncAction';
import { StateMessage } from '../ui';
import MarchSection from './MarchSection';

/** Treatment tab: the MARCH protocol in order, each step with its own alerts and actions. */
export default function MarchPanel({ casualty, onAdd, onRemove }) {
  const { catalog, actionLabel } = useCatalog();
  const { run, busy, error } = useAsyncAction();

  const remove = (treatment) => {
    if (window.confirm(`לבטל את "${actionLabel(treatment.action)}"?`)) run(() => onRemove(treatment.id));
  };

  return (
    <div className="space-y-2 p-3">
      {error && <StateMessage tone="error">{error.message}</StateMessage>}
      {catalog.march.map((category) => (
        <MarchSection
          key={category.code}
          category={category}
          treatments={casualty.treatments.filter((t) => t.category === category.code)}
          alerts={casualty.alerts.filter((a) => a.march === category.code)}
          onAdd={(treatment) => run(() => onAdd(treatment))}
          onRemove={remove}
          busy={busy}
        />
      ))}
    </div>
  );
}
