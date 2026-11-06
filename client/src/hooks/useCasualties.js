import { useCallback } from 'react';
import { casualtiesApi } from '../api/casualtiesApi';
import useResource from './useResource';

const POLL_MS = 5000;

export function useCasualtyList() {
  return useResource(casualtiesApi.list, { pollMs: POLL_MS });
}

/** One casualty plus its write actions; every action returns and stores the fresh casualty. */
export function useCasualty(id) {
  const fetcher = useCallback(() => casualtiesApi.get(id), [id]);
  const resource = useResource(fetcher, { pollMs: POLL_MS });
  const { mutate } = resource;

  const actions = {
    update: (fields) => mutate(casualtiesApi.update(id, fields)),
    addTreatment: (treatment) => mutate(casualtiesApi.addTreatment(id, treatment)),
    removeTreatment: (treatmentId) => mutate(casualtiesApi.removeTreatment(id, treatmentId)),
    addVitals: (vitals) => mutate(casualtiesApi.addVitals(id, vitals)),
  };

  return { ...resource, casualty: resource.data, actions };
}
