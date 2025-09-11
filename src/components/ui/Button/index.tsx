import styles from './button.module.scss';
import classnames from 'classnames/bind';

const cx = classnames.bind(styles);

type NativeButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

interface ButtonProps extends NativeButtonProps {
  icon?: React.ReactNode;
  iconOnly?: boolean;
  round?: boolean;
}

const Button = ({
  type = 'button',
  className,
  children,
  onClick,
  icon,
  iconOnly = false,
  round = false,
  ...rest
}: ButtonProps) => {
  return(
    <button
      type={type}
      className={cx('button',
        {round, iconOnly},
        className
      )}
      onClick={onClick}
      {...rest}
    >
      {icon && <div className={cx('icon-box')}>{icon}</div>}
      {children}
    </button>
  )
}

export default Button;