import { useState, useEffect } from 'react';
import { Routes, Route, useParams, useNavigate } from 'react-router-dom';
import classNames from 'classnames';

// Импорт компонетов
import IconButton from '@generic/elements/buttons/IcButton';
import Card from '@generic/elements/cards/Card';
import CalendarYYMMPopup from './popups/CalendarYYMMPopup';
import AddDeparturePopup from './popups/AddDeparturePopup';

// Импорт конфигураций
import { WEEK_DAYS, MONTHS, YEARS } from '@config/calendar.config';

// Импорт вспомогательного функционала
import { getDateFromString, getDateInSpecificFormat, getMonthDays } from '@helpers/calendar';

// Импорт стилей
import './calendar_mode.css';

// Функция для получения списка данных, даты выездов которых совпадают
// со значениями из списка monthDaysInfo
function getDataByMonth(testData, monthDaysInfo) {
    let dataByMonth = {};
    let dataByDay = [];
    let dayOfMonth = null,
        date = null;

    monthDaysInfo.some(day => {
        dayOfMonth = getDateInSpecificFormat(new Date(day?.year, day?.month, day?.number), {
            format: 'YYYYMMDD',
            separator: '-'
        });
        dataByDay = [];
        dataByDay = testData.filter(item => {
            date = getDateFromString(item?.dateOfEnding?.value);
            date = getDateInSpecificFormat(date, {
                format: 'YYYYMMDD',
                separator: '-'
            });
            return dayOfMonth === date;
        });
        if (dataByDay && dataByDay.length !== 0) dataByMonth[dayOfMonth] = dataByDay;
    });
    return dataByMonth;
}

// Календарь
function Calendar(props) {
    const { monthDaysInfo, dataByMonth, selectedDate, changeDay } = props;

    let date = null;
    let data = {};
    let week = [];

    console.log(`dataByMonth: ${JSON.stringify(dataByMonth, null, 4)}`);

    return (
        <table className="calendar__table">
            <thead className="calendar__table-thead-week">
                <tr className="calendar__table-thead-tr">
                    {Object.keys(WEEK_DAYS).map((key, ind) => (
                        <th className="calendar__table-thead-day-th" key={ind}>
                            {WEEK_DAYS[key]}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody className="calendar__table-tbody">
                {monthDaysInfo.map((item, ind) => {
                    if ((ind + 1) % 7 !== 0) week.push(item);
                    if ((ind + 1) % 7 === 0) {
                        week.push(item);
                        return (
                            <tr key={`${item?.month}-${ind}-${item?.number}`} className="calendar__table-tbody-tr">
                                {week.map((day, ind) => {
                                    if (week.length === 7) week = [];
                                    date = getDateInSpecificFormat(new Date(day.year, day.month, day.number), {
                                        format: 'YYYYMMDD',
                                        separator: '-'
                                    });
                                    return (
                                        <td
                                            key={day?.date}
                                            className={classNames('calendar__table-tbody-td', {
                                                'calendar__table-tbody-td_active':
                                                    getDateInSpecificFormat(new Date(day.year, day.month, day.number), {
                                                        format: 'YYYYMMDD',
                                                        separator: '-'
                                                    }) ===
                                                    getDateInSpecificFormat(
                                                        new Date(
                                                            selectedDate.year,
                                                            selectedDate.month,
                                                            selectedDate.number
                                                        ),
                                                        { format: 'YYYYMMDD', separator: '-' }
                                                    )
                                            })}
                                            onClick={() => changeDay(day)}
                                        >
                                            {dataByMonth.hasOwnProperty(date) && (
                                                <ul className="calendar__table-td-list">
                                                    {dataByMonth[date].map(card => {
                                                        // console.log(`calendar card: ${JSON.stringify(card, null, 4)}`);
                                                        data.title =
                                                            card?.car?.numCar?.replace(/\D/g, '') ||
                                                            card?.address ||
                                                            null;

                                                        return (
                                                            <li
                                                                key={data?.title}
                                                                className="calendar__table-td-list-item"
                                                                style={{ backgroundColor: card?.stage?.color }}
                                                            >
                                                                <span>{data?.title || 'Нет данных'}</span>
                                                            </li>
                                                        );
                                                    })}
                                                </ul>
                                            )}
                                            <p
                                                className={classNames('calendar__table-td-day', {
                                                    'calendar__table-td-day_not-curr': !day.currentMonth
                                                })}
                                            >
                                                {day.number}
                                            </p>
                                        </td>
                                    );
                                })}
                            </tr>
                        );
                    }
                })}
            </tbody>
        </table>
    );
}

// Всплывающая область с карточками
function SideSectionCards(props) {
    const {partition, selectedDate, cardsData, dataOperations, setCards, setSelectedDate, setSideSection } = props;

    function onCloseSideSection() {
        setCards([]);
        setSelectedDate('');
        setSideSection(false);
    }

    return (
        <div className="calendar__sidepanel">
            <IconButton
                nameClass="icon-btn__close-sidepanel icon-btn"
                icon="cancel_bl.svg"
                onClick={onCloseSideSection}
            />
            <div className="calendar__sidepanel-main">
                <div className="calendar__sidepanel-header">
                    <h2 className="calendar__sidepanel-title">
                        {selectedDate.number + ' ' + MONTHS[selectedDate.month] + ' ' + selectedDate.year}
                    </h2>
                    <h3 className="calendar__sidepanel-subtitle">{WEEK_DAYS[selectedDate.dayOfWeek]}</h3>
                </div>
                <div className="calendar__sidepanel-content">
                    <ul className="calendar__sidepanel-list-cards">
                        {cardsData.map(card => {
                            return (
                                <li key={card?.contractNum}>
                                    <Card partition={partition} data={card} dataOperations={dataOperations} />
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default function CalendarMode({ partition, testData, dataOperations }) {
    // console.log(`testData: ${JSON.stringify(testData, null, 4)}`);

    const [stateCalendarPopup, setStateCalendarPopup] = useState(false);
    const [stateInputPopup, setStateInputPopup] = useState(false);
    const [dayState, setDayState] = useState({ year: new Date().getFullYear(), month: new Date().getMonth() });
    const [selectedDate, setSelectedDate] = useState('');
    const [cards, setCards] = useState([]);
    const [sideSection, setSideSection] = useState(cards && cards.length !== 0);

    const navigate = useNavigate();

    // информация о днях определенного месяца
    const monthDaysInfo = getMonthDays(new Date(dayState.year, dayState.month));
    // дата в формате ГодМесяцДень
    let dateYYYYMMDD = '';
    // список карточек содержимое которых совпадает с датой выезда
    let dataByMonth = getDataByMonth(testData, monthDaysInfo);
    let state = Object.values(useParams())[0] === 'true';

    function changeLink() {
        navigate('');
    }

    function changeDay(day) {
        dateYYYYMMDD = getDateInSpecificFormat(new Date(day.year, day.month, day.number), {
            format: 'YYYYMMDD',
            separator: '-'
        });
        setSelectedDate(day);
        if (dataByMonth.hasOwnProperty(dateYYYYMMDD)) {
            setCards([...dataByMonth[dateYYYYMMDD]]);
            setSideSection([...dataByMonth[dateYYYYMMDD]].length !== 0);
        } else {
            setCards([]);
            setSideSection(false);
        }
    }

    useEffect(() => setStateInputPopup(state), [state]);
    useEffect(() => setSideSection(false), [testData]);

    return (
        <div className="calendar">
            <IconButton
                nameClass="icon-btn__select-date icon-btn"
                text={`${dayState.year} ${String.fromCharCode(8212)} ${MONTHS[dayState.month]}`}
                icon="arrow_down_gr.svg"
                onClick={() => setStateCalendarPopup(true)}
            />
            <div className={classNames('calendar__main', { 'calendar__main_sidepanel': sideSection })}>
                <Calendar
                    monthDaysInfo={monthDaysInfo}
                    dataByMonth={dataByMonth}
                    selectedDate={selectedDate}
                    changeDay={changeDay}
                />
                {sideSection && (
                    <SideSectionCards
                        partition={partition}
                        selectedDate={selectedDate}
                        cardsData={cards}
                        dataOperations={dataOperations}
                        setCards={setCards}
                        setSelectedDate={setSelectedDate}
                        setSideSection={setSideSection}
                    />
                )}
                {stateCalendarPopup && (
                    <CalendarYYMMPopup
                        additClass={'calendaryymm'}
                        YEARS={YEARS}
                        MONTHS={MONTHS}
                        statePopup={stateCalendarPopup}
                        setStatePopup={setStateCalendarPopup}
                        dayState={dayState}
                        setDayState={setDayState}
                    />
                )}
                <Routes>
                    <Route
                        path=":state"
                        element={
                            stateInputPopup && (
                                <AddDeparturePopup
                                    title="Выезд"
                                    additClass="add_departure"
                                    stateInputPopup={stateInputPopup}
                                    setStateInputPopup={setStateInputPopup}
                                    changeLink={changeLink}
                                />
                            )
                        }
                    />
                </Routes>
            </div>
        </div>
    );
}
