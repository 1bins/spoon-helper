'use client';

import styles from './input.module.scss';
import classnames from 'classnames/bind';
import {useId} from "react";

const cx = classnames.bind(styles);

type NativeInputProps = React.InputHTMLAttributes<HTMLInputElement>;

export interface InputProps extends Omit<NativeInputProps, 'type' | 'onChange'> {
  type?: 'text' | 'password' | 'number';
  label?: string;
  labelEssential?: boolean;
  onChange?: (value: string) => void;
}

const Input = ({
  type = 'text',
  id,
  value,
  name,
  label,
  labelEssential = false,
  placeholder,
  className,
  onChange,
  onKeyDown,
  disabled,
  ...rest
}: InputProps) => {
  const inputId = useId();

  return(
    <>
      {label && <label htmlFor={inputId} className={cx('label')}>
        {label}{labelEssential && <span className={cx('label-essential')}>*</span>}
      </label>}
      <input
        type={type}
        id={id || inputId}
        value={value}
        name={name}
        placeholder={placeholder}
        className={cx(
          'input',
          className,
        )}
        onChange={(e) => onChange?.(e.target.value)}
        onKeyDown={onKeyDown}
        disabled={disabled}
        {...rest}
      />
    </>
  )
}

export default Input;