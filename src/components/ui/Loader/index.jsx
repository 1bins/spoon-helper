import styles from './loader.module.scss';
import classnames from 'classnames/bind';
import Image from "next/image";

const cx = classnames.bind(styles);

const Loader = () => {
  return(
    <div className={cx('loader')}>
      <div className={cx('img-box')}>
        <Image
          src="/images/common/spinner.gif"
          alt="로딩 스피너 이미지"
          width={150}
          height={38}
        />
      </div>
      <div className={cx('txt-box')}>
        데이터 로딩중입니다. 잠시만 기다려주세요.
      </div>
    </div>
  )
}

export default Loader;