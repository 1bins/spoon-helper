import styles from './box.module.scss';
import classnames from 'classnames/bind';
import {FlexProps as BaseFlexProps} from "@/types";

const cx = classnames.bind(styles);

interface BoxProps extends BaseFlexProps {
  className?: string;
  as?: React.ElementType;
  title?: string;
  children: React.ReactNode;
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
        flexDirection === 'row' && 'row',
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