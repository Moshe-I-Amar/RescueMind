/** Navigation entries shared by the desktop and mobile menus. */
const NAV_LINKS = [
  { to: '/', label: 'דף הבית' },
  { to: '/casualties', label: 'פצועים' },
  { to: '/patient-monitoring', label: 'ניטור פצועים' },
  { to: '/treatment-logs', label: 'תיעוד טיפולים' },
  { to: '/ai-recommendations', label: 'המלצות AI' },
  { to: '/hospital-integration', label: 'אינטגרציה לבית החולים' },
];

/** "/casualties/123" keeps "פצועים" highlighted; "/" only matches itself. */
export const isActiveLink = (to, pathname) =>
  to === '/' ? pathname === '/' : pathname === to || pathname.startsWith(`${to}/`);

export default NAV_LINKS;
