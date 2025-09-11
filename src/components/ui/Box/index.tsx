import styles from './box.module.scss';
import classnames from 'classnames/bind';

const cx = classnames.bind(styles);

interface BoxProps {
  className?: string;
  as?: React.ElementType;
  title?: string;
  children: React.ReactNode;
  flexDirection?: 'column' | 'row';
  justifyCenter?: boolean;
  alignCenter?: boolean;
}

const Box = ({
  className,
  as: Component = 'section',
  title,
  children,
  flexDirection = 'column',
  justifyCenter,
  alignCenter,
}: BoxProps) => {
  return(
    <Component
      className={cx('container',
        flexDirection !== 'row',
        {justifyCenter, alignCenter},
        className
      )}
    >
      {title && <h3>{title}</h3>}
      {children}
    </Component>
  )
}

export default Box;