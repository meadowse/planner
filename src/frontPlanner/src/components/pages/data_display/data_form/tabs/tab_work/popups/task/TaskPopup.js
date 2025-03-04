import { useState } from 'react';
import { createPortal } from 'react-dom';

// Импорт компонетов
import BgFillText from '@generic/elements/text/BgFillText';
import IconButton from '@generic/elements/buttons/IcButton';

import CalendarWindow from '@generic/elements/calendar/CalendarWindow';
import UsersPopupWindow from '@generic/elements/popup/UsersPopupWindow';
import InputDataPopup from '@generic/elements/popup/InputDataPopup';

// Импорт кастомных хуков
import { useTaskForm } from '@hooks/useAddTaskForm';

// Импорт сервисов
import AddTaskService from '@services/add_task.service';

// Импорт доп.функционала
import { getDateInSpecificFormat } from '@helpers/calendar';

// Импорт стилей
import './task_popup.css';

// Постановщик
function Director() {
    const [statePopup, setStatePopup] = useState(false);
    const [director, setDirector] = useState(null);

    function onSelectDirector(user) {
        setDirector(user);
    }

    return (
        <li className="popup__content-user popup-content-item">
            <h2>Постановщик</h2>
            <div className="popup__user-inner">
                {statePopup
                    ? createPortal(
                          <UsersPopupWindow
                              additClass="add_user"
                              overlay={true}
                              statePopup={statePopup}
                              setStatePopup={setStatePopup}
                              selectUser={onSelectDirector}
                          />,
                          document.getElementById('portal')
                      )
                    : null}
                {director && Object.keys(director).length !== 0 ? (
                    <ul className="popup__director-list">
                        <li className="popup__director-list-item">
                            <BgFillText type="p" text={director.fullName} bgColor="#f1f1f1" />
                        </li>
                    </ul>
                ) : (
                    <BgFillText type="p" text="Добавить" bgColor="#f1f1f1" />
                )}
                <IconButton nameClass="icon-btn__add-director" icon="plus_gr.svg" onClick={() => setStatePopup(true)} />
            </div>
        </li>
    );
}

// Исполнитель
function Executor() {
    const [statePopup, setStatePopup] = useState(false);
    const [executor, setExecutor] = useState(null);

    function onSelectExecutor(user) {
        setExecutor(user);
    }

    return (
        <li className="popup__content-user popup-content-item">
            <h2>Постановщик</h2>
            <div className="popup__user-inner">
                {statePopup
                    ? createPortal(
                          <UsersPopupWindow
                              additClass="add_user"
                              overlay={true}
                              statePopup={statePopup}
                              setStatePopup={setStatePopup}
                              selectUser={onSelectExecutor}
                          />,
                          document.getElementById('portal')
                      )
                    : null}
                {executor && Object.keys(executor).length !== 0 ? (
                    <ul className="popup__executor-list">
                        <li className="popup__executor-list-item">
                            <BgFillText type="p" text={executor.fullName} bgColor="#f1f1f1" />
                        </li>
                    </ul>
                ) : (
                    <BgFillText type="p" text="Добавить" bgColor="#f1f1f1" />
                )}
                <IconButton nameClass="icon-btn__add-executor" icon="plus_gr.svg" onClick={() => setStatePopup(true)} />
            </div>
        </li>
    );
}

// Завершенность
function Completeness() {
    const [checked, setChecked] = useState(false);

    function onChange() {
        setChecked(!checked);
    }

    return (
        <li className="popup__content-completeness popup-content-item">
            <h2>Завершено</h2>
            <div className="popup__checkbox-wrapper">
                <input className="popup__inpt-checkbox" type="checkbox" onChange={() => onChange()} />
                <span className="popup__custom-checkbox"></span>
            </div>
        </li>
    );
}

// Задача
function Task() {
    return (
        <>
            <h2>Задача</h2>
            <textarea className="popup__task txt-area" name="title-task"></textarea>
        </>
    );
    // return (
    //     <li className="popup__content-task popup-content-item">
    //         <h2>Задача</h2>
    //         <textarea className="txt-area" name="title-task"></textarea>
    //     </li>
    // );
}

// Дедлайн
function DeadlineTask(props) {
    let dateYYYYMMDD;

    const [calendarState, setCalendarState] = useState(false);
    const [deadline, setDeadline] = useState();

    function onChangeDeadline(e) {
        setDeadline(e.target.value);
    }

    function onSelectDeadline(date) {
        dateYYYYMMDD = getDateInSpecificFormat(new Date(date.getFullYear(), date.getMonth(), date.getDate()), {
            format: 'YYYYMMDD',
            separator: '-'
        });
        setDeadline(dateYYYYMMDD);
    }

    // function onDeleteSelectedDate() {
    //     setDeadline(dateDDMMYY);
    //     onClick('Deadline', null);
    // }

    return (
        <li className="popup__content-deadline popup-content-item">
            <h2>Дедлайн</h2>
            <div className="popup__deadline">
                <input
                    className="tab-general-row__input"
                    type="text"
                    value={deadline}
                    // disabled={disabledElem}
                    onChange={onChangeDeadline}
                />
                <IconButton
                    nameClass="tab-general-row__ic-btn icon-btn"
                    type="button"
                    icon="calendar.svg"
                    // disabled={disabledElem}
                    onClick={() => setCalendarState(true)}
                />
                {calendarState && (
                    <CalendarWindow
                        additClass="tab-general-calendar"
                        stateCalendar={calendarState}
                        setStateCalendar={setCalendarState}
                        onClickDate={onSelectDeadline}
                    />
                )}
            </div>
        </li>
    );
}

// Комментарий
// function Comment() {
//     return (
//         <li className="popup__content-comment popup-content-item">
//             <h2>Комментарий</h2>
//             <textarea className="txt-area" name="comment"></textarea>
//         </li>
//     );
// }

export default function TaskPopup(props) {
    const { title, task, additClass, addTaskState, setAddTaskState } = props;
    const { values } = useTaskForm(AddTaskService.getTaskData(task, []), []);

    return (
        <InputDataPopup
            title={title}
            additClass={additClass}
            overlay={true}
            statePopup={addTaskState}
            setStatePopup={setAddTaskState}
        >
            <div className="popup__content-add-task popup-content">
                <ul className="popup__content-add-task-left">
                    <Director />
                    <Executor />
                    {/* <Task /> */}
                    <DeadlineTask />
                    <Completeness />
                </ul>
                <div className="popup__content-add-task-right">
                    <Task />
                    {/* <Comment /> */}
                </div>
            </div>
        </InputDataPopup>
    );
}
