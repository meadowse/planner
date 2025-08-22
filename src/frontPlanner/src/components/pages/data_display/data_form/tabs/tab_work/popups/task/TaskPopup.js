import { useEffect, useReducer, useRef, useState, useContext, startTransition } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import Cookies from 'js-cookie';

// Импорт компонетов
import BgFillText from '@generic/elements/text/BgFillText';
import IconButton from '@generic/elements/buttons/IcButton';
import DropdownMenu from '@generic/elements/dropdown_menu/DropdownMenu';

import CalendarWindow from '@generic/elements/calendar/CalendarWindow';
import UsersPopupWindow from '@generic/elements/popup/UsersPopupWindow';
import InputDataPopup from '@generic/elements/popup/InputDataPopup';
import ModalWindow from '@generic/elements/popup/ModalWindow';

// Импорт контекстов
// import { SocketContext } from '../../../../../../../../contexts/socket.context';
import { useHistoryContext } from '../../../../../../../../contexts/history.context';

// Импорт кастомных хуков
import { useTaskForm } from '@hooks/useAddTaskForm';

// Импорт сервисов
import TaskService from '@services/tabs/tab_task.service';

// Импорт доп.функционала
import { getDateInSpecificFormat } from '@helpers/calendar';

// Импорт стилей
import './task_popup.css';

// Идентификатор договора
function ContractNumber(props) {
    const { contract, isLoading, contractsIDs, config, setIdContract, onSelect } = props;
    const [contractNum, setContractNum] = useState(() => {
        if (contract?.number === 'Нет данных') return null;
        return contract?.number;
    });

    const { addToHistory } = useHistoryContext();
    const navigate = useNavigate();

    // console.log(`ContractNumber contractsIDs: ${JSON.stringify(contractsIDs, null, 4)}`);

    // Выбор номера договора
    function onSelectContractNum(value) {
        // setContractNum(value?.title);
        // onSelect('contractNum', value?.title);

        setContractNum(value);
        onSelect('contractNum', value);
    }

    // Переход к договору для редактирования
    function onOpenContract(event) {
        const navigationArg = {
            state: {
                idContract: contract?.id,
                tabForm: { key: 'general', title: 'Общие' },
                partition: config?.partition,
                path: `${window.location.pathname}`,
                dataOperation: config?.contractOperations
            }
        };

        localStorage.setItem('selectedTab', JSON.stringify({ key: 'general', title: 'Общие' }));
        localStorage.setItem('idContract', JSON.stringify(contract?.id));

        addToHistory(`${window.location.pathname}`);

        if (event && event.button === 1) {
            // Открытие договора в новой вкладке
            const url = `../../dataform/general?data=${encodeURIComponent(JSON.stringify(navigationArg.state))}`;
            window.open(url, '_blank');
        } else navigate('../../dataform/general/', navigationArg);
    }

    // Удаление номера договора
    function onDeleteContractNum() {
        // setContractNum('');
        setContractNum(null);
        onSelect('contractNum', '');
        setIdContract(null);
    }

    useEffect(() => {
        if (contractNum && contractNum in contractsIDs) setIdContract(contractsIDs[contractNum]);
    }, [contractNum]);

    return !config?.hidden ? (
        <li className="popup__content-contractnum popup-content-item">
            <h2 className="popup-content-title">Номер договора</h2>
            <div className="popup__menu-wrapper">
                {!isLoading ? (
                    contractsIDs ? (
                        <div class="dropdown-menu-search">
                            <datalist id="suggestions" class="dropdown-menu-search__suggestions">
                                {Object.keys(contractsIDs)
                                    .map(key => {
                                        return { title: key };
                                    })
                                    .map((item, index) => (
                                        <option key={index} value={item.title} />
                                    ))}
                            </datalist>
                            <input
                                type="text"
                                class="dropdown-menu-search__input"
                                list="suggestions"
                                placeholder="Выбрать номер договора"
                                value={contractNum}
                                onChange={e => onSelectContractNum(e.target.value)}
                            />
                        </div>
                    ) : null
                ) : (
                    'Загрузка данных...'
                )}
                {contractNum ? (
                    <div className="popup__menu-actions">
                        <IconButton
                            nameClass="icon-btn__open-contract"
                            type="button"
                            icon="contract.svg"
                            onClick={e => onOpenContract(e)}
                            onMouseDown={e => onOpenContract(e)}
                        />
                        <IconButton
                            nameClass="icon-btn__delete-type"
                            type="button"
                            icon="cancel.svg"
                            onClick={onDeleteContractNum}
                        />
                    </div>
                ) : null}
            </div>
        </li>
    ) : null;
}

// Вид работы
function TypeWork(props) {
    const { idContract, config, onSelect } = props;

    // const [idContract, setIdContract] = useState(presetValue ? presetValue : null);
    const [typeWork, setTypeWork] = useState({});
    const [typesWork, setTypesWork] = useState([]);

    // Загрузка видов работ
    async function fetchTypesWork(contractId) {
        const typesWork = await TaskService.getTypesWork(contractId);
        if (typesWork && typesWork.length) setTypesWork(typesWork);
    }

    // Выбор вида работ
    function onSelectTypeWork(value) {
        setTypeWork(value);
        onSelect('typeWork', value);
    }

    // Удаление вида работ
    function onDeleteTypeWork() {
        setTypeWork(null);
        onSelect('typeWork', null);
    }

    useEffect(() => {
        if (idContract) fetchTypesWork(idContract);
        else setTypeWork({});
        // else {
        //     if (contractNum in contractsIDs) {
        //         setIdContract(contractsIDs[contractNum]);
        //         loadData(contractsIDs[contractNum]);
        //     }
        // }
    }, [idContract]);

    return !config?.hidden ? (
        <li className="popup__content-type popup-content-item">
            <h2 className="popup-content-title">Вид работы</h2>
            <div className="popup__menu-wrapper">
                <DropdownMenu
                    additClass="type-work"
                    icon="arrow_down_gr.svg"
                    nameMenu="Выбрать вид работы"
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
function Director(props) {
    const { presetValue, config, onSelect } = props;

    const [statePopup, setStatePopup] = useState(false);
    const [director, setDirector] = useState(presetValue ? presetValue : {});

    const navigate = useNavigate();
    const { addToHistory } = useHistoryContext();

    // Загрузка постановщика по умолчанию
    async function fetchDefaultDirector() {
        const employee = await TaskService.getAuthorizedEmployee(Cookies.get('MMUSERID'));
        setDirector(employee);
        onSelect('director', employee);
    }

    function onShowPopup() {
        setStatePopup(true);
    }

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

    // Переход к профилю пользователя
    function onClickUser() {
        startTransition(() => {
            addToHistory(`${window.location.pathname}`);
            navigate(`../../user/${director?.mmId}/profile/profile/`, {
                state: { idEmployee: director?.mmId, path: `${window.location.pathname}` }
            });

            // navigate(`../../user/profile/`, {
            //     state: { idEmployee: user?.mmId, path: `${window.location.pathname}` }
            // });
        });
    }

    useEffect(() => {
        if (!director || Object.keys(director).length === 0) fetchDefaultDirector();
    }, []);

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
                        <li className="popup__director-list-item" onClick={onClickUser}>
                            <BgFillText
                                type="p"
                                text={director.fullName}
                                bgColor={config?.appTheme === 'dark' ? '#4c4c4e' : '#f1f1f1'}
                            />
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
                    <BgFillText
                        type="p"
                        text="Добавить"
                        bgColor={config?.appTheme === 'dark' ? '#4c4c4e' : '#f1f1f1'}
                    />
                )}
                <IconButton
                    nameClass="icon-btn__add-director icon-btn__add-user"
                    type="button"
                    icon="edit.svg"
                    onClick={onShowPopup}
                />
            </div>
        </li>
    ) : null;
}

// Исполнитель
function Executor(props) {
    const { presetValue, config, onSelect } = props;

    const [statePopup, setStatePopup] = useState(false);
    const [executor, setExecutor] = useState(presetValue ? presetValue : {});

    const navigate = useNavigate();
    const { addToHistory } = useHistoryContext();

    function onShowPopup() {
        setStatePopup(true);
    }

    // Загрузка исполнителя по умолчанию
    async function fetchDefaultExecutor() {
        const employee = await TaskService.getAuthorizedEmployee(Cookies.get('MMUSERID'));
        setExecutor(employee);
        onSelect('executor', employee);
    }

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

    // Переход к профилю пользователя
    function onClickUser() {
        startTransition(() => {
            addToHistory(`${window.location.pathname}`);
            navigate(`../../user/${executor?.mmId}/profile/profile/`, {
                state: { idEmployee: executor?.mmId, path: `${window.location.pathname}` }
            });

            // navigate(`../../user/profile/`, {
            //     state: { idEmployee: user?.mmId, path: `${window.location.pathname}` }
            // });
        });
    }

    useEffect(() => {
        if (!executor || Object.keys(executor).length === 0) fetchDefaultExecutor();
    }, []);

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
                        <li className="popup__executor-list-item" onClick={onClickUser}>
                            <BgFillText
                                type="p"
                                text={executor.fullName}
                                bgColor={config?.appTheme === 'dark' ? '#4c4c4e' : '#f1f1f1'}
                            />
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
                    <BgFillText
                        type="p"
                        text="Добавить"
                        bgColor={config?.appTheme === 'dark' ? '#4c4c4e' : '#f1f1f1'}
                    />
                )}
                <IconButton
                    nameClass="icon-btn__add-executor icon-btn__add-user"
                    type="button"
                    icon="edit.svg"
                    onClick={onShowPopup}
                />
            </div>
        </li>
    ) : null;
}

// Завершенность
function Completeness(props) {
    const { presetValue, config, onSelect } = props;
    const [checked, setChecked] = useState(presetValue ? presetValue : 0);

    function onChangeCompleteness() {
        console.log(`res done ${!checked}`);
        setChecked(!checked);
        onSelect('done', !checked);
    }

    return !config?.hidden ? (
        <li className="popup__content-completeness popup-content-item">
            <h2 className="popup-content-title">Завершено</h2>
            <div className="popup__checkbox-wrapper">
                <input
                    className="popup__inpt-checkbox"
                    type="checkbox"
                    checked={checked}
                    onChange={onChangeCompleteness}
                />
                <span className="popup__custom-checkbox"></span>
            </div>
        </li>
    ) : null;
}

// Родительская задача
function ParentsTasks(props) {
    const { presetValue, config, onSelect } = props;

    const [parentTask, setParentTask] = useState({});
    const parentTasks = Array.from(TaskService.getAllTasks(config?.tasksData, []) ?? []);

    // Выбор род.задачи
    function onSelectParentTask(value) {
        setParentTask(value);
        onSelect('parentTask', value);
    }

    // Удалить род.задачу
    function onDeleteParentTask() {
        setParentTask(null);
        onSelect('parentTask', null);
    }

    useEffect(() => {
        if (presetValue) {
            for (let i = 0; i < parentTasks.length; i++) {
                if (parentTasks[i] && Object.keys(parentTasks[i]).length !== 0) {
                    if (parentTasks[i]?.id === presetValue) {
                        // parentTaskData = parentTasks[i];
                        setParentTask(parentTasks[i]);
                        break;
                    }
                }
            }
        }
        // console.log(
        //     `parentTaskData: ${JSON.stringify(parentTaskData, null, 4)}\nparentTasksData: ${JSON.stringify(
        //         parentTasks,
        //         null,
        //         4
        //     )}`
        // );
    }, []);

    console.log(`ParentsTasks hidden: ${config?.hidden}`);

    return !config?.hidden ? (
        <li className="popup__content-parent-tasks popup-content-item">
            <h2 className="popup-content-title">Родительская задача</h2>
            <div className="popup__menu-wrapper">
                <DropdownMenu
                    additClass="parent-tasks"
                    icon="arrow_down_gr.svg"
                    nameMenu="Выбрать родительскую задачу"
                    specifiedVal={parentTask}
                    dataSource={parentTasks}
                    onItemClick={onSelectParentTask}
                />
                {parentTask && Object.keys(parentTask).length !== 0 ? (
                    <IconButton
                        nameClass="icon-btn__delete-type"
                        type="button"
                        icon="cancel.svg"
                        onClick={onDeleteParentTask}
                    />
                ) : null}
            </div>
        </li>
    ) : null;
}

// Задача
function TaskName(props) {
    const { presetValue, config, onChange } = props;

    const [taskName, setTaskName] = useState(presetValue ? presetValue : '');

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
function CommencementDate(props) {
    const { presetValue, config, onSelect } = props;
    // console.log(`CommencementDate presetValue: ${presetValue}`);

    const [calendarState, setCalendarState] = useState(false);
    const [startDate, setStartDate] = useState(presetValue ? presetValue : {});

    function onShowCalendar() {
        setCalendarState(true);
    }

    // Удаление даты
    function onDeleteDate() {
        setStartDate('');
        onSelect('dateStart', '');
    }

    // Выбор даты
    function onSelectStartDate(date) {
        const dateYYYYMMDD = getDateInSpecificFormat(new Date(date.getFullYear(), date.getMonth(), date.getDate()), {
            format: 'YYYYMMDD',
            separator: '-'
        });
        setStartDate(dateYYYYMMDD);
        onSelect('dateStart', dateYYYYMMDD);
    }

    useEffect(() => {
        if (!presetValue || Object.keys(presetValue).length === 0) {
            const currDateYYYYMMDD = getDateInSpecificFormat(new Date(), {
                format: 'YYYYMMDD',
                separator: '-'
            });
            setStartDate(currDateYYYYMMDD);
            onSelect('dateStart', currDateYYYYMMDD);
        }
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
                        onClick={onShowCalendar}
                    />
                    {calendarState
                        ? createPortal(
                              <CalendarWindow
                                  additClass="task-calendar"
                                  stateCalendar={calendarState}
                                  setStateCalendar={setCalendarState}
                                  onClickDate={onSelectStartDate}
                              />,
                              document.getElementById('portal')
                          )
                        : null}
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
function DeadlineTask(props) {
    const { presetValue, config, onSelect } = props;

    const [calendarState, setCalendarState] = useState(false);
    const [deadline, setDeadline] = useState(presetValue ? presetValue : {});
    // const [deadline, setDeadline] = useState(presetValue ? presetValue : '');

    function onShowCalendar() {
        setCalendarState(true);
    }

    // Выбор даты
    function onSelectDeadline(date) {
        const dateYYYYMMDD = getDateInSpecificFormat(new Date(date.getFullYear(), date.getMonth(), date.getDate()), {
            format: 'YYYYMMDD',
            separator: '-'
        });
        setDeadline({ value: dateYYYYMMDD });
        onSelect('deadlineTask', { value: dateYYYYMMDD });
        // setDeadline(dateYYYYMMDD);
        // onSelect('deadlineTask', dateYYYYMMDD);
    }

    // Удаление даты
    function onDeleteDate() {
        // setDeadline({ value: '' });
        // onSelect('deadlineTask', { value: '' });
        setDeadline(null);
        onSelect('deadlineTask', null);
    }

    useEffect(() => {
        if (!presetValue || Object.keys(presetValue).length === 0) {
            const currDateYYYYMMDD = getDateInSpecificFormat(new Date(), {
                format: 'YYYYMMDD',
                separator: '-'
            });
            setDeadline({ value: currDateYYYYMMDD });
            onSelect('deadlineTask', { value: currDateYYYYMMDD });
        }
    }, []);

    return !config?.hidden ? (
        <li className="popup__content-deadline popup-content-item">
            <h2 className="popup-content-title">Дедлайн</h2>
            <div className="popup__date-wrapper">
                <div className="popup__deadline popup-task-date">
                    <input
                        className="popup-task-date-input"
                        type="text"
                        value={deadline && Object.keys(deadline).length !== 0 ? deadline?.value : 'Нет данных'}
                        disabled={true}
                        // onChange={onChangeDeadline}
                    />
                    <IconButton
                        nameClass="popup-task-date-ic-btn icon-btn"
                        type="button"
                        icon="calendar.svg"
                        // disabled={disabledElem}
                        onClick={onShowCalendar}
                    />
                    {calendarState
                        ? createPortal(
                              <CalendarWindow
                                  additClass="task-calendar"
                                  stateCalendar={calendarState}
                                  setStateCalendar={setCalendarState}
                                  onClickDate={onSelectDeadline}
                              />,
                              document.getElementById('portal')
                          )
                        : null}
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

function TaskItem({ taskItem }) {
    console.log(`taskItem: ${JSON.stringify(taskItem, null, 4)}`);
    return (
        <ul className="popup__taskinfo-row popup__taskinfo-list">
            {/* Подзадача */}
            <li className="popup__taskinfo-cell">
                <input type="text" className="popup__taskinfo-input" value={taskItem?.task ?? 'Нет данных'} />
            </li>
            {/* Дата начала */}
            <li className="popup__taskinfo-cell">
                <div className="popup__taskinfo-date">
                    <input
                        className="popup-taskinfo-date-input"
                        type="text"
                        value={taskItem?.dateStart ?? 'Нет данных'}
                        disabled={true}
                        // onChange={onChangeStartDate}
                    />
                </div>
            </li>
            {/* Дедлайн */}
            <li className="popup__taskinfo-cell">
                <div className="popup__taskinfo-date">
                    <input
                        className="popup-taskinfo-date-input"
                        type="text"
                        value={
                            taskItem?.deadlineTask && Object.keys(taskItem?.deadlineTask).length !== 0
                                ? taskItem?.deadlineTask?.value
                                : 'Нет данных'
                        }
                        disabled={true}
                    />
                </div>
            </li>
            {/* Постановщик */}
            <li className="popup__taskinfo-cell">
                <div className="popup__user-inner">
                    {taskItem?.director && Object.keys(taskItem?.director).length !== 0 ? (
                        <BgFillText
                            type="p"
                            text={taskItem?.director.fullName}
                            // bgColor={config?.appTheme === 'dark' ? '#4c4c4e' : '#f1f1f1'}
                        />
                    ) : (
                        <BgFillText
                            type="p"
                            text="Нет данных"
                            // bgColor={config?.appTheme === 'dark' ? '#4c4c4e' : '#f1f1f1'}
                        />
                    )}
                </div>
            </li>
            {/* Исполнитель */}
            <li className="popup__taskinfo-cell">
                <div className="popup__user-inner">
                    {taskItem?.executor && Object.keys(taskItem?.executor).length !== 0 ? (
                        <BgFillText
                            type="p"
                            text={taskItem?.executor.fullName}
                            // bgColor={config?.appTheme === 'dark' ? '#4c4c4e' : '#f1f1f1'}
                        />
                    ) : (
                        <BgFillText
                            type="p"
                            text="Нет данных"
                            // bgColor={config?.appTheme === 'dark' ? '#4c4c4e' : '#f1f1f1'}
                        />
                    )}
                </div>
            </li>
            {/* Завершено */}
            <li className="popup__taskinfo-cell">
                <div className="popup__checkbox-wrapper">
                    <input
                        className="popup__inpt-checkbox"
                        type="checkbox"
                        checked={taskItem?.done}
                        // onChange={onChangeCompleteness}
                    />
                    <span className="popup__custom-checkbox"></span>
                </div>
            </li>
        </ul>
    );
}

function TaskInfo(props) {
    const { title, taskData } = props;

    // console.log(`TaskInfo\ntaskId: ${taskId}parentId: ${parentId}`);

    return (
        <div className="popup__taskinfo">
            <h2 className="popup-content-title">{title}</h2>
            {/* <div className="popup__taskinfo-actions">
                Родительская задача
                <div className="popup__taskinfo-btn-add" onClick={addSubTask}>
                    +
                </div>
                <button className="popup__taskinfo-btn-add">+</button>
            </div> */}
            <div className="popup__taskinfo-wrapper">
                <div className="popup__taskinfo-content">
                    <ul className="popup__taskinfo-table-header popup__taskinfo-list">
                        <li className="popup__taskinfo-table-header-item">Задача</li>
                        <li className="popup__taskinfo-table-header-item">Дата начала</li>
                        <li className="popup__taskinfo-table-header-item">Дедлайн</li>
                        <li className="popup__taskinfo-table-header-item">Постановщик</li>
                        <li className="popup__taskinfo-table-header-item">Исполнитель</li>
                        <li className="popup__taskinfo-table-header-item">Завершено</li>
                    </ul>
                    <div className="popup__taskinfo-table-wrapper">
                        <div className="popup__taskinfo-table">
                            {taskData && taskData.length !== 0
                                ? taskData.map((taskItem, indTask) => <TaskItem key={indTask} taskItem={taskItem} />)
                                : null}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Комментарий
function Comment(props) {
    const { presetValue, config, onChange } = props;
    const [comment, setComment] = useState(presetValue ? presetValue : '');

    function onChangeTaskName(e) {
        setComment(e.target.value);
        onChange(e);
    }

    return !config?.hidden ? (
        <div className="popup__content-comment popup-content-item">
            <h2 className="popup-content-title">Комментарий</h2>
            <textarea
                className="txt-area"
                name="comment"
                value={comment}
                onChange={e => onChangeTaskName(e)}
            ></textarea>
        </div>
    ) : null;
}

export default function TaskPopup(props) {
    const { additClass, title, data, taskOperation, addTaskState, setAddTaskState } = props;

    const theme = localStorage.getItem('appTheme');
    const dataTaskOperation = TaskService.getDataFormOperation(taskOperation);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [taskInfo, setTaskInfo] = useState({});
    const [idContract, setIdContract] = useState(data?.idContract ? data?.idContract : null);
    const [contractsIDs, setContractsIDs] = useState({});

    const { values, onChange, onClick } = useTaskForm(
        TaskService.getTaskData(data?.task, dataTaskOperation?.disabledFields),
        dataTaskOperation?.disabledFields
    );
    // const socket = useContext(SocketContext);
    const navigate = useNavigate();

    console.log(`values: ${JSON.stringify(values, null, 4)}`);
    // console.log(`dataTaskOperation: ${JSON.stringify(dataTaskOperation, null, 4)}`);
    // console.log(`TaskPopup data: ${JSON.stringify(data, null, 4)}`);

    // Показать модальное окно
    function onShowModal() {
        setIsModalOpen(true);
    }

    // Удаление задачи
    function onDeleteTask() {
        // const idContract = JSON.parse(localStorage.getItem('idContract'));
        // setIsModalOpen(true);
        if (data?.task && Object.keys(data?.task).length !== 0) {
            TaskService.deleteTask(data?.task?.id);

            setAddTaskState(false);
            navigate(window.location.pathname);
        }
    }

    // Получение задач
    async function fetchTaskData(idTask, idParent) {
        const taskData = await TaskService.getTaskInfo(idTask, idParent);
        if (taskData && taskData.length !== 0) setTaskInfo(taskData);
    }

    // Получение
    async function fetchContractsIDs() {
        try {
            setIsLoading(true);
            const contractsIDsData = await TaskService.getContractsIDs();
            // console.log(`contractsIDsData: ${JSON.stringify(contractsIDsData, null, 4)}`);
            if (contractsIDsData && Object.keys(contractsIDsData).length !== 0) setContractsIDs(contractsIDsData);
        } catch (err) {
            console.log(`error msg: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    }

    // Сохранение и редактирование задачи
    async function onOnSubmitData(e) {
        e.preventDefault();
        // const idContract = JSON.parse(localStorage.getItem('idContract'));
        // Создание новой задачи
        if (!data?.task || Object.keys(data?.task).length === 0) {
            const resultData = {
                typeWorkId: values?.typeWork?.id,
                contractId: +idContract,
                directorId: values?.director?.id,
                executorId: values?.executor?.id,
                dateStart: values?.dateStart,
                deadline: values?.deadlineTask?.value,
                parentId: values?.parentTask?.id,
                task: values?.task,
                comment: values?.comment
            };

            await TaskService.addTask(resultData, null, {
                director: values?.director,
                executor: values?.executor
            });
        }
        // Редактирование задачи
        else {
            const resultData = {
                typeWorkId: values?.typeWork?.id,
                contractId: idContract,
                directorId: values?.director?.id,
                executorId: values?.executor?.id,
                taskId: data?.task?.id,
                dateStart: values?.dateStart,
                deadline: values?.deadlineTask?.value,
                parentId: values?.parentTask?.id,
                done: +values?.done,
                task: values?.task,
                comment: values?.comment
            };

            await TaskService.editTask(resultData);
        }

        setAddTaskState(false);
        navigate(window.location.pathname);
    }

    useEffect(() => {
        fetchTaskData(data?.task?.id, data?.task?.parentId);
        // console.log(`TaskInfo: ${JSON.stringify(fetchTaskData(data?.task?.id, data?.task?.parentId), null, 4)}`);
    }, []);

    useEffect(() => {
        console.log(`TaskPopup idContract: ${data?.idContract}`);
        // if (!data?.idContract) fetchContractsIDs();
        if (!idContract) fetchContractsIDs();
    }, [idContract]);

    return (
        <>
            <div id="portal"></div>
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
                    <div className="popup__content-add-task-top">
                        <ul className="popup__content-add-task-left">
                            {!data?.idContract ? (
                                <ContractNumber
                                    contract={{
                                        id: idContract,
                                        number: data?.task?.contractNum
                                    }}
                                    isLoading={isLoading}
                                    contractsIDs={contractsIDs}
                                    config={{
                                        partition: data?.partition,
                                        hidden: dataTaskOperation?.hiddenFields?.typeWork ? true : false,
                                        contractOperations: data?.contractOperations
                                    }}
                                    setIdContract={setIdContract}
                                    onSelect={onClick}
                                />
                            ) : null}
                            <TypeWork
                                idContract={idContract}
                                config={{ hidden: dataTaskOperation?.hiddenFields?.typeWork ? true : false }}
                                setIdContract={setIdContract}
                                onSelect={onClick}
                            />
                            <Director
                                presetValue={data?.task?.director}
                                config={{
                                    appTheme: theme,
                                    hidden: dataTaskOperation?.hiddenFields?.director ? true : false
                                }}
                                onSelect={onClick}
                            />
                            <Executor
                                presetValue={data?.task?.executor}
                                config={{
                                    appTheme: theme,
                                    hidden: dataTaskOperation?.hiddenFields?.executor ? true : false
                                }}
                                onSelect={onClick}
                            />
                            <ParentsTasks
                                presetValue={data?.task?.parentId}
                                config={{
                                    hidden: dataTaskOperation?.hiddenFields?.parentTask,
                                    tasksData: data?.tasks
                                }}
                                onSelect={onClick}
                            />
                            <TaskName
                                presetValue={data?.task?.task}
                                config={{ hidden: dataTaskOperation?.hiddenFields?.task ? true : false }}
                                onChange={onChange}
                            />
                            <CommencementDate
                                presetValue={data?.task?.dateStart || data?.task?.startDate}
                                config={{ hidden: dataTaskOperation?.hiddenFields?.dateStart ? true : false }}
                                onSelect={onClick}
                            />
                            <DeadlineTask
                                presetValue={data?.task?.deadlineTask}
                                config={{ hidden: dataTaskOperation?.hiddenFields?.deadlineTask ? true : false }}
                                onSelect={onClick}
                            />
                            <Completeness
                                presetValue={data?.task?.done}
                                config={{ hidden: dataTaskOperation?.hiddenFields?.done ? true : false }}
                                onSelect={onClick}
                            />
                        </ul>
                        <div className="popup__content-add-task-right">
                            <Comment
                                presetValue={null}
                                config={{ hidden: dataTaskOperation?.hiddenFields?.comment ? true : false }}
                                onChange={onChange}
                            />
                        </div>
                    </div>
                    {taskInfo && Object.keys(taskInfo).length !== 0 ? (
                        <div className="popup__content-add-task-bottom">
                            {taskInfo?.parent && Object.keys(taskInfo?.parent).length !== 0 ? (
                                <TaskInfo
                                    title="Родительская задача"
                                    taskData={[{ ...TaskService.formData(taskInfo?.parent) }]}
                                />
                            ) : null}
                            {taskInfo?.daughters && taskInfo?.daughters.length !== 0 ? (
                                <TaskInfo
                                    title="Подзадачи"
                                    taskData={taskInfo?.daughters?.map(item => TaskService.formData(item))}
                                />
                            ) : null}
                        </div>
                    ) : null}
                </form>
                {data?.task && Object.keys(data?.task).length !== 0 ? (
                    <button className="popup__content-del-task" onClick={onShowModal}>
                        Удалить задачу
                    </button>
                ) : null}
            </InputDataPopup>
            {isModalOpen ? (
                <ModalWindow
                    additClass="action-selection"
                    title="Вы действительно хотите удалить эту задачу?"
                    statePopup={isModalOpen}
                    actionRef={onDeleteTask}
                    setStatePopup={setIsModalOpen}
                />
            ) : null}
        </>
    );
}

// function SubTasks(props) {
//     const { presetValue, onClick, onСhangeByIndex } = props;
//     const [subTasks, setSubTasks] = useState(presetValue && presetValue.length !== 0 ? presetValue : []);
//     // const [subTasksData, setSubTasksData] = useState([]);
//     const [subTask, setSubTask] = useState({
//         task: '',
//         dateStart: null,
//         deadlineTask: null,
//         done: 0,
//         director: null,
//         executor: null
//     });

//     function addSubTask() {
//         const subTasksData = Array.from(subTasks);
//         subTasksData.push(subTask);
//         // subtasks.push(<SubTask subTasksData={subTasksData} setSubTasksData={setSubTasksData} />);
//         setSubTasks(subTasksData);
//         onClick('subTasks', subTasksData);
//     }

//     return (
//         <div className="popup__subtasks">
//             {/* <h2 className="popup-content-title">Подзадачи</h2> */}
//             <div className="popup__subtasks-actions">
//                 Подзадачи
//                 <div className="popup__subtasks-btn-add" onClick={addSubTask}>
//                     +
//                 </div>
//                 {/* <button className="popup__subtasks-btn-add">+</button> */}
//             </div>
//             <div className="popup__subtasks-wrapper">
//                 <div className="popup__subtasks-content">
//                     <ul className="popup__subtasks-table-header popup__subtasks-list">
//                         <li className="popup__subtasks-table-header-item">Задача</li>
//                         <li className="popup__subtasks-table-header-item">Дата начала</li>
//                         <li className="popup__subtasks-table-header-item">Дедлайн</li>
//                         <li className="popup__subtasks-table-header-item">Постановщик</li>
//                         <li className="popup__subtasks-table-header-item">Исполнитель</li>
//                         <li className="popup__subtasks-table-header-item">Завершено</li>
//                     </ul>
//                     <div className="popup__subtasks-table-wrapper">
//                         <div className="popup__subtasks-table">
//                             {subTasks && subTasks.length !== 0
//                                 ? subTasks.map((subTask, indTask) => (
//                                       <TaskItem
//                                           key={indTask}
//                                           indTask={indTask}
//                                           subTask={subTask}
//                                           onСhangeByIndex={onСhangeByIndex}
//                                       />
//                                   ))
//                                 : null}
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }
