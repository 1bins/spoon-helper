import { createContext } from "react";

export type ToastType = 'info' | 'warn' | 'success';

export interface Toast {
  id: string;
  type?: ToastType;
  title?: string;
  message: string;
  duration?: number;
};

export type ToastContextType = {
  toasts: Toast[];
  toastShow: (input: Omit<Toast, "id">) => string;
  dismiss: (id: string) => void;
  clear: () => void;
};

export const ToastContext = createContext<ToastContextType | null>(null);