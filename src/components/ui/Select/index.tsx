'use client';

import Button from "@/components/ui/Button";
import classnames from 'classnames/bind';
import { useEffect, useRef, useState } from "react";
import { IoMdArrowDropdownCircle } from "react-icons/io";
import { useToast } from '../Toast/useToast';
import styles from './select.module.scss';

const cx =  classnames.bind(styles);

type OptionItem = { label: string; value: string };

interface SelectProps {
  options: OptionItem[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  // Controlled
  label?: string;
  labelEssential?: boolean;
  value: string;
  onChange: (value: string) => void;
  errTitle?: string;
  errMessage?: string;
}

const Select = ({
  options,
  placeholder,
  className,
  disabled = false,
  label,
  labelEssential = false,
  value,
  onChange,
  errTitle,
  errMessage
}: SelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  // const isControlled = value !== undefined && onChange !== undefined; // true면 부모에서 상태 관리

  const wrapperRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const { toastShow: ts } = useToast();

  // 바깥 클릭 닫기
  useEffect(() => {
    if (!isOpen) return;
    const onDocClick = (e: MouseEvent) => {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, [isOpen])

  // 비활성화 시
  const handleSelectBox = () => {
    if (disabled) {
      ts({
        type: 'warn',
        title: errTitle ?? 'OOPS! 😒',
        message: errMessage ?? ''
      })
    } else {
      setIsOpen(!isOpen)
    }
  }

  // 옵션 선택시
  const handleClickOption = (value: string) => {
    onChange(value);
    setIsOpen(false);
  }

  // options 없을 경우
  if (options.length === 0) {
    return(
      <div className={cx('container')}>
        <Button
          className={cx('select')}
          onClick={() => alert('데이터가 없습니다.')}
        >
          <span className={cx('placeholder')}>데이터 없음</span>
        </Button>
      </div>
    )
  }

  return(
    <div
      ref={wrapperRef}
      className={cx('container', className, disabled && 'disabled')}
    >
      {
        label &&
        <p className={cx('label')}>
          {label}
          {labelEssential && <span className={cx('label-essential')}>*</span>}
        </p>
      }
      <Button
        ref={btnRef}
        className={cx('select')}
        onClick={handleSelectBox}
        icon={<IoMdArrowDropdownCircle size={17} />}
        active={isOpen}
      >
        {options.find((opt) => opt.value === value)?.label || <span className={cx('placeholder')}>{placeholder}</span>}
      </Button>

      {isOpen && (
        <ul
          ref={listRef}
          className={cx('option-list')}
          role={"listbox"}
        >
          {options?.map((option, idx) => {
            return(
              <li
                key={`option-${idx}`}
                role={"option"}
                onClick={() => handleClickOption(option.value)}
              >
                {option.label}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export default Select;