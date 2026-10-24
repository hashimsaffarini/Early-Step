import { createContext, useContext } from 'react';

export interface ToastApi {
  /** A short, temporary success message (announced politely, hides by itself). */
  success: (message: string) => void;
}

const NOOP: ToastApi = { success: () => undefined };

export const ToastContext = createContext<ToastApi>(NOOP);

/** Temporary success toasts (client revision 2026-10: no large persistent success boxes). */
export function useToast(): ToastApi {
  return useContext(ToastContext);
}
