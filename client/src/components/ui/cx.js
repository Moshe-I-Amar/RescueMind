/** Joins truthy class names: cx('a', cond && 'b') */
const cx = (...classes) => classes.filter(Boolean).join(' ');
export default cx;
