import React, { useEffect } from 'react';
import { useAvoidToast } from '../../context/ToastContext';

/** Panel that slides up from the bottom (thumb reach); centred dialog on wide screens. */
export default function BottomSheet({ title, subtitle, onClose, children }) {
  useAvoidToast();
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/50" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-white px-4 pb-6 pt-3"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-gray-300" />
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-extrabold">{title}</h2>
            {subtitle && <p className="mt-0.5 text-sm text-gray-500">{subtitle}</p>}
          </div>
          <button type="button" onClick={onClose} aria-label="סגור" className="h-10 w-10 text-3xl leading-none text-gray-400">
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
