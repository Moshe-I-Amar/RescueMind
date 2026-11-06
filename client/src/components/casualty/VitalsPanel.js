import React from 'react';
import VitalsHistory from './VitalsHistory';

/** Monitoring tab: reading history. Values are entered by tapping a tile at the top. */
export default function VitalsPanel({ casualty }) {
  return (
    <div className="space-y-3 p-3">
      <p className="text-center text-sm text-gray-500">לעדכון מדד — לחץ על האריח שלו למעלה</p>
      {casualty.vitals.length ? <VitalsHistory vitals={casualty.vitals} /> : <p className="text-center text-gray-500">אין מדידות עדיין</p>}
    </div>
  );
}
