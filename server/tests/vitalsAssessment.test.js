const {
  shockIndex,
  classifyVitals,
  vitalsAlerts,
  tourniquetAlert,
} = require('../domain/vitalsAssessment');

describe('shockIndex', () => {
  test('is heart rate divided by systolic, rounded to 2 decimals', () => {
    expect(shockIndex({ heartRate: 128, systolic: 88 })).toBe(1.45);
  });

  test('is null when a value is missing', () => {
    expect(shockIndex({ heartRate: 100 })).toBeNull();
    expect(shockIndex(null)).toBeNull();
  });
});

describe('classifyVitals', () => {
  test('flags critical, warning and normal levels', () => {
    expect(classifyVitals({ heartRate: 128, oxygenLevel: 92, systolic: 120, avpu: 'A' })).toEqual({
      heartRate: 'critical',
      oxygenLevel: 'warning',
      systolic: 'normal',
      shockIndex: 'critical',
      avpu: 'normal',
    });
  });

  test('only classifies metrics that are present', () => {
    expect(classifyVitals({ oxygenLevel: 99 })).toEqual({ oxygenLevel: 'normal' });
  });
});

describe('vitalsAlerts', () => {
  test('returns an alert per abnormal metric including shock index and AVPU', () => {
    const codes = vitalsAlerts({ heartRate: 128, systolic: 88, oxygenLevel: 98, avpu: 'P' }).map((a) => a.code);
    expect(codes).toEqual(expect.arrayContaining(['heartRate', 'systolic', 'shockIndex', 'avpu']));
    expect(codes).not.toContain('oxygenLevel');
  });

  test('returns nothing for normal vitals', () => {
    expect(vitalsAlerts({ heartRate: 80, systolic: 120, oxygenLevel: 98, respiratoryRate: 16 })).toEqual([]);
  });
});

describe('tourniquetAlert', () => {
  const now = new Date('2026-01-01T12:00:00Z');
  const startedMinutesAgo = (m) => ({ startedAt: new Date(now - m * 60000) });

  test.each([
    [30, null],
    [60, 'warning'],
    [125, 'critical'],
  ])('after %i minutes -> %s', (minutes, level) => {
    const result = tourniquetAlert(startedMinutesAgo(minutes), now);
    expect(result ? result.level : null).toBe(level);
  });
});
