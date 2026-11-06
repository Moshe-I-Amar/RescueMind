import React, { useState } from 'react';
import { useCatalog } from '../../context/CatalogContext';
import { useToast } from '../../context/ToastContext';
import { useAsyncAction } from '../../hooks/useAsyncAction';
import { StateMessage } from '../ui';
import { formatClock } from '../../utils/time';
import MarchSection from './MarchSection';
import TreatmentSheet from './TreatmentSheet';
import { treatmentText } from './casualtyText';

const minutesAgoToIso = (minutes) => new Date(Date.now() - minutes * 60000).toISOString();

/** The treatment newly present in `fresh` (the server returns the whole casualty). */
const findAdded = (before, fresh) => {
  const known = new Set(before.map((t) => t.id));
  return fresh.treatments.find((t) => !known.has(t.id));
};

/**
 * Treatment tab. Flow:
 * - action without site -> logged with one tap
 * - action with sites -> sheet (site + when)
 * - server asks to confirm (409, e.g. duplicate) -> sheet with the warning, re-sent with confirm
 * Every log/undo shows a toast that can reverse it.
 */
export default function MarchPanel({ casualty, onAdd, onRemove }) {
  const lookups = useCatalog();
  const toast = useToast();
  const { run, busy, error } = useAsyncAction();
  const [sheet, setSheet] = useState(null); // { action, site?, warnings? }

  const log = (action, input) =>
    run(async () => {
      try {
        const fresh = await onAdd({ action: action.code, ...input });
        setSheet(null);
        const added = findAdded(casualty.treatments, fresh);
        toast({
          message: `נרשם: ${treatmentText(added, lookups)} · ${formatClock(added.performedAt)}`,
          actionLabel: 'בטל',
          onAction: () => run(() => onRemove(added.id)),
        });
      } catch (err) {
        if (err.status !== 409) throw err;
        setSheet({ action, site: input.site, warnings: err.details.warnings, pending: input });
      }
    });

  const choose = (action) => (action.sites ? setSheet({ action }) : log(action, {}));

  const confirmFromSheet = ({ site, minutesAgo }) =>
    log(sheet.action, {
      ...(site && { site }),
      performedAt: minutesAgoToIso(minutesAgo),
      confirm: Boolean(sheet.warnings?.length),
    });

  const remove = (treatment) =>
    run(async () => {
      await onRemove(treatment.id);
      const { action, site, performedAt } = treatment;
      toast({
        message: `בוטל: ${treatmentText(treatment, lookups)}`,
        actionLabel: 'שחזר',
        onAction: () => run(() => onAdd({ action, ...(site && { site }), performedAt, confirm: true })),
      });
    });

  return (
    <div className="space-y-2 p-3 pb-24">
      {error && <StateMessage tone="error">{error.message}</StateMessage>}
      {lookups.catalog.march.map((category) => (
        <MarchSection
          key={category.code}
          category={category}
          treatments={casualty.treatments.filter((t) => t.category === category.code)}
          alerts={casualty.alerts.filter((a) => a.march === category.code)}
          onChoose={choose}
          onRemove={remove}
          busy={busy}
        />
      ))}
      {sheet && (
        <TreatmentSheet
          key={`${sheet.action.code}-${sheet.warnings?.length || 0}`}
          action={sheet.action}
          initialSite={sheet.site}
          warnings={sheet.warnings}
          busy={busy}
          onConfirm={confirmFromSheet}
          onClose={() => setSheet(null)}
        />
      )}
    </div>
  );
}
