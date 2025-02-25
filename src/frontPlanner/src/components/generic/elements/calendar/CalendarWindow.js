import { useState } from 'react';
import Calendar from 'react-calendar';

// Импорт компонетов
import Popup from '../popup/Popup';

// Импорт стилей
import 'react-calendar/dist/Calendar.css';

export default function CalendarWindow(props) {
    const { additClass, stateCalendar, setStateCalendar, onClickDate } = props;
    const [date, setDate] = useState(new Date());

    function onSelectDate(value) {
        onClickDate(value);
        setStateCalendar(false);
    }

    return (
        <Popup
            additClass={additClass}
            statePopup={stateCalendar}
            setStatePopup={setStateCalendar}
            icon={'cancel_bl.svg'}
        >
            <Calendar onClickDay={date => onSelectDate(date)} onChange={setDate} value={date} />
        </Popup>
    );
}
