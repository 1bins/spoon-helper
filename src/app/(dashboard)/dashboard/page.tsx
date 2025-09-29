import Box from "@/components/ui/Box";
import Card from "@/components/ui/Card";
import { menu } from "@/config/menu";
import classnames from 'classnames/bind';
import Link from 'next/link';
import { IoMdMail } from "react-icons/io";
import styles from './dashboard.module.scss';

const cx = classnames.bind(styles);

interface itemProps {
  icon: React.ReactNode;
  name: string;
  description?: string;
  url?: string;
  launched?: boolean;
  className?: string;
}

const MainItem = ({
  icon,
  name,
  description,
  url: href,
  launched = false,
  className,
}: itemProps) => {
  if(!href) {
    return (
      <Card className={cx('item', 'none')}>
        <Link
          href={'mailto: wonbinseo@spoond.co.kr'}
          className={cx('mail-link')}
        >
          <p className={cx('message')}><IoMdMail size={18} fill={'#2A6F28'}/> 추가 개발 요청하기</p>
        </Link>
      </Card>
    )
  }

  return(
    <Card className={cx('item', className)}>
      <Link
        href={`/dashboard/${href}`}
        className={cx('menu-link')}
        prefetch
      >
        <div className={cx('icon-box')}>
          {icon}
        </div>
        <div className={cx('content-box')}>
          <p className={cx('title')}>
            {name}
            {launched && <span className={cx('launched')}>🚀 NEW</span>}
          </p>
          <p className={cx('description')}>{description}</p>
        </div>
      </Link>
    </Card>
  )
}

export default function Page() {
  return(
    <Box
      className={cx('container')}
    >
      {menu.map(item => {
        const {id, icon, name, url, description, launched} = item;

        return(
          <MainItem
            key={`mainItem-${id}`}
            icon={icon}
            name={name}
            url={url}
            description={description}
            launched={launched}
            className={'youtube'}
          />
        )
      })}
    </Box>
  )
}