import React from 'react';
import { StateMessage } from '../ui';
import { useAsyncAction } from '../../hooks/useAsyncAction';
import VitalsForm from './VitalsForm';
import VitalsHistory from './VitalsHistory';

export default function VitalsPanel({ casualty, onAdd }) {
  const { run, busy, error } = useAsyncAction();

  return (
    <div className="space-y-3 p-3">
      {error && <StateMessage tone="error">{error.message}</StateMessage>}
      <VitalsForm busy={busy} onSubmit={(vitals) => run(() => onAdd(vitals))} />
      <VitalsHistory vitals={casualty.vitals} />
    </div>
  );
}
