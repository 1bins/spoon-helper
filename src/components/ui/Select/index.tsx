'use client';

import styles from './select.module.scss';
import classnames from 'classnames/bind';
import Button from "@/components/ui/Button";
import {useEffect, useRef, useState} from "react";
import { IoMdArrowDropdownCircle } from "react-icons/io";

const cx =  classnames.bind(styles);

type OptionItem = { label: string; value: string };

interface SelectProps {
  options: OptionItem[];
  placeholder?: string;
  className?: string;
  // Controlled
  value: string;
  onChange: (value: string) => void;
}

const Select = ({
  options,
  placeholder,
  className,
  value,
  onChange
}: SelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  // const isControlled = value !== undefined && onChange !== undefined; // true면 부모에서 상태 관리

  const wrapperRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

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
          onClick={() => alert('데이터가 없습니다.')} // TODO:: toast
        >
          <span className={cx('placeholder')}>데이터 없음</span>
        </Button>
      </div>
    )
  }

  return(
    <div
      ref={wrapperRef}
      className={cx('container', className)}
    >
      <Button
        ref={btnRef}
        className={cx('select')}
        onClick={() => setIsOpen(!isOpen)}
        icon={<IoMdArrowDropdownCircle size={17} />}
        active={isOpen}
      >
        {value || <span className={cx('placeholder')}>{placeholder}</span>}
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
                onClick={() => handleClickOption(option.label)}
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