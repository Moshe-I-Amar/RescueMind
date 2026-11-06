import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Loads data with `fetcher`, optionally re-polling every `pollMs`.
 * `mutate(promise)` applies the result of a write call (which returns the fresh resource).
 */
export default function useResource(fetcher, { pollMs } = {}) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const reload = useCallback(async () => {
    try {
      setData(await fetcherRef.current());
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    reload();
    if (!pollMs) return undefined;
    const timer = setInterval(reload, pollMs);
    return () => clearInterval(timer);
  }, [reload, pollMs, fetcher]);

  const mutate = useCallback(async (pending) => {
    try {
      const fresh = await pending;
      setData(fresh);
      setError(null);
      return fresh;
    } catch (err) {
      setError(err);
      throw err;
    }
  }, []);

  return { data, error, loading, reload, mutate };
}
