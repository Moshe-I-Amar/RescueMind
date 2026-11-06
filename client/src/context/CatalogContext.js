import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { fetchCatalog } from '../api/catalogApi';

const CatalogContext = createContext(null);

const indexByCode = (list = []) => Object.fromEntries(list.map((o) => [o.code, o]));

/** Builds O(1) label lookups from the server catalog. */
function buildLookups(catalog) {
  const lists = ['priorities', 'statuses', 'mechanisms', 'injuryTypes', 'bodyLocations', 'severities', 'avpu'];
  const byList = Object.fromEntries(lists.map((key) => [key, indexByCode(catalog[key])]));
  const actions = indexByCode(catalog.march.flatMap((category) => category.actions));

  return {
    catalog,
    /** label('priorities', 'urgent') -> 'דחוף' */
    label: (list, code) => byList[list]?.[code]?.label ?? code ?? '',
    action: (code) => actions[code],
    actionLabel: (code) => actions[code]?.label ?? code,
    siteLabel: (actionCode, site) =>
      actions[actionCode]?.sites?.find((s) => s.code === site)?.label ?? site ?? '',
  };
}

export function CatalogProvider({ children }) {
  const [catalog, setCatalog] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCatalog().then(setCatalog).catch(setError);
  }, []);

  const value = useMemo(
    () => ({ ...(catalog ? buildLookups(catalog) : {}), ready: Boolean(catalog), error }),
    [catalog, error]
  );

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  const context = useContext(CatalogContext);
  if (!context) throw new Error('useCatalog must be used inside <CatalogProvider>');
  return context;
}

/** Renders children only once the catalog is loaded (casualty screens depend on it). */
export function RequireCatalog({ children }) {
  const { ready, error } = useCatalog();
  if (error) return <div className="p-6 text-center text-red-700">לא ניתן לטעון נתוני מערכת מהשרת ({error.message})</div>;
  if (!ready) return <div className="p-6 text-center text-gray-500">טוען…</div>;
  return children;
}
