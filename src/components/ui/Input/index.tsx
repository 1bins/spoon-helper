'use client';

import styles from './input.module.scss';
import classnames from 'classnames/bind';
import {useId} from "react";

const cx = classnames.bind(styles);

type NativeInputProps = React.InputHTMLAttributes<HTMLInputElement>;

export interface InputProps extends Omit<NativeInputProps, 'type'> {
  type?: 'text' | 'password' | 'number';
  label?: string;
}

const Input = ({
  type = 'text',
  id,
  value,
  name,
  placeholder,
  className,
  onChange,
  onKeyDown,
  disabled,
  ...rest
}: InputProps) => {
  const inputId = useId();

  return(
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
      onChange={onChange}
      onKeyDown={onKeyDown}
      disabled={disabled}
      {...rest}
    />
  )
}

export default Input;