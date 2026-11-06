import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { StateMessage, Tabs } from '../components/ui';
import { useCasualty } from '../hooks/useCasualties';
import useNow from '../hooks/useNow';
import CasualtyHeader from '../components/casualty/CasualtyHeader';
import VitalsTiles from '../components/casualty/VitalsTiles';
import AlertList from '../components/casualty/AlertList';
import MarchPanel from '../components/casualty/MarchPanel';
import VitalsPanel from '../components/casualty/VitalsPanel';
import DetailsPanel from '../components/casualty/DetailsPanel';

/** Tab registry: adding a tab (e.g. AI, handover) is one entry here. */
const TABS = [
  { key: 'treatment', label: 'טיפול', render: ({ casualty, actions }) => (
    <MarchPanel casualty={casualty} onAdd={actions.addTreatment} onRemove={actions.removeTreatment} />
  ) },
  { key: 'vitals', label: 'ניטור', render: ({ casualty }) => <VitalsPanel casualty={casualty} /> },
  { key: 'details', label: 'פרטים', render: ({ casualty, actions }) => (
    <DetailsPanel key={casualty.id} casualty={casualty} onUpdate={actions.update} />
  ) },
];

/** Screen C — one casualty: live status on top, MARCH treatment / monitoring / details below. */
export default function CasualtyPage() {
  const { id } = useParams();
  const { casualty, error, loading, actions } = useCasualty(id);
  const [tab, setTab] = useState(TABS[0].key);
  const now = useNow();

  if (!casualty) {
    return loading ? <StateMessage>טוען…</StateMessage> : <StateMessage tone="error">{error?.message || 'הפצוע לא נמצא'}</StateMessage>;
  }

  const active = TABS.find((t) => t.key === tab);

  return (
    <div className="min-h-screen bg-gray-100 pb-10">
      <div className="mx-auto max-w-xl">
        <CasualtyHeader casualty={casualty} now={now} onChangePriority={(priority) => actions.update({ priority })} />
        <VitalsTiles casualty={casualty} onSave={actions.addVitals} />
        <AlertList alerts={casualty.alerts} limit={1} className="px-3 pb-3" />
        <Tabs tabs={TABS} active={tab} onChange={setTab} />
        {active.render({ casualty, actions })}
      </div>
    </div>
  );
}
