import classNames from 'classnames';

// Импорт компонетов
import PopupWindow from '@generic/elements/popup/Popup';

// Импорт стилей
import './calendar_yymm_popup.css';

export default function CalendarYYMMPopup(props) {
    const { additClass, YEARS, MONTHS, statePopup, setStatePopup, dayState, setDayState } = props;

    function onSetDate(date) {
        setDayState(date);
        console.log(`date = ${JSON.stringify(date, null, 4)}`);
    }

    return (
        <PopupWindow
            additClass={additClass}
            statePopup={statePopup}
            setStatePopup={setStatePopup}
            icon={'cancel_bl.svg'}
        >
            <div className="popup__calendaryymm-content">
                <ul className="popup__calendar-years">
                    {YEARS.map((year, ind) => (
                        <li
                            className={classNames(
                                'popup__calendar-years-item',
                                year === dayState.year ? 'popup__calendar-year_active' : ''
                            )}
                            key={ind}
                            onClick={() => onSetDate({ year: year, month: dayState.month })}
                        >
                            <p className="popup__calendar-year">
                                <span className="popup__calendar-year-span">{year}</span>
                                <span className="popup__calendar-year-dash-span">
                                    {year === dayState.year
                                        ? String.fromCodePoint(0x2014).concat(String.fromCodePoint(0x2014))
                                        : ''}
                                </span>
                            </p>
                        </li>
                    ))}
                </ul>
                <ul className="popup__calendar-months">
                    {MONTHS.map((month, ind) => (
                        <li
                            className={classNames(
                                'popup__calendar-month-item',
                                ind === dayState.month ? 'popup__calendar-month-item_active' : ''
                            )}
                            key={ind}
                            onClick={() => onSetDate({ year: dayState.year, month: ind })}
                        >
                            {month}
                        </li>
                    ))}
                </ul>
            </div>
            {/* <div className={classNames('popup_content', additClass)}>
                <div className={classNames('popup_container', additClass)}>
                    <ul className="years_list">
                        {YEARS.map((year, ind) => (
                            <li
                                className={classNames('year_item', year === dayState.year ? 'active' : '')}
                                key={ind}
                                onClick={() => onSetDate({ year: year, month: dayState.month })}
                            >
                                <p className="year">
                                    <span className="year_span">{year}</span>
                                    <span className="dash_span">
                                        {year === dayState.year
                                            ? String.fromCodePoint(0x2014).concat(String.fromCodePoint(0x2014))
                                            : ''}
                                    </span>
                                </p>
                            </li>
                        ))}
                    </ul>
                    <ul className="month_list">
                        {MONTHS.map((month, ind) => (
                            <li
                                className={classNames('month_item', ind === dayState.month ? 'active' : '')}
                                key={ind}
                                onClick={() => onSetDate({ year: dayState.year, month: ind })}
                            >
                                {month}
                            </li>
                        ))}
                    </ul>
                </div>
            </div> */}
        </PopupWindow>
    );
}
