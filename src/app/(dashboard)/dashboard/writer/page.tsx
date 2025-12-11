'use client';

import styles from './writer.module.scss';
import classnames from "classnames/bind";
import Box from "@/components/ui/Box";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { useCallback, useState } from "react";
import Button from "@/components/ui/Button";
import { RiFileCopy2Fill } from "react-icons/ri";
import { useToast } from "@/components/ui/Toast/useToast";

const cx = classnames.bind(styles);

/** ── FormField ─────────────────────────── */
const FormField = () => {
  const { toastShow: ts } = useToast();

  const [platformOption, setPlatformOption] = useState('');
  const [purposeOption, setPurposeOption] = useState('');

  const [brand, setBrand] = useState<string>('');
  const [event, setEvent] = useState<string>('');
  const [keyword, setKeyword] = useState<string>('');
  const [tone, setTone] = useState<string>('');
  const [target, setTarget] = useState<string>('');
  const [textLength, setTextLength] = useState<string>('500');
  const [emoji, setEmoji] = useState<string>('1');

  const platformOptions = [
    {label: "인스타그램", value: "인스타그램"},
    {label: "틱톡", value: "틱톡"},
    {label: "유튜브", value: "유튜브"},
    {label: "트위터", value: "트위터"},
  ]

  const purposeOptions = [
    {label: "브랜드 인지도", value: "브랜드 인지도"},
    {label: "클릭 유도", value: "클릭 유도"},
    {label: "구매 전환", value: "구매 전환"},
    {label: "이벤트 참여", value: "이벤트 참여"},
  ]

  const clampNumber = (val: string, min: number, max: number) => {
    if (val === '') return '';

    const n = Number(val);

    if (Number.isNaN(n)) return '';

    const clamped = Math.max(min, Math.min(max, n));
    return String(clamped);
  };

  const handleLength = (val: string) => {
    setTextLength(clampNumber(val, 1, 500));
  };

  const handleEmoji = (val: string) => {
    setEmoji(clampNumber(val, 0, 3));
  };

  const handleSubmit = useCallback(() => {
    // essential check
    if (brand === '') {
      ts({
        type: 'warn',
        message: '브랜드명을 입력해주세요'
      });
      return;
    }

    if (event.length < 4) {
      ts({
        type: 'warn',
        message: '정확한 이벤트 내용을 입력해주세요'
      });
      return;
    }

    if (platformOption === '') {
      ts({
        type: 'warn',
        message: '진행하실 플랫폼을 선택해주세요'
      });
      return;
    }

    if (purposeOption === '') {
      ts({
        type: 'warn',
        message: '이벤트 목표를 선택해주세요'
      });
      return;
    }

    if (textLength === '' || textLength === '0') {
      ts({
        type: 'info',
        message: '글자 수 제한을 적용하지 않아 \n500자로 자동 적용됩니다'
      })
      setTextLength('500');
    }

    if (emoji === '') {
      ts({
        type: 'info',
        message: '이모지 밀도를 적용하지 않아 기본값인 1로 자동 적용됩니다'
      })
      setEmoji('1');
    }
  }, [brand, event, platformOption, purposeOption, textLength, emoji, ts]);

  return(
    <Card className={cx('form-wrp')}>
      <div className={cx('form-box')}>
        <Input
          label={'브랜드명'}
          labelEssential={true}
          placeholder={'브랜드명을 입력해주세요'}
          value={brand}
          onChange={setBrand}
        />
      </div>
      <div className={cx('form-box', 'form-w100')}>
        <Input
          label={'이벤트 내용'}
          labelEssential={true}
          placeholder={'진행할 이벤트 내용을 작성해주세요'}
          value={event}
          onChange={setEvent}
        />
      </div>
      <div className={cx('form-box')}>
        <Select
          className={cx('select-box')}
          label={'플랫폼'}
          labelEssential={true}
          placeholder={'플랫폼을 선택해주세요'}
          options={platformOptions}
          value={platformOption}
          onChange={setPlatformOption}
        />
      </div>
      <div className={cx('form-box')}>
        <Select
          className={cx('select-box')}
          label={'목표'}
          labelEssential={true}
          placeholder={'이벤트 목표를 선택해주세요'}
          options={purposeOptions}
          value={purposeOption}
          onChange={setPurposeOption}
        />
      </div>
      <div className={cx('form-box', 'form-w100')}>
        <Input
          label={'포함해야 할 키워드'}
          placeholder={'키워드는 쉼표로 구분해주세요. 예) 바삭한 과자, 튀기지 않아 부드러운'}
          value={keyword}
          onChange={setKeyword}
        />
      </div>
      <div className={cx('form-box')}>
        <Input
          label={'톤/무드'}
          placeholder={'ex) 담백, 위트, 전문적, 세련, 따뜻함'}
          value={tone}
          onChange={setTone}
        />
      </div>
      <div className={cx('form-box')}>
        <Input
          label={'타겟(연령/성별)'}
          placeholder={'ex) 30대 여성, 중장년층, 20대 직장인 남성'}
          value={target}
          onChange={setTarget}
        />
      </div>
      <div className={cx('form-box', 'form-w33')}>
        <Input
          label={'길이(글자 수 제한)'}
          placeholder={'최대 500'}
          value={textLength}
          onChange={handleLength}
        />
        <span className={cx('input-text')}>자 이하</span>
      </div>
      <div className={cx('form-box', 'form-w33')}>
        <Input
          label={'이모지 밀도 😊❤️'}
          placeholder={'0~3'}
          value={emoji}
          onChange={handleEmoji}
        />
      </div>
      <div className={cx('form-box', 'form-w100', 'button-box')}>
        <div className={cx('button-bg')}>
          <Button
            className={cx('btn-submit')}
            round
            onClick={handleSubmit}
          >
            작성 요청하기
          </Button>
        </div>
      </div>
    </Card>
  )
}

/** ── ResultField ─────────────────────────── */
const ResultField = () => {
  return(
    <Card className={cx('result-wrp')}>
      <ResultItem/>
    </Card>
  )
}

/** ── ResultItem ─────────────────────────── */
const ResultItem = () => {
  const dummyMessage = `👶 베베쿡 이벤트!
            엄마 마음 담아 고른 우리 아이 첫 선물! 🎉
            이번엔 아이에게 선물하세요!
            어떤 베베쿡 제품을 주고 싶은지 댓글로 달면 참여 완료!
            추첨을 통해 푸짐한 선물을 드려요.

            놓치지 마세요! 😉`;

  return(
    <div className={cx('result-item-box')}>
      <div className={cx('result-item')}>
        <div className={cx('message-box')}>
          <p className={cx('txt-message')}>{dummyMessage}</p>
        </div>
        <div className={cx('button-box')}>
          <Button
            className={cx('btn-re-submit')}
            round
          >
            <RiFileCopy2Fill  fill={'#FA709A'} size={15} />
            복사하기
          </Button>
        </div>
      </div>
    </div>
  )
}


export default function Page() {
  return(
    <Box title="SNS 글 작성 도우미" className={cx('container')}>
      <Card className={cx('flex-box')} flexDirection={"row"}>
        <FormField />
        <ResultField />
      </Card>
    </Box>
  )
}