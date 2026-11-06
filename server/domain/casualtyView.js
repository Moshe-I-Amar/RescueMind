/**
 * Pure read-model: turns a stored casualty into what clients display
 * (latest vitals, status per metric, alerts, active tourniquet).
 */
const { PRIORITIES, TOURNIQUET_ACTION } = require('./catalog');
const {
  VITAL_FIELDS,
  shockIndex,
  classifyVitals,
  vitalsAlerts,
  tourniquetAlert,
  byLevel,
} = require('./vitalsAssessment');

/** Readings returned with a casualty; older ones stay stored but are not sent. */
const VITALS_HISTORY_LIMIT = 100;

const byTime = (field) => (a, b) => new Date(a[field]) - new Date(b[field]);

/**
 * Last known value of every vital (readings may be partial, e.g. a manual SpO₂ check),
 * stamped with the time of the newest reading.
 */
function lastKnownVitals(readings) {
  if (!readings.length) return null;
  const merged = { recordedAt: readings.at(-1).recordedAt };
  for (const reading of readings) {
    for (const field of VITAL_FIELDS) {
      if (reading[field] !== undefined && reading[field] !== null) merged[field] = reading[field];
    }
  }
  return merged;
}

/** Earliest tourniquet still in place (removing a treatment = removing the tourniquet). */
function activeTourniquet(treatments) {
  const applied = treatments.filter((t) => t.action === TOURNIQUET_ACTION).sort(byTime('performedAt'));
  if (!applied.length) return null;
  const first = applied[0];
  return { startedAt: first.performedAt, site: first.site || null, count: applied.length };
}

function toCasualtyView(casualty, now = new Date()) {
  const treatments = [...(casualty.treatments || [])].sort(byTime('performedAt'));
  const vitals = [...(casualty.vitals || [])]
    .sort(byTime('recordedAt'))
    .map((reading) => ({ ...reading, status: classifyVitals(reading) }));
  const latestVitals = lastKnownVitals(vitals);
  const tourniquet = activeTourniquet(treatments);

  const alerts = [...vitalsAlerts(latestVitals), tourniquetAlert(tourniquet, now)]
    .filter(Boolean)
    .sort(byLevel);

  return {
    ...casualty,
    treatments,
    vitals: vitals.slice(-VITALS_HISTORY_LIMIT),
    latestVitals,
    shockIndex: shockIndex(latestVitals),
    vitalStatus: classifyVitals(latestVitals),
    activeTourniquet: tourniquet,
    alerts,
  };
}

/** List read-model: same as the full view without the vitals history. */
function toCasualtySummary(casualty, now) {
  const { vitals, ...summary } = toCasualtyView(casualty, now);
  return summary;
}

const PRIORITY_RANK = Object.fromEntries(PRIORITIES.map((p, i) => [p.code, i]));

/** Most urgent first; within the same priority, longest since injury first. */
function compareByUrgency(a, b) {
  return (
    PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] ||
    new Date(a.injuryTime) - new Date(b.injuryTime)
  );
}

module.exports = { toCasualtyView, toCasualtySummary, compareByUrgency, activeTourniquet };
