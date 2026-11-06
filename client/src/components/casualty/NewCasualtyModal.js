import React, { useState } from 'react';
import { Button, Modal, SelectField, StateMessage, TextField } from '../ui';
import { useCatalog } from '../../context/CatalogContext';
import { casualtiesApi } from '../../api/casualtiesApi';
import PriorityPicker from './PriorityPicker';
import InjuryFields, { isCompleteInjury } from './InjuryFields';

const EMPTY_INJURY = { severity: 'moderate' };

/** Fast intake: only priority is required; everything else can be completed later. */
export default function NewCasualtyModal({ onClose, onCreated }) {
  const { catalog } = useCatalog();
  const [form, setForm] = useState({ priority: 'urgent', name: '', mechanism: undefined });
  const [injury, setInjury] = useState(EMPTY_INJURY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const created = await casualtiesApi.create({
        priority: form.priority,
        ...(form.name.trim() && { name: form.name.trim() }),
        ...(form.mechanism && { mechanism: form.mechanism }),
        ...(isCompleteInjury(injury) && { injuries: [injury] }),
      });
      onCreated(created);
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <Modal title="פצוע חדש" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <div className="mb-1 text-sm text-gray-700">עדיפות</div>
          <PriorityPicker value={form.priority} onChange={set('priority')} />
        </div>
        <TextField label="שם (אופציונלי)" value={form.name} onChange={set('name')} placeholder="לא מזוהה" />
        <SelectField label="מנגנון פציעה" options={catalog.mechanisms} value={form.mechanism} onChange={set('mechanism')} />
        <div>
          <div className="mb-1 text-sm font-semibold text-gray-700">פציעה עיקרית (אופציונלי)</div>
          <InjuryFields value={injury} onChange={setInjury} />
        </div>
        {error && <StateMessage tone="error">{error}</StateMessage>}
        <Button type="submit" variant="danger" size="lg" className="w-full" disabled={saving}>
          {saving ? 'שומר…' : 'צור פצוע והתחל טיפול'}
        </Button>
      </form>
    </Modal>
  );
}
