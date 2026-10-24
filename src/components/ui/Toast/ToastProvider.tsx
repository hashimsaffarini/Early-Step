import { CircleCheck, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { ToastContext, type ToastApi } from './toastContext';

import styles from './Toast.module.css';

/** How long a toast stays on screen. */
export const TOAST_DURATION_MS = 4000;

interface ToastItem {
  id: number;
  message: string;
}

function ToastView({ toast, onClose }: { toast: ToastItem; onClose: (id: number) => void }) {
  useEffect(() => {
    const timer = window.setTimeout(() => {
      onClose(toast.id);
    }, TOAST_DURATION_MS);
    return () => {
      window.clearTimeout(timer);
    };
  }, [toast.id, onClose]);

  return (
    <li className={styles.toast}>
      <CircleCheck className={styles.icon} aria-hidden="true" />
      <span className={styles.message}>{toast.message}</span>
      <button
        type="button"
        className={styles.close}
        aria-label="إغلاق التنبيه"
        onClick={() => {
          onClose(toast.id);
        }}
      >
        <X aria-hidden="true" />
      </button>
    </li>
  );
}

/**
 * Temporary success toasts: a fixed, polite live region at the bottom of the screen (no layout
 * shift); each toast hides after a few seconds or with its close button.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(0);

  const close = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const api = useMemo<ToastApi>(
    () => ({
      success: (message) => {
        nextId.current += 1;
        const id = nextId.current;
        setToasts((current) => [...current, { id, message }]);
      },
    }),
    [],
  );

  return (
    <ToastContext value={api}>
      {children}
      <ul className={styles.region} aria-live="polite" aria-relevant="additions" data-toast-region>
        {toasts.map((toast) => (
          <ToastView key={toast.id} toast={toast} onClose={close} />
        ))}
      </ul>
    </ToastContext>
  );
}
