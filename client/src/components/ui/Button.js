import React from 'react';
import cx from './cx';

const VARIANTS = {
  primary: 'bg-blue-700 text-white hover:bg-blue-800',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  secondary: 'bg-gray-100 text-gray-800 border border-gray-300 hover:bg-gray-200',
  success: 'bg-green-100 text-green-800 border border-green-600',
  ghost: 'text-gray-600 hover:bg-gray-100',
};

const SIZES = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2.5 text-base',
  lg: 'px-5 py-3.5 text-lg',
};

export default function Button({ variant = 'primary', size = 'md', className, type = 'button', ...props }) {
  return (
    <button
      type={type}
      className={cx(
        'rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
        VARIANTS[variant],
        SIZES[size],
        className
      )}
      {...props}
    />
  );
}
