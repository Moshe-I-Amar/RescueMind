import { request } from './httpClient';

const BASE = '/api/casualties';

export const casualtiesApi = {
  list: () => request(BASE),
  get: (id) => request(`${BASE}/${id}`),
  create: (data) => request(BASE, { method: 'POST', body: data }),
  update: (id, fields) => request(`${BASE}/${id}`, { method: 'PATCH', body: fields }),
  addTreatment: (id, treatment) => request(`${BASE}/${id}/treatments`, { method: 'POST', body: treatment }),
  removeTreatment: (id, treatmentId) => request(`${BASE}/${id}/treatments/${treatmentId}`, { method: 'DELETE' }),
  addVitals: (id, vitals) => request(`${BASE}/${id}/vitals`, { method: 'POST', body: vitals }),
};
