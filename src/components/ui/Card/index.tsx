import styles from './card.module.scss';
import classnames from 'classnames/bind';

const cx = classnames.bind(styles);

interface CardProps {
  className?: string;
  as?: React.ElementType;
  children: React.ReactNode;
  flexDirection?: 'column' | 'row';
  justifyCenter?: boolean;
  alignCenter?: boolean;
}

const Box = ({
  className,
  as: Component = 'div',
  children,
  flexDirection = 'column',
  justifyCenter,
  alignCenter,
}: CardProps) => {
  return(
    <Component
      className={cx('card',
        flexDirection !== 'row',
        {justifyCenter, alignCenter},
        className
      )}
    >
      {children}
    </Component>
  )
}

export default Box;