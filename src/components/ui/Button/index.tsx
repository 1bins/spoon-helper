'use client';

import styles from './button.module.scss';
import classnames from 'classnames/bind';
import {forwardRef} from "react";

const cx = classnames.bind(styles);

type NativeButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

interface ButtonProps extends NativeButtonProps {
  icon?: React.ReactNode;
  iconOnly?: boolean;
  round?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      type = 'button',
      className,
      children,
      icon,
      onClick,
      iconOnly = false,
      round = false,
      ...rest
    },
    ref
  ) => {
  return(
    <button
      type={type}
      className={cx('button',
        {round, iconOnly},
        className
      )}
      onClick={onClick}
      {...rest}
    >
      {icon && <div className={cx('icon-box')}>{icon}</div>}
      {children}
    </button>
  )
});

export default Button;