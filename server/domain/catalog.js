/**
 * Single source of truth for the clinical vocabulary used by the app.
 * The server validates against it and exposes it via GET /api/catalog,
 * so the client renders labels/options without duplicating them.
 */

const option = (code, label) => ({ code, label });

const PRIORITIES = [
  option('urgent', 'דחוף'),
  option('priority', 'עדיפות'),
  option('routine', 'שגרה'),
  option('expectant', 'צפוי'),
];

const STATUSES = [
  option('active', 'בטיפול'),
  option('evacuating', 'בפינוי'),
  option('evacuated', 'פונה'),
];

const MECHANISMS = [
  option('gunshot', 'ירי'),
  option('blast', 'פיצוץ / רסיסים'),
  option('burn', 'כוויה'),
  option('vehicle', 'תאונת רכב'),
  option('fall', 'נפילה'),
  option('other', 'אחר'),
];

const INJURY_TYPES = [
  option('bleeding', 'דימום'),
  option('burn', 'כוויה'),
  option('laceration', 'חתך'),
  option('blunt', 'חבלה קהה'),
  option('amputation', 'קטיעה'),
  option('fracture', 'שבר חשוד'),
  option('penetrating', 'חדירה / רסיס'),
  option('head', 'פגיעת ראש'),
  option('other', 'אחר'),
];

const BODY_LOCATIONS = [
  option('head', 'ראש'),
  option('neck', 'צוואר'),
  option('chest', 'חזה'),
  option('abdomen', 'בטן'),
  option('back', 'גב'),
  option('pelvis', 'אגן'),
  option('right_arm', 'יד ימין'),
  option('left_arm', 'יד שמאל'),
  option('right_leg', 'רגל ימין'),
  option('left_leg', 'רגל שמאל'),
];

const SEVERITIES = [
  option('mild', 'קל'),
  option('moderate', 'בינוני'),
  option('severe', 'קשה'),
];

const AVPU = [
  option('A', 'ער (A)'),
  option('V', 'מגיב לקול (V)'),
  option('P', 'מגיב לכאב (P)'),
  option('U', 'לא מגיב (U)'),
];

const LIMBS = BODY_LOCATIONS.filter((l) => /_(arm|leg)$/.test(l.code));
const SIDES = [option('right', 'ימין'), option('left', 'שמאל')];

/** Builds a treatment action. `sites` (optional) is the list the medic picks a site from. */
const action = (code, label, sites) => ({ code, label, ...(sites ? { sites } : {}) });

/** MARCH protocol: treatment categories in the order they must be addressed. */
const MARCH = [
  {
    code: 'M',
    label: 'דימום מסיבי',
    actions: [
      action('tourniquet', 'חוסם עורקים', LIMBS),
      action('pressure_dressing', 'חבישה לוחצת', BODY_LOCATIONS),
      action('hemostatic_packing', 'תחבושת המוסטטית', BODY_LOCATIONS),
    ],
  },
  {
    code: 'A',
    label: 'נתיב אוויר',
    actions: [
      action('airway_open', 'פתיחת נתיב אוויר'),
      action('npa', 'NPA'),
      action('recovery_position', 'תנוחת התאוששות'),
      action('cric', 'קריקוטומיה'),
    ],
  },
  {
    code: 'R',
    label: 'נשימה',
    actions: [
      action('chest_seal', 'חוסם חזה', SIDES),
      action('needle_decompression', 'ניקוז מחט', SIDES),
      action('oxygen', 'חמצן'),
    ],
  },
  {
    code: 'C',
    label: 'מחזור דם',
    actions: [
      action('iv', 'עירוי IV', LIMBS),
      action('io', 'IO'),
      action('txa', 'TXA 1g'),
      action('blood', 'מנת דם'),
      action('fluids', 'נוזלים'),
    ],
  },
  {
    code: 'H',
    label: 'היפותרמיה / ראש',
    actions: [
      action('hypothermia_kit', 'ערכת היפותרמיה'),
      action('head_elevation', 'הגבהת ראש 30°'),
    ],
  },
  {
    code: 'MED',
    label: 'תרופות',
    actions: [
      action('ketamine', 'קטמין'),
      action('fentanyl', 'פנטניל'),
      action('morphine', 'מורפין'),
      action('antibiotics', 'אנטיביוטיקה'),
    ],
  },
];

const TOURNIQUET_ACTION = 'tourniquet';

const codesOf = (list) => list.map((o) => o.code);

/** Lookup: action code -> { category, action } */
const ACTIONS_BY_CODE = Object.fromEntries(
  MARCH.flatMap((category) =>
    category.actions.map((a) => [a.code, { category: category.code, action: a }])
  )
);

module.exports = {
  PRIORITIES,
  STATUSES,
  MECHANISMS,
  INJURY_TYPES,
  BODY_LOCATIONS,
  SEVERITIES,
  AVPU,
  MARCH,
  TOURNIQUET_ACTION,
  ACTIONS_BY_CODE,
  codesOf,
};
