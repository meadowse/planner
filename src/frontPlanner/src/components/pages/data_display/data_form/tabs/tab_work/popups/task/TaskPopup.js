import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';

// Импорт компонетов
import BgFillText from '@generic/elements/text/BgFillText';
import IconButton from '@generic/elements/buttons/IcButton';
import DropdownMenu from '@generic/elements/dropdown_menu/DropdownMenu';

import CalendarWindow from '@generic/elements/calendar/CalendarWindow';
import UsersPopupWindow from '@generic/elements/popup/UsersPopupWindow';
import InputDataPopup from '@generic/elements/popup/InputDataPopup';

// Импорт кастомных хуков
import { useTaskForm } from '@hooks/useAddTaskForm';

// Импорт сервисов
import TaskService from '@services/tab_task.service';

// Импорт доп.функционала
import { getDateInSpecificFormat } from '@helpers/calendar';

// Импорт стилей
import './task_popup.css';

// Вид работы
function TypeWork({ config, idContract, onSelect }) {
    const [typeWork, setTypeWork] = useState({});
    const [typesWork, setTypesWork] = useState([]);

    function onDeleteTypeWork() {
        setTypeWork(null);
        onSelect('typeWork', null);
    }

    function onSelectTypeWork(value) {
        setTypeWork(value);
        onSelect('typeWork', value);
    }

    // Загрузка видов работ
    async function loadData() {
        await axios
            .post(`${window.location.origin}/api/getTypesWork`, { contractId: idContract })
            .then(response => {
                if (response?.status === 200) {
                    if (response?.data && response?.data.length !== 0) {
                        const newData = response?.data?.map(item => {
                            return { typeWorkId: item?.number, title: item?.typeWork };
                        });
                        if (newData.length !== 0) setTypesWork(newData);
                    }
                }
            })
            .catch(error => {
                if (error.response) {
                    console.log('server responded');
                    setTypesWork([
                        {
                            id: 1,
                            title: 'Досудебное обследование Объекта, на соответствие градостроительным, строительным, противопожарным, санитарным нормам и правилам с подготовкой дефектной ведомости'
                        },
                        {
                            id: 2,
                            title: 'Подготовка технического плана Объекта и его электронная подача в Росреестр'
                        }
                    ]);
                } else if (error.request) {
                    console.log('network error');
                } else {
                    console.log(error);
                }
            });
    }

    useEffect(() => {
        loadData();
    }, []);

    return !config?.hidden ? (
        <li className="popup__content-type popup-content-item">
            <h2 className="popup-content-title">Вид работы</h2>
            <div className="popup__menu-wrapper">
                <DropdownMenu
                    additClass="type-work"
                    icon="arrow_down_gr.svg"
                    nameMenu="Выбрать"
                    specifiedVal={typeWork}
                    dataSource={typesWork}
                    onItemClick={onSelectTypeWork}
                />
                {typeWork && Object.keys(typeWork).length !== 0 ? (
                    <IconButton
                        nameClass="icon-btn__delete-type"
                        type="button"
                        icon="cancel.svg"
                        onClick={onDeleteTypeWork}
                    />
                ) : null}
            </div>
        </li>
    ) : null;
}

// Постановщик
function Director({ config, onSelect }) {
    const [statePopup, setStatePopup] = useState(false);
    const [director, setDirector] = useState(null);

    // Выбор пользователя
    function onSelectDirector(user) {
        setDirector(user);
        onSelect('director', user);
    }

    // Удаление пользователя
    function onDeleteDirector() {
        setDirector(null);
        onSelect('director', null);
    }

    return !config?.hidden ? (
        <li className="popup__content-user popup-content-item">
            <h2 className="popup-content-title">Постановщик</h2>
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
                    <ul className="popup__director-list popup__users-list">
                        <li className="popup__director-list-item">
                            <BgFillText type="p" text={director.fullName} bgColor="#f1f1f1" />
                        </li>
                        <li className="popup__director-list-item">
                            <IconButton
                                nameClass="icon-btn__delete-director icon-btn__delete-user"
                                type="button"
                                icon="cancel.svg"
                                onClick={onDeleteDirector}
                            />
                        </li>
                    </ul>
                ) : (
                    <BgFillText type="p" text="Добавить" bgColor="#f1f1f1" />
                )}
                <IconButton
                    nameClass="icon-btn__add-director icon-btn__add-user"
                    type="button"
                    icon="edit.svg"
                    onClick={() => setStatePopup(true)}
                />
            </div>
        </li>
    ) : null;
}

// Исполнитель
function Executor({ config, onSelect }) {
    const [statePopup, setStatePopup] = useState(false);
    const [executor, setExecutor] = useState(null);

    // Выбор пользователя
    function onSelectExecutor(user) {
        setExecutor(user);
        onSelect('executor', user);
    }

    // Удаление пользователя
    function onDeleteExecutor() {
        setExecutor(null);
        onSelect('executor', null);
    }

    return !config?.hidden ? (
        <li className="popup__content-user popup-content-item">
            <h2 className="popup-content-title">Исполнитель</h2>
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
                    <ul className="popup__executor-list popup__users-list">
                        <li className="popup__executor-list-item">
                            <BgFillText type="p" text={executor.fullName} bgColor="#f1f1f1" />
                        </li>
                        <li className="popup__executor-list-item">
                            <IconButton
                                nameClass="icon-btn__delete-executor icon-btn__delete-user"
                                type="button"
                                icon="cancel.svg"
                                onClick={onDeleteExecutor}
                            />
                        </li>
                    </ul>
                ) : (
                    <BgFillText type="p" text="Добавить" bgColor="#f1f1f1" />
                )}
                <IconButton
                    nameClass="icon-btn__add-executor icon-btn__add-user"
                    type="button"
                    icon="edit.svg"
                    onClick={() => setStatePopup(true)}
                />
            </div>
        </li>
    ) : null;
}

// Завершенность
function Completeness({ config, onSelect }) {
    const [checked, setChecked] = useState(false);

    function onChange() {
        setChecked(!checked);
    }

    return !config?.hidden ? (
        <li className="popup__content-completeness popup-content-item">
            <h2 className="popup-content-title">Завершено</h2>
            <div className="popup__checkbox-wrapper">
                <input className="popup__inpt-checkbox" type="checkbox" onChange={() => onChange()} />
                <span className="popup__custom-checkbox"></span>
            </div>
        </li>
    ) : null;
}

// Задача
function TaskName({ config, onChange }) {
    const [taskName, setTaskName] = useState('');

    function onChangeTaskName(e) {
        setTaskName(e.target.value);
        onChange(e);
    }

    return !config?.hidden ? (
        <li className="popup__content-task popup-content-item">
            <h2 className="popup-content-title">Задача</h2>
            <textarea
                className="popup__task txt-area"
                name="task"
                value={taskName}
                onChange={e => onChangeTaskName(e)}
            />
        </li>
    ) : null;
}

// Дата начала
function CommencementDate({ config, onSelect }) {
    let dateYYYYMMDD;
    let currDateYYYYMMDD = getDateInSpecificFormat(new Date(), {
        format: 'YYYYMMDD',
        separator: '-'
    });

    const [calendarState, setCalendarState] = useState(false);
    const [startDate, setStartDate] = useState(currDateYYYYMMDD);

    // Удаление даты
    function onDeleteDate() {
        setStartDate('');
        onSelect('dateStart', '');
    }

    // Выбор даты
    function onSelectStartDate(date) {
        dateYYYYMMDD = getDateInSpecificFormat(new Date(date.getFullYear(), date.getMonth(), date.getDate()), {
            format: 'YYYYMMDD',
            separator: '-'
        });
        setStartDate(dateYYYYMMDD);
        onSelect('dateStart', dateYYYYMMDD);
    }

    useEffect(() => {
        onSelect('dateStart', currDateYYYYMMDD);
    }, []);

    return !config?.hidden ? (
        <li className="popup__content-start-date popup-content-item">
            <h2 className="popup-content-title">Дата начала</h2>
            <div className="popup__date-wrapper">
                <div className="popup__start-date popup-task-date">
                    <input
                        className="popup-task-date-input"
                        type="text"
                        value={startDate}
                        disabled={true}
                        // onChange={onChangeStartDate}
                    />
                    <IconButton
                        nameClass="popup-task-date-ic-btn icon-btn"
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
                            onClickDate={onSelectStartDate}
                        />
                    )}
                </div>
                {startDate ? (
                    <IconButton
                        nameClass="icon-btn__delete-date-start icon-btn__delete-date"
                        type="button"
                        icon="cancel.svg"
                        onClick={onDeleteDate}
                    />
                ) : null}
            </div>
        </li>
    ) : null;
}

// Дедлайн
function DeadlineTask({ config, onSelect }) {
    let dateYYYYMMDD;

    const [calendarState, setCalendarState] = useState(false);
    const [deadline, setDeadline] = useState();

    // Удаление даты
    function onDeleteDate() {
        setDeadline('');
        onSelect('deadlineTask', '');
    }

    // Выбор даты
    function onSelectDeadline(date) {
        dateYYYYMMDD = getDateInSpecificFormat(new Date(date.getFullYear(), date.getMonth(), date.getDate()), {
            format: 'YYYYMMDD',
            separator: '-'
        });
        setDeadline(dateYYYYMMDD);
        onSelect('deadlineTask', dateYYYYMMDD);
    }

    // function onDeleteSelectedDate() {
    //     setDeadline(dateDDMMYY);
    //     onClick('Deadline', null);
    // }

    return !config?.hidden ? (
        <li className="popup__content-deadline popup-content-item">
            <h2 className="popup-content-title">Дедлайн</h2>
            <div className="popup__date-wrapper">
                <div className="popup__deadline popup-task-date">
                    <input
                        className="popup-task-date-input"
                        type="text"
                        value={deadline}
                        disabled={true}
                        // onChange={onChangeDeadline}
                    />
                    <IconButton
                        nameClass="popup-task-date-ic-btn icon-btn"
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
                {deadline ? (
                    <IconButton
                        nameClass="icon-btn__delete-date-start icon-btn__delete-date"
                        type="button"
                        icon="cancel.svg"
                        onClick={onDeleteDate}
                    />
                ) : null}
            </div>
        </li>
    ) : null;
}

// Комментарий
function Comment({ config, onChange }) {
    const [comment, setComment] = useState('');

    function onChangeTaskName(e) {
        setComment(e.target.value);
        onChange(e);
    }

    return !config?.hidden ? (
        <li className="popup__content-comment popup-content-item">
            <h2 className="popup-content-title">Комментарий</h2>
            <textarea
                className="txt-area"
                name="comment"
                value={comment}
                onChange={e => onChangeTaskName(e)}
            ></textarea>
        </li>
    ) : null;
}

export default function TaskPopup(props) {
    const { additClass, title, data, operation, addTaskState, setAddTaskState } = props;
    const dataOperation = TaskService.getDataFormOperation(operation);

    const { values, onChange, onClick } = useTaskForm(
        TaskService.getTaskData(data?.task, dataOperation?.disabledFields),
        dataOperation?.disabledFields
    );
    // const navigate = useNavigate();

    // console.log(`dataOperation: ${JSON.stringify(dataOperation, null, 4)}`);
    // console.log(`values: ${JSON.stringify(values, null, 4)}`);
    console.log(`data: ${JSON.stringify(data, null, 4)}`);

    function onOnSubmitData(e) {
        e.preventDefault();
        if (!data?.task || Object.keys(data?.task).length === 0) {
            const resultData = {
                typeWorkId: values?.typeWork?.id,
                contractId: data?.idContract,
                directorId: values?.director?.id,
                executorId: values?.executor?.id,
                dateStart: values?.dateStart,
                deadline: values?.deadlineTask,
                task: values?.task,
                comment: values?.comment
            };
            axios
                .post(`${window.location.origin}/api/addTask`, resultData)
                .then(response => {
                    if (response.status === 200) setAddTaskState(false);
                })
                .catch(error => {
                    if (error.response) {
                        console.log(error.response);
                        console.log('server responded');
                    } else if (error.request) {
                        console.log('network error');
                    } else {
                        console.log(error);
                    }
                });

            // alert(`submit data: ${JSON.stringify(resultData, null, 4)}`);
        }
    }

    return (
        <InputDataPopup
            idForm="add-task-form"
            title={title}
            additClass={additClass}
            overlay={true}
            statePopup={addTaskState}
            setStatePopup={setAddTaskState}
        >
            <form
                id="add-task-form"
                className="popup__content-add-task popup-content"
                onSubmit={e => onOnSubmitData(e)}
            >
                <ul className="popup__content-add-task-left">
                    <TypeWork
                        config={{ hidden: dataOperation?.hiddenFields?.typeWork ? true : false }}
                        idContract={data?.idContract}
                        onSelect={onClick}
                    />
                    <Director
                        config={{ hidden: dataOperation?.hiddenFields?.director ? true : false }}
                        onSelect={onClick}
                    />
                    <Executor
                        config={{ hidden: dataOperation?.hiddenFields?.executor ? true : false }}
                        onSelect={onClick}
                    />
                    <TaskName
                        config={{ hidden: dataOperation?.hiddenFields?.task ? true : false }}
                        onChange={onChange}
                    />
                    <CommencementDate
                        config={{ hidden: dataOperation?.hiddenFields?.dateStart ? true : false }}
                        onSelect={onClick}
                    />
                    <DeadlineTask
                        config={{ hidden: dataOperation?.hiddenFields?.deadlineTask ? true : false }}
                        onSelect={onClick}
                    />
                    <Completeness
                        config={{ hidden: dataOperation?.hiddenFields?.done ? true : false }}
                        onClick={null}
                    />
                </ul>
                <div className="popup__content-add-task-right">
                    <Comment
                        config={{ hidden: dataOperation?.hiddenFields?.comment ? true : false }}
                        onChange={onChange}
                    />
                </div>
            </form>
        </InputDataPopup>
    );
}
