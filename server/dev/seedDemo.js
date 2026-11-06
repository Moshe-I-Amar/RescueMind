/** Demo scenario for local development. Goes through the service so all rules apply. */
const minutesAgo = (m) => new Date(Date.now() - m * 60000).toISOString();

const DEMO = [
  {
    casualty: {
      priority: 'urgent',
      mechanism: 'blast',
      injuryTime: minutesAgo(52),
      injuries: [
        { type: 'bleeding', location: 'right_leg', severity: 'severe' },
        { type: 'penetrating', location: 'chest', severity: 'moderate' },
      ],
    },
    treatments: [
      { action: 'tourniquet', site: 'right_leg', performedAt: minutesAgo(47) },
      { action: 'chest_seal', site: 'right', performedAt: minutesAgo(43) },
      { action: 'iv', site: 'left_arm', performedAt: minutesAgo(40) },
    ],
    vitals: { heartRate: 128, oxygenLevel: 89, systolic: 88, diastolic: 54, respiratoryRate: 26, avpu: 'V' },
  },
  {
    casualty: {
      name: 'דנה לוי',
      priority: 'urgent',
      mechanism: 'burn',
      injuryTime: minutesAgo(18),
      injuries: [
        { type: 'burn', location: 'chest', severity: 'severe' },
        { type: 'head', location: 'head', severity: 'moderate' },
      ],
    },
    treatments: [{ action: 'hypothermia_kit', performedAt: minutesAgo(10) }],
    vitals: { heartRate: 112, oxygenLevel: 96, systolic: 118, diastolic: 76, respiratoryRate: 18, avpu: 'A' },
  },
  {
    casualty: {
      name: 'משה פרץ',
      priority: 'priority',
      mechanism: 'fall',
      injuryTime: minutesAgo(21),
      injuries: [{ type: 'fracture', location: 'left_arm', severity: 'moderate' }],
    },
    treatments: [{ action: 'ketamine', performedAt: minutesAgo(15) }],
    vitals: { heartRate: 94, oxygenLevel: 98, systolic: 126, diastolic: 80, respiratoryRate: 16, avpu: 'A' },
  },
  {
    casualty: {
      priority: 'priority',
      mechanism: 'blast',
      injuryTime: minutesAgo(9),
      injuries: [{ type: 'laceration', location: 'head', severity: 'mild' }],
    },
  },
  {
    casualty: {
      name: 'נועה בן דוד',
      priority: 'routine',
      mechanism: 'other',
      injuryTime: minutesAgo(25),
      injuries: [{ type: 'other', location: 'left_leg', severity: 'mild' }],
    },
  },
];

async function seedDemo(service) {
  for (const { casualty, treatments = [], vitals } of DEMO) {
    const { id } = await service.create(casualty);
    for (const t of treatments) await service.addTreatment(id, t);
    if (vitals) await service.addVitals(id, vitals);
  }
  console.log(`Seeded ${DEMO.length} demo casualties`);
}

module.exports = seedDemo;
