import "react-datepicker/dist/react-datepicker.css";
import styles from './customDatePicker.module.scss';
import classnames from 'classnames/bind';
import DatePicker, {registerLocale} from 'react-datepicker';
import { ko } from 'date-fns/locale';
import { FcCalendar } from "react-icons/fc";

const cx =  classnames.bind(styles);
registerLocale('ko', ko);

interface CustomDatePickerProps {
  placeholder?: string;
  value?: null | Date;
  onChange?: (value: null | Date) => void;
  minDate?: Date;
  maxDate?: Date;
}

const CustomDatePicker = ({
  placeholder,
  value,
  onChange,
  minDate,
  maxDate
}: CustomDatePickerProps) => {

  return(
    <div className={cx('container')}>
      <DatePicker
        selected={value}
        onChange={date => onChange!(date)}
        dateFormat={"yyyy-MM-dd"}
        className={cx('form-date')}
        placeholderText={placeholder}
        locale={"ko"}
        showIcon
        toggleCalendarOnIconClick
        icon={<FcCalendar size={16} />}
        minDate={minDate}
        maxDate={maxDate}
      />
    </div>
  )
}

export default CustomDatePicker;