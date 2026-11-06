import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

const ToastContext = createContext(null);
const ToastPlacementContext = createContext(() => {});
const DEFAULT_SECONDS = 5;

/**
 * One toast at a time at the bottom of the screen, with an optional action (e.g. "בטל")
 * and a visible countdown. Replaces blocking confirm() dialogs.
 */
export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [openSheets, setOpenSheets] = useState(0);
  const timerRef = useRef(null);

  const dismiss = useCallback(() => {
    clearInterval(timerRef.current);
    setToast(null);
  }, []);

  /** show({ message, actionLabel?, onAction?, seconds? }) */
  const show = useCallback((next) => {
    clearInterval(timerRef.current);
    const seconds = next.seconds ?? DEFAULT_SECONDS;
    setToast(next);
    setSecondsLeft(seconds);
    if (navigator.vibrate) navigator.vibrate(40);
    timerRef.current = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
  }, []);

  useEffect(() => {
    if (toast && secondsLeft <= 0) dismiss();
  }, [toast, secondsLeft, dismiss]);

  useEffect(() => () => clearInterval(timerRef.current), []);

  const runAction = () => {
    const action = toast.onAction;
    dismiss();
    action();
  };

  /** Sheets register while open so the toast moves to the top instead of covering their buttons. */
  const registerSheet = useCallback(() => {
    setOpenSheets((n) => n + 1);
    return () => setOpenSheets((n) => n - 1);
  }, []);

  return (
    <ToastContext.Provider value={show}>
      <ToastPlacementContext.Provider value={registerSheet}>{children}</ToastPlacementContext.Provider>
      {toast && (
        <div role="status" className={`fixed inset-x-3 ${openSheets ? 'top-3' : 'bottom-5'} z-50 mx-auto flex max-w-md items-center justify-between gap-3 rounded-2xl bg-gray-900 px-4 py-3.5 text-white shadow-xl`}>
          <span className="text-base">✓ {toast.message}</span>
          {toast.onAction && (
            <button type="button" onClick={runAction} className="whitespace-nowrap text-base font-extrabold text-blue-300">
              {toast.actionLabel} ({secondsLeft})
            </button>
          )}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const show = useContext(ToastContext);
  if (!show) throw new Error('useToast must be used inside <ToastProvider>');
  return show;
}

/** Call from a bottom sheet: keeps toasts clear of it while mounted. */
export function useAvoidToast() {
  const register = useContext(ToastPlacementContext);
  useEffect(() => register(), [register]);
}
