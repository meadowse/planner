import { startTransition, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Импорт конфигураций
import { MONTHS } from '@config/calendar.config';

// Импорт дополнительного функционала
import { isObject, findNestedObj } from '@helpers/helper';
import {
    getDaysBetweenTwoDates,
    getLastDayOfMonth,
    getDateFromString,
    getDateInSpecificFormat,
    getDaysInMonth,
    getDaysYear,
    getDayInYear,
    getAddedDay
} from '@helpers/calendar';

// Импорт стилей
import './timetable_mode.css';

function TimeTableHeader() {
    return (
        <div className="timetable__header">
            <h1>Шапка таблицы</h1>
        </div>
    );
}

function TimeTableContent({ timelineConfig }) {
    console.log(`timelineConfig: ${JSON.stringify(timelineConfig, null, 4)}`);
    return <div className="timetable__content">Содержимое таблицы</div>;
}

export default function TimeTableMode(props) {
    // const [timelineConfig, setTimeLineConfig] = useState({ option: 'month', year: new Date()?.getFullYaer() });

    return (
        <div class="timetable-mode">
            <TimeTableHeader />
            <TimeTableContent />
        </div>
    );
}
