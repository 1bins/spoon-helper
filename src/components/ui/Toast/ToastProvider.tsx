'use client';

import classnames from 'classnames/bind';
import { useCallback, useMemo, useState } from 'react';
import { Toast, ToastContext } from './ToastContext';
import ToastItem from './index';
import styles from './toast.module.scss';

const cx = classnames.bind(styles);

const DEFAULT_DURATION = 3000;

export const ToastProvider = ({
  children
}: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toastShow = useCallback((input: Omit<Toast, "id">) => {
    const id = crypto.randomUUID();
    const toast: Toast =
      {
        id,
        type: input.type ?? 'warn',
        message: input.message,
        title: input.title,
        duration: input.duration ?? DEFAULT_DURATION,
      };

    setToasts(prev => [...prev, toast]);
    return id;
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const clear = useCallback(() => {
    setToasts([]);
  }, []);

  const value = useMemo(
    () => ({ toasts, toastShow, dismiss, clear }),
    [toasts, toastShow, dismiss, clear]
  )

  return(
    <ToastContext.Provider value={value}>
      {children}

      <div className={cx('container')}>
        {toasts.map(t => (
        <ToastItem
          key={t.id}
          id={t.id}
          type={t.type}
          title={t.title}
          message={t.message}
          duration={t.duration}
          onClose={dismiss}
        />
      ))}
      </div>
    </ToastContext.Provider>
  )
}