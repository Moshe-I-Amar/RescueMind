/**
 * Visual language shared by every casualty component.
 * Full Tailwind class strings live here (never built dynamically) so Tailwind can find them.
 */

export const PRIORITY_STYLES = {
  urgent: { strip: 'bg-red-600', badge: 'bg-red-600 text-white', header: 'bg-red-800', dot: 'bg-red-600' },
  priority: { strip: 'bg-amber-500', badge: 'bg-amber-500 text-white', header: 'bg-amber-600', dot: 'bg-amber-500' },
  routine: { strip: 'bg-green-600', badge: 'bg-green-600 text-white', header: 'bg-green-700', dot: 'bg-green-600' },
  expectant: { strip: 'bg-gray-500', badge: 'bg-gray-500 text-white', header: 'bg-gray-700', dot: 'bg-gray-500' },
};

export const priorityStyle = (code) => PRIORITY_STYLES[code] || PRIORITY_STYLES.routine;

/** Severity level coming from the server (`vitalStatus`, `alerts[].level`). */
export const LEVEL_TEXT = {
  critical: 'text-red-600',
  warning: 'text-amber-600',
  normal: 'text-green-700',
};

export const LEVEL_PANEL = {
  critical: 'bg-red-50 text-red-700 border-red-200',
  warning: 'bg-amber-50 text-amber-800 border-amber-200',
};

export const levelText = (level) => LEVEL_TEXT[level] || 'text-gray-800';

export const STATUS_BADGE = {
  active: 'bg-blue-100 text-blue-800',
  evacuating: 'bg-indigo-600 text-white',
  evacuated: 'bg-gray-200 text-gray-700',
};
