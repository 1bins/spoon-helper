'use client';

import styles from './header.module.scss';
import classnames from 'classnames/bind';
import {usePathname, useRouter} from "next/navigation";
import Button from "@/components/ui/Button";
import {menu} from "@/config/menu";
import Image from "next/image";
import Link from "next/link";

const cx = classnames.bind(styles);

interface MenuItemProps {
  icon: React.ReactNode;
  url?: string;
  active?: boolean;
}

const H1 = () => {
  return(
    <h1 className={cx('logo')}>
      <Link
        href={"/dashboard"}
        className={cx('menu-item', 'logo')}
      >
        <Image
          src="/images/common/logo-small.png"
          alt="스푼 로고"
          width={30}
          height={15}
        />
      </Link>
    </h1>
  )
}

const MenuItem = ({
  icon,
  url,
  active
}: MenuItemProps) => {
  const router = useRouter();

  if (!url) {
    return(
      <li>
        <Button
          iconOnly={true}
          icon={icon}
          onClick={() => alert('현재 페이지 준비중입니다')} // TODO:: toast 설정
          className={cx('menu-item')}
        />
      </li>
    )
  }

  const href = `/dashboard/${url.replace(/^\/+/, '')}`;

  return(
    <li>
      <Link
        href={href}
        className={cx('menu-link')}
        prefetch
      >
        <Button
          iconOnly={true}
          icon={icon}
          className={cx('menu-item', { active })}
        />
      </Link>
    </li>
  )
}

const Header = () => {
  const pathname = usePathname();

  return(
    <header>
      <div className={cx('header-wrp')}>
        <H1/>
        <nav>
          <h2 className={cx('blind')}>menu</h2>
          <ul className={cx('menu-list')}>
            {menu.map((item, idx) => {
              const segment = (item.url ?? '').replace(/^\/+/, '');
              const isActive = segment
                ? (pathname === `/dashboard/${segment}` || pathname.startsWith(`/dashboard/${segment}/`))
                : false;

              return (
                <MenuItem
                  key={item.id}
                  icon={item.icon}
                  url={item.url}
                  active={isActive}
                />
              )
            })}
          </ul>
        </nav>
      </div>
    </header>
  )
}

export default Header;