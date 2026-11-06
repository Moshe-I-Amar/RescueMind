/**
 * Pure clinical rules: classify vital signs and derive alerts.
 * Thresholds are trauma-oriented (field care), not general-ward ranges.
 */

/**
 * Numeric vitals input definition, shared by validation (hard limits) and clients:
 * - min/max: values outside are rejected
 * - plausible: values outside are probably typos -> client asks to confirm
 * - initial: stepper starting point when there is no previous reading
 */
const VITAL_INPUTS = {
  heartRate: { min: 0, max: 300, plausible: [25, 220], initial: 80 },
  oxygenLevel: { min: 0, max: 100, plausible: [50, 100], initial: 98 },
  systolic: { min: 0, max: 300, plausible: [40, 250], initial: 120 },
  diastolic: { min: 0, max: 200, plausible: [20, 150], initial: 80 },
  respiratoryRate: { min: 0, max: 80, plausible: [4, 60], initial: 16 },
};

/** Fields a vitals reading can carry. */
const VITAL_FIELDS = [...Object.keys(VITAL_INPUTS), 'avpu'];

const LEVEL = Object.freeze({ NORMAL: 'normal', WARNING: 'warning', CRITICAL: 'critical' });

/**
 * Each rule classifies one numeric metric. `critical`/`warning` are predicates;
 * `march` is the protocol step the alert belongs to (shown next to that step).
 * Adding a metric = adding a rule; nothing else changes (open/closed).
 */
const RULES = {
  heartRate: {
    march: 'C',
    critical: (v) => v < 50 || v > 120,
    warning: (v) => v < 60 || v > 100,
    message: (v) => `דופק חריג (${v})`,
    hint: 'בדוק דימום והלם',
  },
  oxygenLevel: {
    march: 'R',
    critical: (v) => v < 90,
    warning: (v) => v < 94,
    message: (v) => `רוויון חמצן נמוך (${v}%)`,
    hint: 'בדוק נתיב אוויר / חזה',
  },
  systolic: {
    march: 'C',
    critical: (v) => v < 90,
    warning: (v) => v < 100 || v > 160,
    message: (v) => `לחץ דם סיסטולי חריג (${v})`,
    hint: 'שקול נוזלים / מנת דם',
  },
  respiratoryRate: {
    march: 'R',
    critical: (v) => v < 8 || v > 30,
    warning: (v) => v < 12 || v > 20,
    message: (v) => `קצב נשימה חריג (${v})`,
    hint: 'בדוק נשימה וחזה',
  },
  shockIndex: {
    march: 'C',
    critical: (v) => v >= 1.0,
    warning: (v) => v >= 0.9,
    message: (v) => `חשד להלם (מדד הלם ${v})`,
    hint: 'שקול TXA / מנת דם, פינוי דחוף',
  },
};

const AVPU_LEVEL = { A: LEVEL.NORMAL, V: LEVEL.WARNING, P: LEVEL.CRITICAL, U: LEVEL.CRITICAL };

/** Minutes after which an applied tourniquet triggers each alert level. */
const TOURNIQUET_MINUTES = { warning: 60, critical: 120 };

const isNumber = (v) => typeof v === 'number' && Number.isFinite(v);

function shockIndex(vitals) {
  if (!vitals || !isNumber(vitals.heartRate) || !isNumber(vitals.systolic) || vitals.systolic <= 0) {
    return null;
  }
  return Math.round((vitals.heartRate / vitals.systolic) * 100) / 100;
}

function classify(metric, value) {
  const rule = RULES[metric];
  if (!rule || !isNumber(value)) return null;
  if (rule.critical(value)) return LEVEL.CRITICAL;
  if (rule.warning(value)) return LEVEL.WARNING;
  return LEVEL.NORMAL;
}

/** Returns { metric: level } for every metric present in `vitals` (plus derived shockIndex). */
function classifyVitals(vitals) {
  if (!vitals) return {};
  const values = { ...vitals, shockIndex: shockIndex(vitals) };
  const status = {};
  for (const metric of Object.keys(RULES)) {
    const level = classify(metric, values[metric]);
    if (level) status[metric] = level;
  }
  if (vitals.avpu) status.avpu = AVPU_LEVEL[vitals.avpu] || LEVEL.NORMAL;
  return status;
}

const alert = (level, code, march, message, hint) => ({ level, code, march, message, hint });

function vitalsAlerts(vitals) {
  if (!vitals) return [];
  const values = { ...vitals, shockIndex: shockIndex(vitals) };
  const status = classifyVitals(vitals);

  const alerts = Object.keys(RULES)
    .filter((metric) => status[metric] && status[metric] !== LEVEL.NORMAL)
    .map((metric) => {
      const rule = RULES[metric];
      return alert(status[metric], metric, rule.march, rule.message(values[metric]), rule.hint);
    });

  if (status.avpu && status.avpu !== LEVEL.NORMAL) {
    alerts.push(alert(status.avpu, 'avpu', 'H', `ירידה במצב הכרה (${vitals.avpu})`, 'בדוק נתיב אוויר, שקול פגיעת ראש'));
  }
  return alerts;
}

function tourniquetAlert(tourniquet, now) {
  if (!tourniquet) return null;
  const minutes = Math.floor((now - new Date(tourniquet.startedAt)) / 60000);
  let level = null;
  if (minutes >= TOURNIQUET_MINUTES.critical) level = LEVEL.CRITICAL;
  else if (minutes >= TOURNIQUET_MINUTES.warning) level = LEVEL.WARNING;
  if (!level) return null;
  return alert(level, 'tourniquet', 'M', `חוסם עורקים ${minutes} דקות`, 'פינוי דחוף / שקול המרה');
}

const LEVEL_RANK = { [LEVEL.CRITICAL]: 0, [LEVEL.WARNING]: 1, [LEVEL.NORMAL]: 2 };
const byLevel = (a, b) => LEVEL_RANK[a.level] - LEVEL_RANK[b.level];

module.exports = {
  VITAL_INPUTS,
  VITAL_FIELDS,
  LEVEL,
  TOURNIQUET_MINUTES,
  shockIndex,
  classifyVitals,
  vitalsAlerts,
  tourniquetAlert,
  byLevel,
};
