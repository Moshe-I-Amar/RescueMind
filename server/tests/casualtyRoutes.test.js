const request = require('supertest');
const createApp = require('../createApp');
const createContainer = require('../container');

const makeApp = () => createApp(createContainer({ dataStore: 'memory' }));

describe('casualty API', () => {
  let app;
  beforeEach(() => {
    app = makeApp();
  });

  const createCasualty = (body = { priority: 'urgent' }) => request(app).post('/api/casualties').send(body);

  test('GET /api/catalog exposes the MARCH protocol', async () => {
    const res = await request(app).get('/api/catalog');
    expect(res.status).toBe(200);
    expect(res.body.data.march.map((c) => c.code)).toEqual(['M', 'A', 'R', 'C', 'H', 'MED']);
  });

  test('POST /api/casualties creates and GET returns it', async () => {
    const created = await createCasualty({ priority: 'urgent', name: 'Test', mechanism: 'blast' });
    expect(created.status).toBe(201);

    const res = await request(app).get(`/api/casualties/${created.body.data.id}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ name: 'Test', priority: 'urgent', status: 'active', number: 1 });
  });

  test('POST /api/casualties validates the priority', async () => {
    const res = await createCasualty({ priority: 'whatever' });
    expect(res.status).toBe(400);
    expect(res.body.status).toBe('error');
  });

  test('PATCH updates priority and status', async () => {
    const { id } = (await createCasualty()).body.data;
    const res = await request(app).patch(`/api/casualties/${id}`).send({ priority: 'routine', status: 'evacuating' });
    expect(res.body.data).toMatchObject({ priority: 'routine', status: 'evacuating' });
  });

  test('treatments can be added and removed', async () => {
    const { id } = (await createCasualty()).body.data;
    const added = await request(app).post(`/api/casualties/${id}/treatments`).send({ action: 'txa' });
    expect(added.status).toBe(201);
    const treatmentId = added.body.data.treatments[0].id;

    const removed = await request(app).delete(`/api/casualties/${id}/treatments/${treatmentId}`);
    expect(removed.body.data.treatments).toHaveLength(0);
  });

  test('invalid treatment -> 400', async () => {
    const { id } = (await createCasualty()).body.data;
    const res = await request(app).post(`/api/casualties/${id}/treatments`).send({ action: 'tourniquet' });
    expect(res.status).toBe(400);
  });

  test('vitals require at least one value', async () => {
    const { id } = (await createCasualty()).body.data;
    expect((await request(app).post(`/api/casualties/${id}/vitals`).send({})).status).toBe(400);
    const ok = await request(app).post(`/api/casualties/${id}/vitals`).send({ heartRate: 125, systolic: 95 });
    expect(ok.status).toBe(201);
    expect(ok.body.data.latestVitals.heartRate).toBe(125);
  });

  test('unknown casualty -> 404', async () => {
    expect((await request(app).get('/api/casualties/nope')).status).toBe(404);
  });
});

test('duplicate treatment -> 409 with warnings, then 201 when confirmed', async () => {
  const app = makeApp();
  const { id } = (await request(app).post('/api/casualties').send({ priority: 'urgent' })).body.data;
  const url = `/api/casualties/${id}/treatments`;
  await request(app).post(url).send({ action: 'txa' });

  const dup = await request(app).post(url).send({ action: 'txa' });
  expect(dup.status).toBe(409);
  expect(dup.body.details.warnings[0]).toMatchObject({ code: 'duplicate', action: 'txa' });

  expect((await request(app).post(url).send({ action: 'txa', confirm: true })).status).toBe(201);
});

test('catalog exposes vital input ranges and validation uses them', async () => {
  const app = makeApp();
  const catalog = (await request(app).get('/api/catalog')).body.data;
  expect(catalog.vitalInputs.oxygenLevel).toMatchObject({ max: 100, plausible: [50, 100] });

  const { id } = (await request(app).post('/api/casualties').send({ priority: 'urgent' })).body.data;
  expect((await request(app).post(`/api/casualties/${id}/vitals`).send({ oxygenLevel: 101 })).status).toBe(400);
});
