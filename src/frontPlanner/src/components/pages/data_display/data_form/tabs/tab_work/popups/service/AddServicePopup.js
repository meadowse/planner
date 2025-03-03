import { useState } from 'react';
import { createPortal } from 'react-dom';

// Импорт компонетов
import BgFillText from '@generic/elements/text/BgFillText';
import IconButton from '@generic/elements/buttons/IcButton';

import CalendarWindow from '@generic/elements/calendar/CalendarWindow';
import UsersPopupWindow from '@generic/elements/popup/UsersPopupWindow';
import InputDataPopup from '@generic/elements/popup/InputDataPopup';

// Импорт доп.функционала
import { getDateInFormatDDMMYY } from '@helpers/calendar';

// Импорт стилей
import './add_service_popup.css';

// Исполнитель
function Executor() {
    const [statePopup, setStatePopup] = useState(false);
    const [executor, setExecutor] = useState(null);

    function onSelectExecutor(user) {
        setExecutor(user);
    }

    return (
        <li className="popup__content-executor popup-content-item">
            <h2>Исполнитель</h2>
            <div className="popup__executor-persons">
                {statePopup
                    ? createPortal(
                          <UsersPopupWindow
                              additClass="add_user"
                              statePopup={statePopup}
                              setStatePopup={setStatePopup}
                              selectUser={onSelectExecutor}
                          />,
                          document.getElementById('root')
                      )
                    : null}
                <div className="popup__content-executor">
                    {executor && Object.keys(executor).length !== 0 ? (
                        <ul className="popup__executor-list">
                            <li className="popup__executor-list-item">
                                <BgFillText type="p" text={executor.fullName} bgColor="#f1f1f1" />
                            </li>
                        </ul>
                    ) : (
                        <BgFillText type="p" text="Добавить" bgColor="#f1f1f1" />
                    )}
                </div>
                <IconButton nameClass="icon-btn__add-executor" icon="plus_gr.svg" onClick={() => setStatePopup(true)} />
            </div>
        </li>
    );
}

// Задача
function Task() {
    return (
        <li className="popup__content-name-service popup-content-item">
            <h2>Задача</h2>
            <textarea className="txt-area" name="title-task"></textarea>
        </li>
    );
}

// Сроки
function Deadlines() {
    const [deadlines, setDeadlines] = useState({ beginDeadline: '_ . _ . _', endDeadline: '_ . _ . _' });
    const [calendarOneState, setCalendarOneState] = useState(false);
    const [calendarTwoState, setCalendarTwoState] = useState(false);

    let dateDDMMYY = '';

    function setDateBegin(date) {
        dateDDMMYY = getDateInFormatDDMMYY(date.getFullYear(), date.getMonth(), date.getDate());
        setDeadlines({ beginDeadline: dateDDMMYY, endDeadline: deadlines.endDeadline });
    }

    function setDateEnd(date) {
        dateDDMMYY = getDateInFormatDDMMYY(date.getFullYear(), date.getMonth(), date.getDate());
        setDeadlines({ beginDeadline: deadlines.beginDeadline, endDeadline: dateDDMMYY });
    }

    return (
        <li className="popup__content-deadlines popup-content-item">
            <div className="popup-content-item__deadlines">
                <h2>Сроки</h2>
                <ul>
                    <li>с</li>
                    <li>по</li>
                </ul>
            </div>
            <div className="popup-content-item__deadlines-wrapper">
                <ul className="popup-content-item__list-deadlines">
                    <li className="popup-content-item__deadline-begin popup-content-item-deadline">
                        <p className="popup-content-item-deadline-val" onClick={() => setCalendarOneState(true)}>
                            {deadlines.beginDeadline}
                        </p>
                        {calendarOneState ? (
                            <CalendarWindow
                                additClass="deadline-selection-calendar"
                                stateCalendar={calendarOneState}
                                setStateCalendar={setCalendarOneState}
                                onClickDate={setDateBegin}
                            />
                        ) : null}
                    </li>
                    <li className="popup-content-item__deadline-end popup-content-item-deadline">
                        <p className="popup-content-item-deadline-val" onClick={() => setCalendarTwoState(true)}>
                            {deadlines.endDeadline}
                        </p>
                        {calendarTwoState ? (
                            <CalendarWindow
                                additClass="deadline-selection-calendar"
                                stateCalendar={calendarTwoState}
                                setStateCalendar={setCalendarTwoState}
                                onClickDate={setDateEnd}
                            />
                        ) : null}
                    </li>
                </ul>
            </div>
        </li>
    );
}

// Комментарий
function Comment() {
    return (
        <li className="popup__content-comment popup-content-item">
            <h2>Комментарий</h2>
            <textarea className="txt-area" name="comment"></textarea>
        </li>
    );
}

export default function AddServicePopup(props) {
    const { title, additClass, addServiceState, setAddServiceState } = props;

    return (
        <InputDataPopup
            title={title}
            additClass={additClass}
            overlay={true}
            statePopup={addServiceState}
            setStatePopup={setAddServiceState}
        >
            <div className="popup__content-add-service popup-content">
                <ul className="popup__content-add-service-left">
                    <Executor />
                    <Task />
                    <Deadlines />
                </ul>
                <div className="popup__content-add-service-right">
                    <Comment />
                </div>
            </div>
        </InputDataPopup>
    );
}
