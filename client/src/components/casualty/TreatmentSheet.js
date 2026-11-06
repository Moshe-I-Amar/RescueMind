import React, { useState } from 'react';
import { BottomSheet, Button, ChipGroup } from '../ui';
import { useCatalog } from '../../context/CatalogContext';
import { formatClock } from '../../utils/time';

/** "When?" offsets in minutes; logging something done before opening the app keeps timers correct. */
const WHEN_OPTIONS = [
  { value: 0, label: 'עכשיו' },
  { value: 5, label: 'לפני 5 ד׳' },
  { value: 15, label: 'לפני 15 ד׳' },
  { value: 30, label: 'לפני 30 ד׳' },
];

function DuplicateWarning({ warnings, action }) {
  const { siteLabel } = useCatalog();
  return (
    <div role="alert" className="mb-3 rounded-2xl border-2 border-red-600 bg-red-50 p-3 text-red-800">
      {warnings.map((w) => (
        <div key={`${w.site}-${w.performedAt}`}>
          ⚠ <b>{action.label}{w.site ? ` על ${siteLabel(action.code, w.site)}` : ''} כבר נרשם</b> ב-{formatClock(w.performedAt)}.
        </div>
      ))}
      <div className="mt-1">לרשום שוב?</div>
    </div>
  );
}

/**
 * Details for one treatment: site (when the action needs one), when, and a duplicate
 * confirmation if the server raised one. The confirm button states exactly what will be logged.
 */
export default function TreatmentSheet({ action, initialSite, warnings, busy, onConfirm, onClose }) {
  const { siteLabel } = useCatalog();
  const [site, setSite] = useState(initialSite);
  const [minutesAgo, setMinutesAgo] = useState(0);

  const needsSite = Boolean(action.sites);
  const ready = !needsSite || site;
  const summary = [action.label, site && siteLabel(action.code, site)].filter(Boolean).join(' · ');

  return (
    <BottomSheet title={action.label} onClose={onClose}>
      {warnings?.length > 0 && <DuplicateWarning warnings={warnings} action={action} />}

      {needsSite && (
        <>
          <div className="mb-2 text-sm font-bold text-gray-700">מיקום</div>
          <div className="grid grid-cols-2 gap-2">
            {action.sites.map((s) => (
              <Button key={s.code} size="lg" variant={site === s.code ? 'primary' : 'secondary'} onClick={() => setSite(s.code)}>
                {s.label}
              </Button>
            ))}
          </div>
        </>
      )}

      <div className="mb-2 mt-4 text-sm font-bold text-gray-700">מתי?</div>
      <ChipGroup ariaLabel="מתי" size="lg" options={WHEN_OPTIONS} value={minutesAgo} onChange={setMinutesAgo} />

      <Button
        variant={warnings?.length ? 'danger' : 'primary'}
        size="lg"
        className="mt-5 w-full"
        disabled={!ready || busy}
        onClick={() => onConfirm({ site, minutesAgo })}
      >
        {ready ? `רשום ${warnings?.length ? 'שוב ' : ''}· ${summary}` : 'בחר מיקום'}
      </Button>
    </BottomSheet>
  );
}
