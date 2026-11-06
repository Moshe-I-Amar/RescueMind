const createCasualtyService = require('../services/casualtyService');
const createMemoryCasualtyRepository = require('../repositories/memoryCasualtyRepository');

const NOW = new Date('2026-01-01T12:00:00Z');
const minutesAgo = (m) => new Date(NOW - m * 60000);

const makeService = () =>
  createCasualtyService({ repository: createMemoryCasualtyRepository(), clock: () => NOW });

describe('casualtyService', () => {
  let service;
  beforeEach(() => {
    service = makeService();
  });

  test('create assigns a sequential number, active status and injury time', async () => {
    const a = await service.create({ priority: 'routine' });
    const b = await service.create({ priority: 'urgent' });
    expect([a.number, b.number]).toEqual([1, 2]);
    expect(a.status).toBe('active');
    expect(new Date(a.injuryTime)).toEqual(NOW);
  });

  test('list sorts by priority, then by time since injury', async () => {
    await service.create({ priority: 'routine', name: 'r' });
    await service.create({ priority: 'urgent', name: 'u-recent', injuryTime: minutesAgo(5) });
    await service.create({ priority: 'urgent', name: 'u-old', injuryTime: minutesAgo(30) });
    const names = (await service.list()).map((c) => c.name);
    expect(names).toEqual(['u-old', 'u-recent', 'r']);
  });

  test('list filters by status and omits vitals history', async () => {
    const c = await service.create({ priority: 'urgent' });
    await service.addVitals(c.id, { heartRate: 90 });
    await service.create({ priority: 'urgent', status: 'evacuated' });

    const active = await service.list({ status: 'active' });
    expect(active).toHaveLength(1);
    expect(active[0].vitals).toBeUndefined();
    expect(active[0].latestVitals.heartRate).toBe(90);
  });

  test('addTreatment derives the MARCH category and tracks the tourniquet', async () => {
    const c = await service.create({ priority: 'urgent' });
    const view = await service.addTreatment(c.id, {
      action: 'tourniquet',
      site: 'right_leg',
      performedAt: minutesAgo(65).toISOString(),
    });
    expect(view.treatments[0]).toMatchObject({ category: 'M', action: 'tourniquet', site: 'right_leg' });
    expect(view.activeTourniquet).toMatchObject({ site: 'right_leg', count: 1 });
    expect(view.alerts.map((a) => a.code)).toContain('tourniquet');
  });

  test.each([
    [{ action: 'unknown' }, /Unknown treatment/],
    [{ action: 'tourniquet' }, /requires a site/],
    [{ action: 'txa', site: 'left_arm' }, /does not take a site/],
    [{ action: 'tourniquet', site: 'chest' }, /Invalid site/],
  ])('addTreatment rejects %p', async (input, message) => {
    const c = await service.create({ priority: 'urgent' });
    await expect(service.addTreatment(c.id, input)).rejects.toMatchObject({ status: 400, message: expect.stringMatching(message) });
  });

  test('removeTreatment undoes a treatment', async () => {
    const c = await service.create({ priority: 'urgent' });
    const withTq = await service.addTreatment(c.id, { action: 'tourniquet', site: 'left_arm' });
    const view = await service.removeTreatment(c.id, withTq.treatments[0].id);
    expect(view.treatments).toHaveLength(0);
    expect(view.activeTourniquet).toBeNull();
  });

  test('addVitals computes status, shock index and alerts', async () => {
    const c = await service.create({ priority: 'urgent' });
    const view = await service.addVitals(c.id, { heartRate: 130, systolic: 85, oxygenLevel: 97 });
    expect(view.shockIndex).toBe(1.53);
    expect(view.vitalStatus).toMatchObject({ heartRate: 'critical', systolic: 'critical', oxygenLevel: 'normal' });
    expect(view.alerts[0].level).toBe('critical');
  });

  test('unknown casualty -> 404', async () => {
    await expect(service.get('missing')).rejects.toMatchObject({ status: 404 });
    await expect(service.update('missing', { priority: 'urgent' })).rejects.toMatchObject({ status: 404 });
  });
});

test('alerts carry their MARCH step and each reading carries its status', async () => {
  const service = makeService();
  const c = await service.create({ priority: 'urgent' });
  await service.addVitals(c.id, { oxygenLevel: 85 });
  const view = await service.addVitals(c.id, { oxygenLevel: 99 });
  expect(view.vitals.map((v) => v.status.oxygenLevel)).toEqual(['critical', 'normal']);

  const low = await service.addVitals(c.id, { oxygenLevel: 85, recordedAt: new Date(NOW.getTime() + 1000).toISOString() });
  expect(low.alerts[0]).toMatchObject({ code: 'oxygenLevel', march: 'R' });
});

test('latestVitals keeps the last known value of each metric across partial readings', async () => {
  const service = makeService();
  const c = await service.create({ priority: 'urgent' });
  await service.addVitals(c.id, { heartRate: 90, respiratoryRate: 16, avpu: 'A' });
  const view = await service.addVitals(c.id, { heartRate: 130, systolic: 100, recordedAt: new Date(NOW.getTime() + 1000).toISOString() });
  expect(view.latestVitals).toMatchObject({ heartRate: 130, systolic: 100, respiratoryRate: 16, avpu: 'A' });
  expect(view.shockIndex).toBe(1.3);
});
