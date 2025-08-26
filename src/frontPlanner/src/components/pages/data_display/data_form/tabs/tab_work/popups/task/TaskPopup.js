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
import { getKeyByValue } from '@helpers/helper';
import { getDateInSpecificFormat } from '@helpers/calendar';

// Импорт стилей
import './task_popup.css';

// Идентификатор договора
function ContractNumber(props) {
    const { contract, isLoading, contractsIDs, config, setIdContract, onSelect } = props;
    // console.log(`ContractNumber contract: ${JSON.stringify(contract, null, 4)}`);
    // console.log(`contractNum: ${JSON.stringify(getKeyByValue(contractsIDs, contract?.id), null, 4)}`);
    // const [contractNum, setContractNum] = useState(() => {
    //     if (contract?.number === 'Нет данных') return null;
    //     return contract?.number;
    // });
    const [contractNum, setContractNum] = useState(null);

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
        if (contractsIDs && Object.keys(contractsIDs).length !== 0) {
            setContractNum(getKeyByValue(contractsIDs, contract?.id));
            console.log(`contract number: ${getKeyByValue(contractsIDs, contract?.id)}`);
        }
    }, [contractsIDs]);

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
        if (idContract) setTypeWork(fetchTypesWork(idContract));
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
    // console.log(`Director presetValue: ${JSON.stringify(presetValue, null, 4)}`);

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
    // console.log(`Executor presetValue: ${JSON.stringify(presetValue, null, 4)}`);

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
        // console.log(`res done ${!checked}`);
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

// Получение задач
// async function fetchTaskData(idTask, idParent) {
//     const taskData = await TaskService.getTaskInfo(idTask, idParent);
//     if (taskData && taskData.length !== 0) {
//         const { subtasks, ...otherElems } = taskData;
//         const newTask = {
//             ...TaskService.formData(otherElems),
//             subtasks: subtasks?.map(subtask => TaskService.formData(subtask))
//         };
//         // console.log(`newTask: ${JSON.stringify(newTask, null, 4)}`)
//         setTaskData(newTask);
//     }
// }

// Родительская задача
function ParentsTasks(props) {
    const { presetValue, config, onSelect, switchPopup } = props;

    const [parentTask, setParentTask] = useState({});
    const allTasks = TaskService.getAllTasks(config?.tasksData, {}, config?.taskForDelete);
    // console.log(`allTasks: ${JSON.stringify(allTasks, null, 4)}`);

    // Выбор род.задачи
    function onSelectParentTask(value) {
        console.log(`onSelectParentTask value: ${JSON.stringify(value, null, 4)}`);
        setParentTask(value);
        onSelect('parentId', value);
    }

    // Удалить род.задачу
    function onDeleteParentTask() {
        setParentTask(null);
        onSelect('parentId', null);
    }

    // Открыть задачу
    function onOpenTask() {
        const { task, ...otherElems } = config?.popupData;
        switchPopup('update', 'editTask', { ...otherElems, task: allTasks[parentTask?.value] });
    }

    useEffect(() => {
        // if (config?.taskForDelete) delete allTasks[config?.taskForDelete];
        if (presetValue) {
            if (presetValue in allTasks) {
                const parentTaskData = { value: presetValue, title: allTasks[presetValue]?.task ?? 'Нет данных' };
                setParentTask(parentTaskData);
                onSelect('parentId', parentTaskData);
            }
        }
    }, []);

    // console.log(`ParentsTasks hidden: ${config?.hidden}`);

    return !config?.hidden ? (
        <li className="popup__content-parent-tasks popup-content-item">
            <h2 className="popup-content-title">Родительская задача</h2>
            <div className="popup__menu-wrapper">
                <DropdownMenu
                    additClass="parent-tasks"
                    icon="arrow_down_gr.svg"
                    nameMenu="Выбрать родительскую задачу"
                    specifiedVal={parentTask}
                    dataSource={Object.keys(allTasks)?.map(key => {
                        return { value: key, title: allTasks[key]?.task };
                    })}
                    onItemClick={onSelectParentTask}
                />
                {parentTask && Object.keys(parentTask).length !== 0 ? (
                    <div className="popup__menu-actions">
                        <IconButton
                            nameClass="icon-btn__open-task"
                            type="button"
                            icon="transition.svg"
                            onClick={onOpenTask}
                        />
                        <IconButton
                            nameClass="icon-btn__delete-type"
                            type="button"
                            icon="cancel.svg"
                            onClick={onDeleteParentTask}
                        />
                    </div>
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

function TaskItem(props) {
    const { taskItem, popupData, config, switchPopup } = props;
    const { navigate, addToHistory, appTheme } = config;
    // console.log(`taskItem: ${JSON.stringify(taskItem, null, 4)}`);

    // Открыть задачу
    function onOpenTask() {
        const { task, ...otherElems } = popupData;
        // switchPopup('editTask', { ...otherElems, task: taskItem });
        // setTaskData(taskItem);
        // setEditingTaskId(taskItem?.id);
        switchPopup('update', 'editTask', { ...otherElems, task: taskItem });
    }

    // Переход к профилю пользователя
    function onClickUser(user) {
        startTransition(() => {
            addToHistory(`${window.location.pathname}`);
            navigate(`../../user/${user?.mmId}/profile/profile/`, {
                state: { idEmployee: user?.mmId, path: `${window.location.pathname}` }
            });

            // navigate(`../../user/profile/`, {
            //     state: { idEmployee: user?.mmId, path: `${window.location.pathname}` }
            // });
        });
    }

    return (
        <ul key={taskItem?.id} className="popup__taskinfo-row popup__taskinfo-list">
            {/* Задача */}
            <li className="popup__taskinfo-cell popup__taskinfo-cell-subtask">
                <div className="popup__taskinfo-subtask" onClick={onOpenTask}>
                    {taskItem?.task ?? 'Нет данных'}
                </div>
                {/* <input type="text" className="popup__taskinfo-input" value={taskItem?.task ?? 'Нет данных'} /> */}
                {/* <IconButton nameClass="icon-btn__open-task" type="button" icon="contract.svg" onClick={onOpenTask} /> */}
            </li>
            {/* Дата начала */}
            <li className="popup__taskinfo-cell">
                <div className="popup__taskinfo-date">
                    <input
                        className="popup-taskinfo-date-input"
                        type="text"
                        value={taskItem?.dateStart || taskItem?.startDate || 'Нет данных'}
                        disabled={true}
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
                        <div onClick={() => onClickUser(taskItem?.director)}>
                            <BgFillText
                                type="p"
                                text={taskItem?.director.fullName}
                                bgColor={appTheme === 'dark' ? '#4c4c4e' : '#f1f1f1'}
                            />
                        </div>
                    ) : (
                        <BgFillText type="p" text="Нет данных" bgColor={appTheme === 'dark' ? '#4c4c4e' : '#f1f1f1'} />
                    )}
                </div>
            </li>
            {/* Исполнитель */}
            <li className="popup__taskinfo-cell">
                <div className="popup__user-inner">
                    {taskItem?.executor && Object.keys(taskItem?.executor).length !== 0 ? (
                        <div onClick={() => onClickUser(taskItem?.director)}>
                            <BgFillText
                                type="p"
                                text={taskItem?.executor?.fullName}
                                bgColor={appTheme === 'dark' ? '#4c4c4e' : '#f1f1f1'}
                            />
                        </div>
                    ) : (
                        <BgFillText type="p" text="Нет данных" bgColor={appTheme === 'dark' ? '#4c4c4e' : '#f1f1f1'} />
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
                        disabled={true}
                        // onChange={onChangeCompleteness}
                    />
                    <span className="popup__custom-checkbox"></span>
                </div>
            </li>
        </ul>
    );
}

function TaskInfo(props) {
    const { title, popupData, taskData, config, switchPopup } = props;
    const { navigate, addToHistory, appTheme } = config;
    // console.log(`TaskInfo\ntaskId: ${taskId}parentId: ${parentId}`);

    const [subTask, setSubTask] = useState({
        id: null,
        contractId: null,
        task: null,
        idTypeWork: null,
        dateStart: null,
        deadlineTask: null,
        done: 0,
        parentId: null,
        director: null,
        executor: null
    });

    // Инициализация данных подзадачи
    async function initSubtask() {
        // console.log(`initSubtask : ${JSON.stringify(taskData, null, 4)}`);
        const tempSubTask = Object.assign({}, subTask);

        // Установка дат по умолчанию
        tempSubTask.dateStart = getDateInSpecificFormat(new Date(), {
            format: 'YYYYMMDD',
            separator: '-'
        });
        tempSubTask.deadlineTask = {
            value: getDateInSpecificFormat(new Date(), {
                format: 'YYYYMMDD',
                separator: '-'
            })
        };

        // Установка родителя по умолчанию
        const { task: prevTask } = popupData;
        tempSubTask.parentId = prevTask?.subtasks[0] ? prevTask.subtasks[0].parentId : null;
        // tempSubTask.parentId = taskData[0]?.parentId;

        // Установка пользователей по умолчанию
        tempSubTask.director = await TaskService.getAuthorizedEmployee(Cookies.get('MMUSERID'));
        tempSubTask.executor = await TaskService.getAuthorizedEmployee(Cookies.get('MMUSERID'));

        setSubTask(tempSubTask);
    }

    // Добавление подзадачи
    function addSubtask() {
        const { task, ...otherElems } = popupData;
        // switchPopup('addSubTask', { ...otherElems, task: subTask });
        switchPopup('creation', 'addSubTask', { ...otherElems, task: subTask });
    }

    useEffect(() => {
        // Инициализация данных подзадачи
        initSubtask();
    }, []);

    return (
        <div className="popup__taskinfo">
            {/* <h2 className="popup-content-title">{title}</h2> */}
            <div className="popup__taskinfo-actions">
                {title}
                <div className="popup__taskinfo-btn-add" onClick={addSubtask}>
                    +
                </div>
            </div>
            {taskData && taskData.length !== 0 ? (
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
                                {taskData?.map((taskItem, indTask) => (
                                    <TaskItem
                                        key={indTask}
                                        popupData={popupData}
                                        taskItem={taskItem}
                                        config={{ appTheme, navigate, addToHistory }}
                                        switchPopup={switchPopup}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
}

export default function TaskPopup(props) {
    // const { additClass, title, data, taskOperation, popupState, setPopupState, setSubTaskState, setTaskData } = props;
    const { additClass, title, data, taskOperation, popupState, setPopupState, switchPopup } = props;

    const theme = localStorage.getItem('appTheme');
    const dataTaskOperation = TaskService.getDataFormOperation(taskOperation);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [idContract, setIdContract] = useState(data?.idContract ?? null);
    const [contractsIDs, setContractsIDs] = useState({});

    const [parentTask, setParentTask] = useState({});
    const [subTasks, setSubTasks] = useState([]);

    const { values, onChange, onClick } = useTaskForm(
        TaskService.getTaskData(data?.task, dataTaskOperation?.disabledFields),
        dataTaskOperation?.disabledFields
    );
    // const socket = useContext(SocketContext);
    const { addToHistory } = useHistoryContext();
    const navigate = useNavigate();

    console.log(`values: ${JSON.stringify(values, null, 4)}`);
    // console.log(`dataTaskOperation: ${JSON.stringify(dataTaskOperation, null, 4)}`);
    // console.log(`TaskPopup data: ${JSON.stringify(data, null, 4)}`);

    // Удаление задачи
    function onDeleteTask() {
        if (data?.task && Object.keys(data?.task).length !== 0) {
            TaskService.deleteTask(data?.task?.id);

            setPopupState(false);
            navigate(window.location.pathname);
            // navigate(0);
        }
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
        // !data?.task || Object.keys(data?.task).length === 0
        if (taskOperation === 'creation') {
            const resultData = {
                typeWorkId: values?.typeWork?.id,
                contractId: +idContract,
                directorId: values?.director?.id,
                executorId: values?.executor?.id,
                dateStart: values?.dateStart,
                deadline: values?.deadlineTask?.value,
                parentId: values?.parentId?.value,
                task: values?.task,
                comment: values?.comment
            };

            // alert(`Add task data: ${JSON.stringify(values, null, 4)}`);

            await TaskService.addTask(resultData, null, {
                director: values?.director,
                executor: values?.executor
            });
        }
        // Редактирование задачи
        if (taskOperation === 'update') {
            const resultData = {
                typeWorkId: values?.typeWork?.id,
                contractId: idContract,
                directorId: values?.director?.id,
                executorId: values?.executor?.id,
                taskId: data?.task?.id,
                dateStart: values?.dateStart,
                deadline: values?.deadlineTask?.value,
                parentId: values?.parentId?.value,
                done: +values?.done,
                task: values?.task,
                comment: values?.comment
            };

            // alert(`Edit task data: ${JSON.stringify(values, null, 4)}`);

            await TaskService.editTask(resultData);
        }

        setPopupState(false);
        navigate(window.location.pathname);
        // navigate(0);
    }

    // Получение информации о задаче
    async function fetchTaskData(idTask, idParent) {
        const taskData = await TaskService.getTaskInfo(idTask, idParent);
        if (taskData && Object.keys(taskData).length !== 0) {
            const { subtasks, ...otherElems } = taskData;

            setParentTask(TaskService.formItem(otherElems));
            setSubTasks(TaskService.formData(taskData?.subtasks));
        }
    }

    useEffect(() => {
        // Загрузка информации о подзадач родительской задачи
        fetchTaskData(data?.task?.id, data?.task?.parentId);
    }, []);

    useEffect(() => {
        // Загрузка номеров договоров
        fetchContractsIDs();
    }, [idContract]);

    return (
        <>
            <div id="portal"></div>
            <InputDataPopup
                idForm="add-task-form"
                title={title}
                additClass={additClass}
                overlay={true}
                statePopup={popupState}
                setStatePopup={setPopupState}
            >
                <form
                    id="add-task-form"
                    className="popup__content-add-task popup-content"
                    onSubmit={e => onOnSubmitData(e)}
                >
                    <div className="popup__content-add-task-top">
                        <ul className="popup__content-add-task-left">
                            {/* Номер договора */}
                            <ContractNumber
                                contract={{
                                    id: +idContract
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
                            {/* Вид работы */}
                            <TypeWork
                                idContract={idContract}
                                config={{ hidden: dataTaskOperation?.hiddenFields?.typeWork ? true : false }}
                                setIdContract={setIdContract}
                                onSelect={onClick}
                            />
                            {/* Постановщик */}
                            <Director
                                presetValue={data?.task?.director}
                                config={{
                                    appTheme: theme,
                                    hidden: dataTaskOperation?.hiddenFields?.director ? true : false
                                }}
                                onSelect={onClick}
                            />
                            {/* Исполнитель */}
                            <Executor
                                presetValue={data?.task?.executor}
                                config={{
                                    appTheme: theme,
                                    hidden: dataTaskOperation?.hiddenFields?.executor ? true : false
                                }}
                                onSelect={onClick}
                            />
                            {/* Родительская задача */}
                            <ParentsTasks
                                presetValue={data?.task?.parentId}
                                config={{
                                    hidden: dataTaskOperation?.hiddenFields?.parentTask,
                                    popupData: { ...data },
                                    taskForDelete: +data?.task?.id,
                                    tasksData: data?.tasks
                                }}
                                onSelect={onClick}
                                switchPopup={switchPopup}
                            />
                            {/* Название задачи */}
                            <TaskName
                                presetValue={data?.task?.task}
                                config={{ hidden: dataTaskOperation?.hiddenFields?.task ? true : false }}
                                onChange={onChange}
                            />
                            {/* Дата начала */}
                            <CommencementDate
                                presetValue={data?.task?.dateStart || data?.task?.startDate}
                                config={{ hidden: dataTaskOperation?.hiddenFields?.dateStart ? true : false }}
                                onSelect={onClick}
                            />
                            {/* Дедлайн */}
                            <DeadlineTask
                                presetValue={data?.task?.deadlineTask}
                                config={{ hidden: dataTaskOperation?.hiddenFields?.deadlineTask ? true : false }}
                                onSelect={onClick}
                            />
                            {/* Завершенность */}
                            <Completeness
                                presetValue={data?.task?.done}
                                config={{ hidden: dataTaskOperation?.hiddenFields?.done ? true : false }}
                                onSelect={onClick}
                            />
                        </ul>
                        <div className="popup__content-add-task-right">
                            {/* Комментарий */}
                            <Comment
                                presetValue={data?.task?.comment ?? parentTask?.comment}
                                config={{ hidden: dataTaskOperation?.hiddenFields?.comment ? true : false }}
                                onChange={onChange}
                            />
                        </div>
                    </div>
                    {/* Отображение подзадач */}
                    {taskOperation === 'update' ? (
                        <TaskInfo
                            title="Подзадачи"
                            popupData={{ ...data }}
                            taskData={subTasks.map(subTask => TaskService.formItem(subTask))}
                            config={{
                                appTheme: theme,
                                navigate,
                                addToHistory
                            }}
                            switchPopup={switchPopup}
                        />
                    ) : null}
                </form>
                {taskOperation === 'update' ? (
                    <button className="popup__content-del-task" onClick={() => setIsModalOpen(true)}>
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
