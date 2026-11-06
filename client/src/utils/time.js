const pad = (n) => String(n).padStart(2, '0');

/** 47:12 or 1:05:09 */
export function formatDuration(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return h ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

export const minutesBetween = (from, to) => Math.max(0, Math.floor((to - new Date(from)) / 60000));

/** 14:05 */
export const formatClock = (date) =>
  new Date(date).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
