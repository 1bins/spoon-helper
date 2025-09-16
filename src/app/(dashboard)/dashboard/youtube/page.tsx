'use client';

import styles from './youtube.module.scss';
import classnames from 'classnames/bind';
import Box from "@/components/ui/Box";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Loader from "@/components/ui/Loader";
import { useCallback, useMemo, useState } from "react";
import CustomDatePicker from "@/components/ui/CustomDatePicker";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { addMonths, min } from "date-fns";

const cx = classnames.bind(styles);

type RowItem = {
  videoId: string;
  title: string;
  url: string;
  thumbnail: string;
  publishedAt: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  isShort: boolean;
};

type ReportStats = {
  totalVideos: number;
  sumViews: number;
  sumLikes: number;
  sumComments: number;
  avgViews: number;
  avgLikes: number;
  avgComments: number;
};

const useKRFmt = () => {
  const dateFmt = useMemo(
    () => new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'numeric', day: 'numeric' }),
    []
  );
  const timeFmt = useMemo(
    () => new Intl.DateTimeFormat('ko-KR', { hour: 'numeric', minute: 'numeric', hour12: false }),
    []
  );
  const numFmt = useMemo(() => new Intl.NumberFormat('ko-KR'), []);
  const numFmtPoint = useMemo(() => new Intl.NumberFormat('ko-KR', { maximumFractionDigits: 1 }), []);
  return { dateFmt, timeFmt, numFmt, numFmtPoint };
};

/** ── FormField ─────────────────────────── */
const FormField = ({ onSearch }: { onSearch: (params: { input: string; start: Date; end: Date; option: string }) => void }) => {
  const options = [
    { label: '전체', value: 'all' },
    { label: '숏폼', value: 'short' },
    { label: '롱폼', value: 'long' },
  ];

  const [url, setUrl] = useState('');
  const [option, setOption] = useState('all');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const handleSubmit = useCallback(() => {
    if (!url || !['@', 'user/', 'channel/'].some(k => url.includes(k))) {
      // TODO: alert → 토스트로 전환 (UX), 비동기 로깅(Sentry)도 고려
      alert('정확한 채널 주소를 입력해주세요 \n예) @스푼, user/spoon, channel/spoon');
      return;
    }
    if (!startDate) {
      alert('업로드 기간 시작일을 설정해주세요');
      return;
    }
    if (!endDate) {
      alert('업로드 기간 종료일을 지정해주세요');
      return;
    }
    if (startDate > endDate) {
      alert('시작일이 종료일보다 클 수 없습니다');
      return;
    }

    onSearch({ input: url, start: startDate, end: endDate, option: option || 'all' });
  }, [url, option, startDate, endDate, onSearch]);

  const inputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  }

  return (
    <Card className={cx('form-wrp')}>
      <div className={cx('form-box', 'upper')}>
        <Input
          className={cx('input', 'input-address')}
          value={url}
          onChange={setUrl}
          onKeyDown={inputKeyDown}
          placeholder="youtube.com/ 뒤의 주소 (예: @스푼, user/spoon, channel/spoon)"
        />
        <Select options={options} placeholder="영상 구분" value={option} onChange={setOption} />
      </div>
      <div className={cx('form-box', 'lower')}>
        <CustomDatePicker
          placeholder="업로드 기간 시작일"
          value={startDate}
          onChange={setStartDate}
          {...(endDate && { minDate: addMonths(endDate, -3) })}
          maxDate={endDate || new Date()}
        />
        <CustomDatePicker
          placeholder="업로드 기간 종료일"
          value={endDate}
          onChange={setEndDate}
          {...(startDate && { minDate: startDate })}
          maxDate={startDate ? min([addMonths(startDate, 3), new Date()]) : new Date()}
        />
        <Button className={cx('btn-search')} onClick={handleSubmit} round>
          검색하기
        </Button>
      </div>
    </Card>
  );
};

/** ── TableItem (rows 1개씩) ─────────────────────────── */
const TableItem = ({ row, index }: { row: RowItem; index: number }) => {
  const { dateFmt, timeFmt, numFmt } = useKRFmt();

  return (
    <tr>
      <td>{index + 1}</td>
      <td>
        <div className={cx('img-box')}>
          {row.thumbnail ?
            <a href={row.thumbnail} download={`${row.videoId}.jpg`} target={"_blank"}>
              <img src={row.thumbnail} alt={row.title} />
            </a>
            : '-'
          }
        </div>
      </td>
      <td>
        <p className={cx('video-type', row.isShort ? 'short' : 'long')}>
          {row.isShort ? '숏폼' : '롱폼'}
        </p>
      </td>
      <td>
        <Link href={row.url} target="_blank" className={cx('title')}>
          {row.title}
        </Link>
      </td>
      <td>
        <p className={cx('date')}>
          <span>{dateFmt.format(new Date(row.publishedAt))}</span>
          <span>{timeFmt.format(new Date(row.publishedAt))}</span>
        </p>
      </td>
      <td>{numFmt.format(row.viewCount)}</td>
      <td>{numFmt.format(row.likeCount)}</td>
      <td>{numFmt.format(row.commentCount)}</td>
    </tr>
  );
};

/** ── TableField ─────────────────────────── */
const TableField = ({ rows }: { rows: RowItem[] }) => {
  return (
    <Card className={cx('table-wrp')}>
      <table>
        <thead>
          <tr>
            <th>No.</th>
            <th>썸네일</th>
            <th>구분</th>
            <th>영상 제목</th>
            <th>업로드 날짜</th>
            <th>조회 수</th>
            <th>좋아요 수</th>
            <th>댓글 수</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr className={cx('none-item')}>
              <td colSpan={8}>검색 결과가 없습니다.</td>
            </tr>
          ) : (
            rows.map((r, i) => <TableItem key={r.videoId || i} row={r} index={i} />)
          )}
        </tbody>
      </table>
    </Card>
  );
};

const TableReport = ({ stats }: { stats: ReportStats }) => {
  const { numFmt, numFmtPoint } = useKRFmt();
  const {
      totalVideos, sumViews, sumLikes, sumComments,
      avgViews, avgLikes, avgComments
  } = stats;

  return(
    <Card className={cx('report-wrp')}>
      <div className={cx('title-box')}>
        <p>종합 결과 리포트</p>
      </div>
      <div className={cx('list-box')}>
        <dl className={cx('--mb')}>
          <dt>총 영상 수</dt>
          <dd>{numFmt.format(totalVideos)}</dd>
        </dl>

        <dl>
          <dt>총 조회 수</dt>
          <dd>{numFmt.format(sumViews)}</dd>
        </dl>
        <dl>
          <dt>총 좋아요 수</dt>
          <dd>{numFmt.format(sumLikes)}</dd>
        </dl>
        <dl className={cx('--mb')}>
          <dt>총 댓글 수</dt>
          <dd>{numFmt.format(sumComments)}</dd>
        </dl>

        <dl>
          <dt>조회 수 평균</dt>
          <dd>{numFmtPoint.format(avgViews)}</dd>
        </dl>
        <dl>
          <dt>좋아요 수 평균</dt>
          <dd>{numFmtPoint.format(avgLikes)}</dd>
        </dl>
        <dl>
          <dt>댓글 수 평균</dt>
          <dd>{numFmtPoint.format(avgComments)}</dd>
        </dl>
      </div>
    </Card>
  )
}

/** ── Page (실제 API 호출 붙이기) ─────────────────────────── */
export default function Page() {
  const [rows, setRows] = useState<RowItem[]>([]);
  const [loading, setLoading] = useState(false);

  const stats = useMemo<ReportStats>(() => {
    const total = rows.length;
    let sumViews = 0, sumLikes = 0, sumComments = 0;

    for (const r of rows) {
      sumViews += Number(r.viewCount ?? 0);
      sumLikes += Number(r.likeCount ?? 0);
      sumComments += Number(r.commentCount ?? 0);
    }

    return {
      totalVideos: total,
      sumViews,
      sumLikes,
      sumComments,
      avgViews: total ? sumViews / total : 0,
      avgLikes: total ? sumLikes / total : 0,
      avgComments: total ? sumComments / total : 0,
    };
  }, [rows]);

  const handleSearch = async ({
    input, start, end, option
  }: {
    input: string;
    start: Date;
    end: Date;
    option: string
  }) => {
    setLoading(true);
    try {
      // 1) 채널 ID 조회
      const resolveQs = new URLSearchParams({ input }).toString();
      const res1 = await fetch(`/api/youtube/channelId?${resolveQs}`);
      const data1 = await res1.json();
      if (!res1.ok) throw new Error(data1.error || 'resolve 실패');

      // 2) 기간 내 업로드 영상 리스트
      const listQs = new URLSearchParams({
        channelId: data1.channelId,
        start: start.toISOString(),
        end: end.toISOString(),
      }).toString();
      const res2 = await fetch(`/api/youtube/list?${listQs}`);
      const data2 = await res2.json();
      if (!res2.ok) throw new Error(data2.error || 'list API 실패');
      // data2.items = [{ videoId, publishedAt }, ...]

      const videoIds: string[] = data2.items.map((it: { videoId: string }) => it.videoId);

      const res3 = await fetch('/api/youtube/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: videoIds }),
      });
      const data3: {
        total: number;
        items: Array<{
          videoId: string;
          title: string;
          url: string;
          thumbnail: string;
          publishedAt: string;
          viewCount: number;
          likeCount: number;
          commentCount: number;
          durationSeconds: number;
          isShort: boolean;
        }>;
        error?: string;
      } = await res3.json();

      if (!res3.ok) throw new Error(data3.error || 'videos API 실패');

      // ▶ 옵션 필터 적용 (클라이언트)
      const filtered = data3.items.filter((v: { isShort: boolean }) => {
        if (option === 'short') return v.isShort === true;   // 3분 미만
        if (option === 'long')  return v.isShort === false;  // 3분 이상
        return true; // 'all'
      });

      setRows(
        filtered.map(v => ({
          videoId: v.videoId,
          title: v.title,
          url: v.url,
          thumbnail: v.thumbnail,
          publishedAt: v.publishedAt,
          viewCount: v.viewCount,
          likeCount: v.likeCount,
          commentCount: v.commentCount,
          isShort: v.isShort,
        }))
      );

    } catch (e) {
      console.error(e);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box title="유튜브 채널 검색" className={cx('container')}>
      <FormField onSearch={handleSearch} />
      <Card className={cx('flex-box')} flexDirection={"row"}>
        <Card className={cx('table-box')}>
          {loading && <Loader />}
          {!loading && <TableField rows={rows} />}
        </Card>
        {!loading && <TableReport stats={stats} />}
      </Card>
    </Box>
  );
}
