import { useEffect } from 'react';
import { useUIStore } from '../../store/uiStore';

const TOAST_STYLES = {
  success: 'border-emerald-100 bg-emerald-50 text-emerald-700',
  error: 'border-red-100 bg-red-50 text-red-700',
  info: 'border-indigo-100 bg-indigo-50 text-indigo-700',
} as const;

export default function ToastHost() {
  const toasts = useUIStore((state) => state.toasts);
  const removeToast = useUIStore((state) => state.removeToast);

  useEffect(() => {
    if (toasts.length === 0) return;

    const timers = toasts.map((toast) =>
      window.setTimeout(() => {
        removeToast(toast.id);
      }, 3000)
    );

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [toasts, removeToast]);

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[120] flex w-[320px] max-w-[calc(100vw-2rem)] flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto rounded-xl border px-3 py-2 text-sm shadow-card ${TOAST_STYLES[toast.type]}`}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}
