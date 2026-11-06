/** Text helpers shared by list and detail screens. */

export const casualtyTitle = (c) => `פצוע ${c.number} · ${c.name || 'לא מזוהה'}`;

/** "דימום רגל ימין · חדירה / רסיס חזה" */
export const injurySummary = (c, label) =>
  (c.injuries || [])
    .map((i) => `${label('injuryTypes', i.type)} ${label('bodyLocations', i.location)}`)
    .join(' · ');

/** "חוסם עורקים · רגל ימין" — needs the catalog lookups from useCatalog(). */
export const treatmentText = ({ action, site }, { actionLabel, siteLabel }) =>
  site ? `${actionLabel(action)} · ${siteLabel(action, site)}` : actionLabel(action);
