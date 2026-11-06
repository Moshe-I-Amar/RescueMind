import React, { useState } from 'react';
import { BottomSheet, Button, StateMessage } from '../ui';
import { useCatalog } from '../../context/CatalogContext';
import { useToast } from '../../context/ToastContext';
import { useAsyncAction } from '../../hooks/useAsyncAction';
import { casualtiesApi } from '../../api/casualtiesApi';
import { priorityStyle } from '../../theme/styles';

const BULK_COUNTS = [3, 5];

/**
 * One tap = casualty created with that priority and opened.
 * Bulk buttons create several urgent casualties for mass-casualty events (stays on the list).
 */
export default function QuickCreateSheet({ onClose, onCreated, onBulkCreated }) {
  const { catalog, label } = useCatalog();
  const toast = useToast();
  const { run, busy, error } = useAsyncAction();
  const [chosen, setChosen] = useState(null);

  const createOne = (priority) => {
    setChosen(priority);
    run(async () => onCreated(await casualtiesApi.create({ priority })));
  };

  const createMany = (count) =>
    run(async () => {
      const created = await Promise.all(
        Array.from({ length: count }, () => casualtiesApi.create({ priority: 'urgent' }))
      );
      toast({ message: `נוצרו ${count} פצועים (${label('priorities', 'urgent')})` });
      onBulkCreated(created);
    });

  return (
    <BottomSheet title="פצוע חדש" subtitle="לחיצה אחת יוצרת ופותחת את מסך הטיפול. פרטים — אחר כך." onClose={onClose}>
      <div className="grid grid-cols-2 gap-3">
        {catalog.priorities.map((p) => (
          <button
            key={p.code}
            type="button"
            disabled={busy}
            onClick={() => createOne(p.code)}
            className={`${priorityStyle(p.code).badge} h-20 rounded-2xl text-2xl font-extrabold shadow-sm active:scale-95 transition-transform disabled:opacity-60`}
          >
            {busy && chosen === p.code ? '…' : p.label}
          </button>
        ))}
      </div>

      <div className="mt-5 mb-2 text-sm font-bold text-gray-700">אירוע רב נפגעים</div>
      <div className="flex gap-2">
        {BULK_COUNTS.map((n) => (
          <Button key={n} variant="secondary" size="lg" className="flex-1" disabled={busy} onClick={() => createMany(n)}>
            +{n} {label('priorities', 'urgent')}
          </Button>
        ))}
      </div>
      {error && <StateMessage tone="error">{error.message}</StateMessage>}
    </BottomSheet>
  );
}
