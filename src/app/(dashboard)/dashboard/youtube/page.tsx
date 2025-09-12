'use client';

import styles from './youtube.module.scss';
import classnames from 'classnames/bind';
import Box from "@/components/ui/Box";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import {useState} from "react";
import CustomDatePicker from "@/components/ui/CustomDatePicker";
import Button from "@/components/ui/Button";
import Link from "next/link";

const cx = classnames.bind(styles);

const FormField = () => {
  const options = [
    {label: '전체', value: 'all'},
    {label: '숏폼', value: 'short'},
    {label: '롱폼', value: 'long'},
  ]

  const [url, setUrl] = useState<string>('');
  const [option, setOption] = useState<string>('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  // 검색 기능
  const handleSubmit = () => {
    const isValidUrl = url && url.length >= 3 && ['@', 'user/', 'channel/'].some(keyword => url.includes(keyword));

    if (!isValidUrl) {
      alert('정확한 채널 주소를 입력해주세요 \n예) @스푼, user/spoon, channel/spoon');
      return;
    }

    if (option === '') {
      alert('영상 구분 옵션을 선택해주세요');
      return;
    }

    if (!startDate) {
      alert('업로드 기간 시작일을 설정해주세요');
      return;
    }

    if (!endDate) {
      alert('업로드 기간 종료일이 지정되지 않아 오늘 기준으로 자동 설정합니다');
      setEndDate(new Date());
      return;
    }

    if (startDate > endDate) {
      alert('업로드 기간 시작일이 종료일보다 클 수 없습니다');
      return;
    }

    console.log(url, option, startDate, endDate);
  }
  // TODO:: 시작일 설정 시 종료일 시작일+3개월 넘길 수 없게

  return(
    <Card
      className={cx('form-wrp')}
    >
      <div className={cx('form-box', 'upper')}>
        <Input
          className={cx('input', 'input-address')}
          value={url}
          onChange={setUrl}
          placeholder={"youtube.com/ 뒤의 주소를 입력해주세요 (예: @스푼 또는 user/spoon 또는 channel/spoon)"}
        />
        <Select
          options={options}
          placeholder={"영상 구분"}
          value={option}
          onChange={setOption}
        />
      </div>
      <div className={cx('form-box', 'lower')}>
        <CustomDatePicker
          placeholder={"업로드 기간 시작일"}
          value={startDate}
          onChange={setStartDate}
          maxDate={endDate || new Date()}
        />
        <CustomDatePicker
          placeholder={"업로드 기간 종료일"}
          value={endDate}
          onChange={setEndDate}
          {...(startDate && { minDate: startDate })}
          maxDate={new Date()}
        />
        <Button
          className={cx('btn-search')}
          onClick={() => handleSubmit()}
          round
          >검색하기</Button>
      </div>
    </Card>
  )
}

const TableItem = () => {
  return(
    <tr>
      <td>1</td>
      <td>
        <div className={cx('img-box')}>
          <img src="/sample.png" alt="샘플 이미지"/>
        </div>
      </td>
      <td>
        <p className={cx('video-type', 'long')}>롱폼</p>
      </td>
      <td>
        <Link href={"https://www.naver.com/"} title={"새 탭으로 열기"} target={"_blank"} className={cx('title')}>영상제목길이테스트영상제목길이테스트영상제목길이테스트영상제목길이테스트영상제목길이테스트영상제목길이테스트영상제목길이테스트영상제목길이테스트영상제목길이테스트영상제목길이테스트영상제목길이테스트</Link>
      </td>
      <td>
        <p className={cx('date')}>2025-09-09 16:30</p>
      </td>
      <td>1,280</td>
      <td>1,280</td>
      <td>1,280</td>
    </tr>
  )
}

const TableField = () => {
  return(
    <Card
      className={cx('table-wrp')}
    >
      <table>
        <thead>
          <tr>
            <th>No.</th>
            <th>썸네일 이미지</th>
            <th>구분</th>
            <th>영상 제목</th>
            <th>업로드 날짜</th>
            <th>조회 수</th>
            <th>좋아요 수</th>
            <th>댓글 수</th>
          </tr>
        </thead>
        <tbody>
          {/* TODO:: TableItem 가져오기 */}
          <TableItem />
          <tr className={cx('none-item')}>
            <td colSpan={8}>검색 결과가 없습니다. 상단 도구를 이용하여 검색해주세요.</td>
          </tr>
        </tbody>
      </table>
    </Card>
  )
}

export default function Page() {
 return(
   <Box
     title={"유튜브 채널 검색"}
     className={cx('container')}
   >
    <FormField />
    <TableField />
   </Box>
 )
}