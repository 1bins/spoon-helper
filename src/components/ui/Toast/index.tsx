'use client';

import classnames from 'classnames/bind';
import { useEffect, useRef, useState } from 'react';
import { HiInformationCircle } from "react-icons/hi2";
import { IoIosSad } from "react-icons/io";
import { PiSmileyFill } from "react-icons/pi";
import Button from '../Button';
import styles from './toast.module.scss';
import { Toast, ToastType } from './ToastContext';
import { motion } from 'motion/react';

const cx = classnames.bind(styles);

interface ToastProps extends Toast {
  onClose: (id: string) => void;
};

const ToastItem = ({
  id,
  type = 'warn',
  title,
  message,
  duration = 3000,
  onClose
}: ToastProps) => {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startRef = useRef<number>(Date.now());
  const remainingRef = useRef<number>(duration);
  const [hovered, setHovered] = useState<boolean>(false);

  useEffect(() => {
    startTimer();
    return() => {
      clearTimer();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function startTimer() {
    clearTimer();
    startRef.current = Date.now();
    timerRef.current = setTimeout(() => onClose(id), remainingRef.current);
  }

  function clearTimer() {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
  }

  function handleMouseEnter() {
    setHovered(true);
    // 남은 시간 계산 후 타이머 정지
    const elapsed = Date.now() - startRef.current;
    remainingRef.current = Math.max(0, remainingRef.current - elapsed);
    clearTimer();
  }

  function handleMouseLeave() {
    setHovered(false);
    // 남은 시간으로 재시작
    if (remainingRef.current > 0) startTimer();
  }

  const getIconType = (type: ToastType): React.ReactNode => {
    switch(type) {
      case 'success':
        return <PiSmileyFill />;
      case 'info':
        return  <HiInformationCircle />;
      default:
      case 'warn':
        return  <IoIosSad />;
    }
  }

  return(
    <motion.div
      className={cx('toast', type)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}

      initial={{ opacity: 0, y: 10,  scale: 0.9, rotateX: 12, transformPerspective: 600, filter: 'blur(1px)' }}
      animate={{ opacity: 1, y: 0,  scale: 1, rotateX: 0, filter: 'blur(0px)', transition: { duration: 0.46, ease: [0.2, 0.8, 0.2, 1] } }}
      exit={{ opacity: 0, y: -180, rotateX: 5, scale: 0.96, filter: 'blur(1px)', transition: { duration: 0.25, ease: [0.4, 0, 1, 1] } }}
    >
      <div className={cx('icon-box')}>
        {getIconType(type)}
      </div>
      <div className={cx('cont-box')}>
        {title && <p className={cx('title')}>{title}</p>}
        <p className={cx('message')}>{message}</p>
      </div>
      <div className={cx('button-box')}>
        <Button
          className={cx('btn-close')}
          onClick={() => onClose(id)}
        >
          <span></span>
          <span></span>
        </Button>
      </div>
      {duration > 0 && (
        <div className={cx('progress-box')}>
            <span
              className={cx('track', { paused: hovered })}
              style={{animationDuration: `${duration}ms`}}
            ></span>
        </div>
      )}
    </motion.div>
  )
}

export default ToastItem;