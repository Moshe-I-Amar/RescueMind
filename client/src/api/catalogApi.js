import { request } from './httpClient';

export const fetchCatalog = () => request('/api/catalog');
