import styles from './card.module.scss';
import classnames from 'classnames/bind';
import {FlexProps as BaseFlexProps} from "@/types";

const cx = classnames.bind(styles);

interface CardProps extends BaseFlexProps {
  className?: string;
  as?: React.ElementType;
  children: React.ReactNode;
}

const Card = ({
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
        flexDirection === 'row' && 'row',
        {justifyCenter, alignCenter},
        className
      )}
    >
      {children}
    </Component>
  )
}

export default Card;