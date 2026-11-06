import { priorityStyle } from '../../theme/styles';

export const isOnScene = (c) => c.status !== 'evacuated';

/** Filter chips for the casualty list, built from the catalog priorities. */
export function buildCasualtyFilters(priorities) {
  return [
    { value: 'all', label: 'בזירה', test: isOnScene },
    ...priorities.map((p) => ({
      value: p.code,
      label: p.label,
      dotClass: priorityStyle(p.code).dot,
      test: (c) => isOnScene(c) && c.priority === p.code,
    })),
    { value: 'evacuated', label: 'פונו', test: (c) => !isOnScene(c) },
  ];
}
