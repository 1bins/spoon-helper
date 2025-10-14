import Card from "@/components/ui/Card";
import Select from "@/components/ui/Select";
import { SortDir, SortKey, SortState } from "@/types/sort";
import classnames from "classnames/bind";
import styles from './SortSelect.module.scss';

const cx = classnames.bind(styles);

interface SortSelectProps {
  sort: SortState;
  onChange: (next: SortState) => void;
  disabled?: boolean;
}

export const SortSelect = (
{
  sort,
  onChange,
  disabled,
}: SortSelectProps) => {

  const sortOptions = [
    { label: '업로드 날짜 최신순', value: 'publishedAt:desc' },
    { label: '업로드 날짜 과거순', value: 'publishedAt:asc' },
    { label: '이름 오름차순', value: 'title:asc' },
    { label: '이름 내림차순', value: 'title:desc' },
    { label: '조회수 높은순', value: 'viewCount:desc' },
    { label: '조회수 낮은순', value: 'viewCount:asc' },
    { label: '좋아요수 높은순', value: 'likeCount:desc' },
    { label: '좋아요수 낮은순', value: 'likeCount:asc' },
    { label: '댓글수 높은순', value: 'commentCount:desc' },
    { label: '댓글수 낮은순', value: 'commentCount:asc' },
  ];

  const handleSortChange = (value: string) => {
    const [key, dir] = value.split(':') as [SortKey, SortDir];
    onChange({ key, dir });
  }

  return(
    <Card
      className={cx('sort-wrp')}
      flexDirection={'row'}
    >
      <Select
        className={cx('sort-select')}
        options={sortOptions}
        value={`${sort.key}:${sort.dir}`}
        placeholder={'업로드 날짜 최신순'}
        onChange={handleSortChange}
        disabled={disabled}
      />
    </Card>
  )
};