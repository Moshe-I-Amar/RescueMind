import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChipGroup, StateMessage } from '../components/ui';
import { useCatalog } from '../context/CatalogContext';
import { useCasualtyList } from '../hooks/useCasualties';
import useNow from '../hooks/useNow';
import CasualtyCard from '../components/casualty/CasualtyCard';
import PriorityCounts from '../components/casualty/PriorityCounts';
import NewCasualtyModal from '../components/casualty/NewCasualtyModal';
import { buildCasualtyFilters, isOnScene } from '../components/casualty/casualtyFilters';

/** Screen A — every casualty on scene, most urgent first (order comes from the server). */
export default function CasualtiesPage() {
  const { catalog } = useCatalog();
  const { data: casualties, error, loading } = useCasualtyList();
  const [filter, setFilter] = useState('all');
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();
  const now = useNow();

  const filters = useMemo(() => buildCasualtyFilters(catalog.priorities), [catalog.priorities]);
  const list = casualties || [];
  const visible = list.filter(filters.find((f) => f.value === filter).test);
  const onScene = list.filter(isOnScene);
  const filterOptions = filters.map(({ test, ...f }) => ({ ...f, count: list.filter(test).length }));

  return (
    <div className="min-h-screen bg-gray-100 pb-28">
      <div className="mx-auto max-w-xl">
        <header className="flex items-center justify-between bg-blue-700 px-4 py-3 text-white">
          <h1 className="text-xl font-bold">פצועים בזירה</h1>
          <PriorityCounts casualties={onScene} />
        </header>

        <div className="overflow-x-auto px-3 py-3">
          <ChipGroup ariaLabel="סינון" options={filterOptions} value={filter} onChange={setFilter} className="flex-nowrap" />
        </div>

        {loading && !casualties && <StateMessage>טוען…</StateMessage>}
        {error && <StateMessage tone="error">לא ניתן להתחבר לשרת ({error.message})</StateMessage>}
        {casualties && !visible.length && <StateMessage>אין פצועים להצגה</StateMessage>}

        <div className="space-y-2.5 px-3">
          {visible.map((c) => (
            <CasualtyCard key={c.id} casualty={c} now={now} />
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={() => setCreating(true)}
        className="fixed bottom-6 left-6 rounded-full bg-red-600 px-6 py-4 text-lg font-bold text-white shadow-lg hover:bg-red-700"
      >
        + פצוע חדש
      </button>

      {creating && (
        <NewCasualtyModal onClose={() => setCreating(false)} onCreated={(c) => navigate(`/casualties/${c.id}`)} />
      )}
    </div>
  );
}
