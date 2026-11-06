export const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

/**
 * Minimal JSON client for the RescueMind API.
 * Unwraps `{ status, data }` responses and throws an Error with the server message on failure.
 */
export async function request(path, { method = 'GET', body } = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  const payload = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(payload.message || `Request failed (${res.status})`);
    error.status = res.status;
    error.details = payload.details;
    throw error;
  }
  return payload.data;
}
