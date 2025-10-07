import { useEffect, useState, startTransition, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';

import Cookies from 'js-cookie';
import classNames from 'classnames';

// Импорт компонетов
import BgFillText from '@generic/elements/text/BgFillText';
import IconButton from '@generic/elements/buttons/IcButton';
import DropdownMenu from '@generic/elements/dropdown_menu/DropdownMenu';

import CalendarWindow from '@generic/elements/calendar/CalendarWindow';
import ModalWindow from '@generic/elements/popup/ModalWindow';
import UsersPopupWindow from '@generic/elements/popup/UsersPopupWindow';
import InputDataPopup from '@generic/elements/popup/InputDataPopup';

import TimeCostsPopup from '../timecosts/TimeCostsPopup';

// Импорт контекстов
// import { SocketContext } from '../../../../../../../../contexts/socket.context';
import { useHistoryContext } from '../../../../../../../../contexts/history.context';

// Импорт кастомных хуков
import { useTaskForm } from '@hooks/useTaskForm';

// Импорт конфигурации
import { EMPLOYEE_ACTIONS, ACTIONS_TASK, IMAGES_ACTIONS_TASK } from '@config/popups/popup_task.config';

// Импорт сервисов
import TaskService from '@services/popups/popup_task.service';

// Импорт доп.функционала
import { getKeyByValue } from '@helpers/helper';
import { getDateInSpecificFormat } from '@helpers/calendar';

// Импорт стилей
import './task_popup.css';
import 'react-datepicker/dist/react-datepicker.css';

// Цепочка статусов
function StatusChain(props) {
    const { presetValue, director, executor, onSelect } = props;
    const statusesTask = EMPLOYEE_ACTIONS?.statuses(director?.mmId, executor?.mmId);

    const [status, setStatus] = useState(null);

    // Изменить статус
    function onChangeStatus(action) {
        const actionTask = ACTIONS_TASK[action];
        const taskStatus = statusesTask[actionTask?.title];
        const actions =
            director?.mmId === Cookies.get('MMUSERID') && executor?.mmId === Cookies.get('MMUSERID')
                ? taskStatus?.allActions
                : taskStatus[Cookies.get('MMUSERID')];
        const newStatus = { ...ACTIONS_TASK[action], actions };

        setStatus(newStatus);
        onSelect('status', newStatus);

        if ('done' in actionTask) onSelect('done', actionTask?.done);
    }

    useEffect(() => {
        if (presetValue) {
            const taskStatus = statusesTask[presetValue];
            const newStatus = {
                title: presetValue,
                progress: taskStatus?.progress,
                actions:
                    director?.mmId === Cookies.get('MMUSERID') && executor?.mmId === Cookies.get('MMUSERID')
                        ? taskStatus?.allActions
                        : taskStatus[Cookies.get('MMUSERID')]
            };
            // console.log(`status: ${JSON.stringify(newStatus, null, 4)}`);
            setStatus(newStatus);
            onSelect('status', newStatus);
        }
    }, []);

    return (
        <div className="popup-task-steps">
            <div className="popup-task-steps__progress-bar">
                <span className="popup-task-steps__indicator" style={{ height: `${status?.progress}%` }}></span>
            </div>
            {Object.keys(statusesTask)?.map((key, ind) => {
                if (ind + 1 !== Object.keys(statusesTask).length) {
                    return (
                        <>
                            <div
                                class={classNames('popup-task-step', {
                                    'popup-task-step_active': status?.title === key
                                })}
                                data-step={key}
                            />
                            <div className="popup-task-steps__actions">
                                {key === 'Отмененнная' &&
                                status?.title &&
                                statusesTask[key][Cookies.get('MMUSERID')] &&
                                status?.title !== 'Завершенная' ? (
                                    <ul className="popup-task-steps__actions-list">
                                        <li
                                            type="button"
                                            className="popup-task-steps__action"
                                            onClick={() => onChangeStatus('Отменить')}
                                        >
                                            <p>{statusesTask[key][Cookies.get('MMUSERID')]}</p>
                                            {IMAGES_ACTIONS_TASK['Отменить']}
                                        </li>
                                    </ul>
                                ) : null}
                                {status?.title === key && status?.actions && status?.actions.length !== 0 ? (
                                    <ul
                                        className={classNames('popup-task-steps__actions-list', {
                                            'popup-task-steps__actions_completed': key === 'Выполненная'
                                        })}
                                    >
                                        {status?.actions.map(action => (
                                            <li
                                                className="popup-task-steps__action"
                                                onClick={() => onChangeStatus(action)}
                                            >
                                                <p>{action}</p>
                                                {IMAGES_ACTIONS_TASK[action]}
                                            </li>
                                        ))}
                                    </ul>
                                ) : null}
                            </div>
                        </>
                    );
                } else {
                    return (
                        <div
                            class={classNames('popup-task-step', {
                                'popup-task-step_active': status?.title === key
                            })}
                            data-step={
                                status?.title === key && status?.actions && status?.actions.length !== 0
                                    ? `${key}${String.fromCharCode(8194)}▼`
                                    : key
                            }
                        />
                    );
                }
            })}
        </div>
    );
}

// Идентификатор договора
function ContractNumber(props) {
    const { contract, isLoading, contractsIDs, config, setIdContract, onSelect } = props;
    // console.log(`ContractNumber contract: ${JSON.stringify(contract, null, 4)}`);

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
    const { presetValue, idContract, config, onSelect } = props;

    // const [idContract, setIdContract] = useState(presetValue ? presetValue : null);
    const [typeWork, setTypeWork] = useState({});
    const [typesWork, setTypesWork] = useState([]);

    // Загрузка видов работ
    async function fetchTypesWork(contractId) {
        const typesWork = await TaskService.getTypesWork(contractId);
        // console.log(`typesWork: ${JSON.stringify(typesWork, null, 4)}`);

        if (typesWork && typesWork.length) setTypesWork(typesWork);
        if (presetValue) {
            typesWork.forEach(elem => {
                if (elem?.id === presetValue) {
                    setTypeWork(elem);
                    onSelect('typeWork', elem);
                }
            });
        }
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
        // if (idContract) setTypeWork(fetchTypesWork(idContract));
        // else setTypeWork({});
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
    const { presetValue, config, directorError, onSelect } = props;
    // console.log(`Director presetValue: ${JSON.stringify(presetValue, null, 4)}`);

    const [statePopup, setStatePopup] = useState(false);
    const [director, setDirector] = useState(presetValue ?? {});

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
            <div
                className="popup__wrapper-field"
                data-error={directorError && Object.keys(directorError).length !== 0 ? directorError?.message : null}
            >
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
            </div>
        </li>
    ) : null;
}

// Исполнитель
function Executor(props) {
    const { presetValue, config, executorError, onSelect } = props;
    // console.log(`Executor presetValue: ${JSON.stringify(presetValue, null, 4)}`);

    const [statePopup, setStatePopup] = useState(false);
    const [executor, setExecutor] = useState(presetValue ?? {});

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
        });
    }

    useEffect(() => {
        if (!executor || Object.keys(executor).length === 0) fetchDefaultExecutor();
    }, []);

    return !config?.hidden ? (
        <li className="popup__content-user popup-content-item">
            <h2 className="popup-content-title">Исполнитель</h2>
            <div
                className="popup__wrapper-field"
                data-error={executorError && Object.keys(executorError).length !== 0 ? executorError?.message : null}
            >
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
            </div>
        </li>
    ) : null;
}

// Завершенность
function Completeness(props) {
    const { presetValue, config, onSelect } = props;
    const [checked, setChecked] = useState(0);

    function onChangeCompleteness() {
        // console.log(`res done ${!checked}`);
        setChecked(+!checked);
        onSelect('done', +!checked);
    }

    useEffect(() => {
        if (!presetValue || presetValue === null) {
            setChecked(0);
            onSelect('done', 0);
        }
        setChecked(presetValue);
        onSelect('done', presetValue);
    }, []);

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
    const { presetValue, config, onSelect, switchPopup } = props;

    const [parentTask, setParentTask] = useState({});
    const [allTasks] = useState(() => {
        const tempAllTasks = Object.assign({}, TaskService.getAllTasks(config?.tasksData, {}));
        if (config?.taskForDelete) delete tempAllTasks[config?.taskForDelete];
        return tempAllTasks;
    });

    // Выбор род.задачи
    function onSelectParentTask(task) {
        // console.log(`onSelectParentTask value: ${JSON.stringify(task, null, 4)}`);
        setParentTask(task);
        // onSelect('parentId', value);
        onSelect('parentId', task?.value);
    }

    // Удалить род.задачу
    function onDeleteParentTask() {
        setParentTask(null);
        // onSelect('parentId', null);
        onSelect('parentId', null);
    }

    // Открыть задачу
    async function onOpenTask() {
        const { task, ...otherElems } = config?.popupData;

        // Выбранная род.задача
        const selectedTask = { ...allTasks[parentTask?.value] };
        // Получение информации о задаче
        const newTask = await TaskService.getTaskInfo(selectedTask?.id, selectedTask?.parentId);

        // switchPopup('update', 'editTask', { ...otherElems, task: allTasks[parentTask?.value] });
        switchPopup('update', 'editTask', { ...otherElems, task: newTask });
    }

    useEffect(() => {
        if (config?.taskForDelete) delete allTasks[config?.taskForDelete];
        if (presetValue) {
            if (presetValue in allTasks) {
                const parentTaskData = { value: presetValue, title: allTasks[presetValue]?.task ?? 'Нет данных' };
                setParentTask(parentTaskData);
                onSelect('parentId', parentTaskData?.value);
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
    const { presetValue, config, taskError, onChange, onSelect } = props;

    const [taskName, setTaskName] = useState(null);

    function onChangeTaskName(e) {
        setTaskName(e.target.value);
        onChange(e);
    }

    useEffect(() => {
        setTaskName(presetValue ?? '');
        onSelect('task', presetValue ?? '');
    }, []);

    return !config?.hidden ? (
        <li className="popup__content-task popup-content-item">
            <h2 className="popup-content-title">Задача</h2>
            <div className="popup__wrapper-field" data-error={taskError ? taskError.message : null}>
                <textarea className="txt-area-task" name="task" value={taskName} onChange={e => onChangeTaskName(e)} />
            </div>
        </li>
    ) : null;
}

// Дата начала
function CommencementDate(props) {
    const { presetValue, config, onSelect } = props;
    // console.log(`CommencementDate presetValue: ${presetValue}`);

    const [calendarState, setCalendarState] = useState(false);
    const [startDate, setStartDate] = useState(presetValue ?? {});

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
    const [deadline, setDeadline] = useState(presetValue ?? {});

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

// Планируемые времязатраты
function PlannedTimeCosts(props) {
    const { presetValue, plannedTimeCostsError, onSelect, onChange } = props;

    const [plannedTimeCosts, setPlannedTimeCosts] = useState(null);

    // Обработка потери фокуса
    function onFocusOut(e) {
        const plannedTime = Number(e.target.value.replace(/,/g, '.')).toFixed(1);

        setPlannedTimeCosts(plannedTime);
        onSelect('plannedTimeCosts', plannedTime);
    }

    // Изменение времени
    function onChangePlannedTime(e) {
        setPlannedTimeCosts(e.target.value.replace(/,/g, '.'));
        onChange(e);
    }

    useEffect(() => {
        setPlannedTimeCosts(presetValue ?? 0);
        onSelect('plannedTimeCosts', presetValue ?? 0);
    }, []);

    return (
        <li className="popup__content-timecosts popup-content-item">
            <h2 className="popup-content-title">План. времязатраты, ч</h2>
            <div
                className="popup__wrapper-field"
                data-error={plannedTimeCostsError ? plannedTimeCostsError.message : null}
            >
                <div className="popup__date-wrapper ">
                    <div className="popup__timecosts popup-task-date">
                        <input
                            className="popup-task-date-input"
                            name="plannedTimeCosts"
                            type="text"
                            placeholder="0.00"
                            value={plannedTimeCosts}
                            onBlur={onFocusOut}
                            onChange={onChangePlannedTime}
                        />
                    </div>
                </div>
            </div>
        </li>
    );
}

// Комментарий
function Comment(props) {
    const { presetValue, config, onChange, onChangeByKey } = props;
    const [comment, setComment] = useState('');
    // const [comment, setComment] = useState('');

    function onChangeTaskName(e) {
        setComment(e.target.value);
        onChange(e);
    }

    useEffect(() => {
        if (presetValue) {
            setComment(presetValue);
            onChangeByKey('comment', presetValue);
        }
    }, []);

    return !config?.hidden ? (
        <div className="popup__content-comment popup-content-item">
            <h2 className="popup-content-title">Комментарий</h2>
            <textarea className="txt-area-comment" name="comment" value={comment} onChange={e => onChangeTaskName(e)} />
        </div>
    ) : null;
}

// Раздел обсуждения задач
function MattermostDiscussionTasks({ idPost }) {
    return (
        <iframe
            title="Mattermost Discussion Tasks"
            src={`https://mm-mpk.ru/mosproektkompleks/pl/${idPost}`}
            style={{ width: '100%', height: '100%', border: 'none' }}
        />
    );
}

// Подзадача
function TaskItem(props) {
    const { taskItem, popupData, config, switchPopup } = props;
    const { navigate, addToHistory, appTheme } = config;
    // console.log(`taskItem: ${JSON.stringify(taskItem, null, 4)}`);

    // Открыть задачу
    async function onOpenTask() {
        const { task, ...otherElems } = popupData;

        // Получение информации о задаче
        const newTask = await TaskService.getTaskInfo(taskItem?.id, taskItem?.parentId);

        switchPopup('update', 'editTask', { ...otherElems, task: newTask });
        // switchPopup('update', 'editTask', { ...otherElems, task: newTask });
    }

    // Переход к профилю пользователя
    function onClickUser(user) {
        startTransition(() => {
            addToHistory(`${window.location.pathname}`);
            navigate(`../../user/${user?.mmId}/profile/profile/`, {
                state: { idEmployee: user?.mmId, path: `${window.location.pathname}` }
            });
        });
    }

    return (
        <ul className="popup__table-row">
            {/* Задача */}
            <li className="popup__table-row-cell popup__table-row-cell-task">
                <div className="popup__table-cell-subtask" onClick={onOpenTask}>
                    {taskItem?.task ?? 'Нет данных'}
                </div>
            </li>
            {/* Статус */}
            <li className="popup__table-row-cell popup__table-row-cell-status">{taskItem?.status ?? 'Нет данных'}</li>
            {/* Дата начала */}
            <li className="popup__table-row-cell">{taskItem?.dateStart || taskItem?.startDate || 'Нет данных'}</li>
            {/* Дедлайн */}
            <li className="popup__table-row-cell">
                {taskItem?.deadlineTask && Object.keys(taskItem?.deadlineTask).length !== 0
                    ? taskItem?.deadlineTask?.value
                    : 'Нет данных'}
            </li>
            {/* Постановщик */}
            <li className="popup__table-row-cell">
                <div className="popup__table-cell-user">
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
            <li className="popup__table-row-cell">
                <div className="popup__table-cell-user">
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
        </ul>
    );
}

function TaskInfo(props) {
    const { config, taskInfoConf, setSubtaskApi } = props;
    const { popupData, taskData, switchPopup } = taskInfoConf;
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
        tempSubTask.parentId = prevTask?.id;

        // Установка пользователей по умолчанию
        tempSubTask.director = await TaskService.getAuthorizedEmployee(Cookies.get('MMUSERID'));
        tempSubTask.executor = await TaskService.getAuthorizedEmployee(Cookies.get('MMUSERID'));

        setSubTask(tempSubTask);
        // Передаем функцию в родительский компонент TablesPopup
        setSubtaskApi({ addSubtask: () => addSubtask(tempSubTask) });
    }

    // Добавление подзадачи
    function addSubtask(subTaskData) {
        const { task, ...otherElems } = popupData;
        // switchPopup('addSubTask', { ...otherElems, task: subTask });
        switchPopup('creation', 'addSubTask', { ...otherElems, task: subTaskData });
    }

    useEffect(() => {
        // Инициализация данных подзадачи
        initSubtask();
    }, []);

    return (
        <div className="popup__task-form-row">
            <div
                className={classNames('popup__table-wrapper', {
                    'popup__table-wrapper_empty': !taskData || taskData.length === 0
                })}
            >
                {taskData && taskData.length !== 0 ? (
                    <div className="popup__table-content">
                        <ul className="popup__table-head popup__table-head-subtasks">
                            <li className="popup__table-header-item">Задача</li>
                            <li className="popup__table-header-item">Статус</li>
                            <li className="popup__table-header-item">Дата начала</li>
                            <li className="popup__table-header-item">Дедлайн</li>
                            <li className="popup__table-header-item">Постановщик</li>
                            <li className="popup__table-header-item">Исполнитель</li>
                        </ul>
                        <div className="popup__table-body-wrapper">
                            <div className="popup__table-body">
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
                ) : (
                    <h2>Данные отсутствуют</h2>
                )}
            </div>
        </div>
    );
}

// Строка времязатрат
function TimeCostsItem(props) {
    const { immutableVals, timeCost, config, onOpenPopup } = props;
    const { navigate, addToHistory, appTheme } = config;

    // Редактирование времязатрат
    function onEditTimeCost() {
        // console.log(`onEditTimeCost timeCost: ${JSON.stringify(timeCost, null, 4)}`);
        onOpenPopup('update', 'editTimeCost', { immutableVals, timeCostData: timeCost });
    }

    // Выбор пользователя
    function onClickUser(user) {}

    return (
        <ul className="popup__table-row popup__timecosts-list">
            {/* Дата */}
            <li className="popup__table-row-cell">{timeCost?.dateReport ?? 'Нет данных'}</li>
            {/* Потраченное время */}
            <li className="popup__table-row-cell">{timeCost?.spent ?? 'Нет данных'}</li>
            {/* Исполнитель */}
            <li className="popup__table-row-cell">
                <div className="popup__table-cell-user">
                    {timeCost?.executor && Object.keys(timeCost?.executor).length !== 0 ? (
                        <div onClick={() => onClickUser(timeCost?.executor)}>
                            <BgFillText
                                type="p"
                                text={timeCost?.executor?.fullName}
                                bgColor={appTheme === 'dark' ? '#4c4c4e' : '#f1f1f1'}
                            />
                        </div>
                    ) : (
                        <BgFillText type="p" text="Нет данных" bgColor={appTheme === 'dark' ? '#4c4c4e' : '#f1f1f1'} />
                    )}
                </div>
            </li>
            {/* Время в часах */}
            <li className="popup__table-row-cell">{Number(timeCost?.timeHours).toFixed(2) ?? 'Нет данных'}</li>
            {/* Комментарий */}
            <li className="popup__table-row-cell">
                <textarea className="popup__table-cell-txt-area" name="comment" value={timeCost?.report ?? ''} />
            </li>
            {/* Редактировать */}
            <li className="popup__table-row-cell">
                {timeCost?.executor?.mmId === Cookies.get('MMUSERID') ? (
                    <IconButton
                        nameClass="icon-btn__add-director icon-btn__add-user"
                        type="button"
                        icon="edit.svg"
                        onClick={onEditTimeCost}
                    />
                ) : null}
            </li>
        </ul>
    );
}

// Таблица врмязатрат
function TimeCosts(props) {
    const { refreshTask, config, timeCostsConf, setTimeCostsApi, refreshTaskData } = props;
    const { taskInfo, timeCosts } = timeCostsConf;

    const [popupState, setPopupState] = useState(false);
    const [popupInfo, setPopupInfo] = useState({ operation: null, key: null, data: null });
    const [timeCostsData, setTimeCostsData] = useState([]);
    const [totalTime, setTotalTime] = useState(0);

    // Конфигурация по всплывающим окнам
    const POPUP_CONF = {
        'addTimeCost': (
            <TimeCostsPopup
                data={popupInfo?.data}
                popupConf={{
                    additClass: 'workingtime-task',
                    title: 'Время работы над задачей (Новая запись)',
                    operation: popupInfo?.operation,
                    popupState,
                    setPopupState,
                    refreshTaskData
                }}
                config={config}
            />
        ),
        'editTimeCost': (
            <TimeCostsPopup
                data={popupInfo?.data}
                popupConf={{
                    additClass: 'workingtime-task',
                    title: 'Время работы над задачей (Редактирование)',
                    operation: popupInfo?.operation,
                    popupState,
                    setPopupState,
                    refreshTaskData
                }}
                config={config}
            />
        )
    };

    // Открыть всплывающее окно
    function onOpenPopup(operation, key, data = null) {
        setPopupState(true);
        setPopupInfo({
            operation,
            key,
            data
        });
    }

    // Инициализация
    async function initTimeCost() {
        const timeCostData = {};

        timeCostData.task = taskInfo?.task;
        timeCostData.dateReport = getDateInSpecificFormat(new Date(), {
            format: 'YYYYMMDD',
            separator: '-'
        });
        timeCostData.employee = await TaskService.getAuthorizedEmployee(Cookies.get('MMUSERID'));
        timeCostData.spent = null;
        timeCostData.report = null;
        timeCostData.timeHours = null;

        setTimeCostsApi({
            openPopup: () => onOpenPopup('creation', 'addTimeCost', { immutableVals: taskInfo, timeCostData })
        });
    }

    useEffect(() => {
        refreshTaskData();
        initTimeCost();
    }, []);

    useEffect(() => {
        setTimeCostsData(refreshTask?.timeCosts && refreshTask?.timeCosts?.length !== 0 ? refreshTask?.timeCosts : []);
    }, [refreshTask]);

    useEffect(() => {
        // Общее время
        let total = 0;

        if (timeCostsData && timeCostsData.length !== 0) timeCostsData?.forEach(item => (total += item?.timeHours));

        setTotalTime(Number(total).toFixed(2));
    }, [timeCostsData]);

    // console.log(`timeCostsData: ${JSON.stringify(timeCostsData, null, 4)}`);

    return (
        <div className="popup__task-form-row">
            <div
                className={classNames('popup__table-wrapper', {
                    'popup__table-wrapper_empty': !timeCostsData || timeCostsData.length === 0
                })}
            >
                {timeCostsData && timeCostsData.length !== 0 ? (
                    <div className="popup__table-content">
                        <ul className="popup__table-head popup__table-head-timecosts">
                            <li className="popup__table-header-item">Дата</li>
                            <li className="popup__table-header-item">Потраченное время</li>
                            <li className="popup__table-header-item">Сотрудник</li>
                            <li className="popup__table-header-timehours popup__table-header-item">
                                Время в часах
                                <p>
                                    Факт. времязатраты: <span>{totalTime} ч.</span>
                                </p>
                            </li>
                            <li className="popup__table-header-item">Комментарий</li>
                            <li className="popup__table-header-item">&emsp;</li>
                        </ul>
                        <div className="popup__table-body-wrapper">
                            <div className="popup__table-body">
                                {timeCostsData?.map((timeCost, ind) => {
                                    const { idExecutor, idMMExecutor, executorFIO, ...otherElems } = timeCost;
                                    return (
                                        <TimeCostsItem
                                            key={ind}
                                            immutableVals={taskInfo}
                                            timeCost={{
                                                ...otherElems,
                                                executor: {
                                                    id: idExecutor,
                                                    mmId: idMMExecutor,
                                                    fullName: executorFIO
                                                }
                                            }}
                                            config={config}
                                            onOpenPopup={onOpenPopup}
                                            refreshTaskData={refreshTaskData}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                ) : (
                    <h2>Данные отсутствуют</h2>
                )}
            </div>
            {popupState ? createPortal(POPUP_CONF[popupInfo?.key] ?? null, document.getElementById('root')) : null}
        </div>
    );
}

// Соисполнитель
function CoExecutorItem(props) {
    const { taskId, coExecutor, setIsModalOpen, setDataToDelete } = props;

    // Удаление соисполнителя
    function onDeleteCoExecutor() {
        setIsModalOpen(true);
        setDataToDelete({ employeeId: +coExecutor?.id, taskId });
    }

    return (
        <ul className="popup__table-row popup__coexecutors-list">
            {/* ФИО */}
            <li className="popup__table-row-cell">{coExecutor?.fullName ?? 'Нет данных'}</li>
            {/* Должность */}
            <li className="popup__table-row-cell">{coExecutor?.post ?? 'Нет данных'}</li>
            {/* Моб. телефон */}
            <li className="popup__table-row-cell">{coExecutor?.phone ?? 'Нет данных'}</li>
            {/* Удалить */}
            <li className="popup__table-row-cell">
                <div className="icon-btn__delete icon-btn" onClick={onDeleteCoExecutor}>
                    <span>&#128465;</span>
                </div>
            </li>
        </ul>
    );
}

// Таблица Соисполнителей
function CoExecutors(props) {
    const { refreshTask, config, setCoExecutorsApi, refreshTaskData } = props;
    const { task } = config;

    const [statePopup, setStatePopup] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [coExecutorsData, setCoExecutorsData] = useState([]);
    const [dataToDelete, setDataToDelete] = useState(null);

    // Удаление сотрудника
    async function onDeleteCoExecutor() {
        const success = await TaskService.deleteCoExecutor(dataToDelete?.employeeId, dataToDelete?.taskId);
        if (success) refreshTaskData();
    }

    // Выбор сотрудника
    async function onSelectCoExecutor(user) {
        const tempData = coExecutorsData && coExecutorsData.length !== 0 ? [...coExecutorsData] : [];
        const coExecutorsIds = tempData.map(item => +item?.id);
        // tempData.push(user);

        if (!coExecutorsIds.includes(+user?.id)) {
            tempData.push(user);
            setCoExecutorsData(tempData);

            await TaskService.addCoExecutor(+user?.id, task?.id);
            refreshTaskData();
        }
        // onSelect('coExecutors', tempData);
    }

    useEffect(() => {
        // refreshTaskData();
        setCoExecutorsApi({
            onShowPopup: () => setStatePopup(true)
        });
    }, []);

    useEffect(() => {
        setCoExecutorsData(
            refreshTask?.coExecutors && refreshTask?.coExecutors?.length !== 0 ? refreshTask.coExecutors : []
        );
    }, [refreshTask]);

    return (
        <div className="popup__task-form-row">
            <div
                className={classNames('popup__table-wrapper', {
                    'popup__table-wrapper_empty': !coExecutorsData || coExecutorsData.length === 0
                })}
            >
                {coExecutorsData && coExecutorsData.length !== 0 ? (
                    <div className="popup__table-content">
                        <ul className="popup__table-head popup__table-head-coexecutors">
                            <li className="popup__table-header-item">ФИО</li>
                            <li className="popup__table-header-item">Должность</li>
                            <li className="popup__table-header-item">Мобильный телефон</li>
                            <li className="popup__table-header-item">&emsp;</li>
                        </ul>
                        <div className="popup__table-body-wrapper">
                            <div className="popup__table-body">
                                {coExecutorsData?.map(coExecutor => (
                                    <CoExecutorItem
                                        coExecutor={coExecutor}
                                        taskId={task?.id}
                                        setIsModalOpen={setIsModalOpen}
                                        setDataToDelete={setDataToDelete}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <h2>Данные отсутствуют</h2>
                )}
            </div>
            {statePopup
                ? createPortal(
                      <UsersPopupWindow
                          additClass="add_user"
                          overlay={true}
                          statePopup={statePopup}
                          setStatePopup={setStatePopup}
                          selectUser={onSelectCoExecutor}
                      />,
                      document.getElementById('portal')
                  )
                : null}
            {isModalOpen ? (
                <ModalWindow
                    additClass="action-selection"
                    modalWindowConf={{
                        type: 'confirm',
                        title: 'Вы действительно хотите удалить соисполнителя?',
                        onDelete: onDeleteCoExecutor
                    }}
                    statePopup={isModalOpen}
                    actionRef={onDeleteCoExecutor}
                    setStatePopup={setIsModalOpen}
                />
            ) : null}
        </div>
    );
}

// Разделы с таблицами
function TablesPopup(props) {
    const { config, refreshTask, taskInfoConfig, timeCostsConfig, coExecutorsConfig, refreshTaskData } = props;

    const [selectedTab, setSelectedTab] = useState({ tab: 'subtasks' });
    const [subtaskApi, setSubtaskApi] = useState(null);
    const [timeCostsApi, setTimeCostsApi] = useState(null);
    const [coExecutorsApi, setCoExecutorsApi] = useState(null);

    // Выбор раздела
    function onSelectTab(value) {
        setSelectedTab({ tab: value });
    }

    // Конфигурация по разделам
    const TABS_TABLES_CONF = {
        subtasks: <TaskInfo config={config} taskInfoConf={taskInfoConfig} setSubtaskApi={setSubtaskApi} />,
        timecosts: (
            <TimeCosts
                refreshTask={refreshTask}
                config={config}
                timeCostsConf={timeCostsConfig}
                setTimeCostsApi={setTimeCostsApi}
                refreshTaskData={refreshTaskData}
            />
        ),
        coExecutors: (
            <CoExecutors
                refreshTask={refreshTask}
                config={coExecutorsConfig}
                setCoExecutorsApi={setCoExecutorsApi}
                refreshTaskData={refreshTaskData}
            />
        ),
        default: null
    };

    return (
        <div className="popup__task-form-tabs">
            <ul className="popup__task-form-tabs-header">
                <li
                    className={classNames('popup__task-form-tabs-header-item', {
                        'popup__task-form-tabs-header-item_active': selectedTab?.tab === 'subtasks'
                    })}
                    onClick={() => onSelectTab('subtasks')}
                >
                    Подзадачи
                    {selectedTab?.tab === 'subtasks' ? <span onClick={subtaskApi?.addSubtask}>+</span> : null}
                </li>
                <li
                    className={classNames('popup__task-form-tabs-header-item', {
                        'popup__task-form-tabs-header-item_active': selectedTab?.tab === 'timecosts'
                    })}
                    onClick={() => onSelectTab('timecosts')}
                >
                    Затраченное время
                    {selectedTab?.tab === 'timecosts' ? <span onClick={timeCostsApi?.openPopup}>+</span> : null}
                </li>
                <li
                    className={classNames('popup__task-form-tabs-header-item', {
                        'popup__task-form-tabs-header-item_active': selectedTab?.tab === 'coExecutors'
                    })}
                    onClick={() => onSelectTab('coExecutors')}
                >
                    Соисполнители
                    {selectedTab?.tab === 'coExecutors' ? <span onClick={coExecutorsApi?.onShowPopup}>+</span> : null}
                </li>
            </ul>
            <div className="popup__task-form-tabs-content">
                {TABS_TABLES_CONF[selectedTab?.tab] ?? TABS_TABLES_CONF.default}
            </div>
        </div>
    );
}

export default function TaskPopup(props) {
    const { additClass, title, data, taskOperation, popupState, setPopupState, switchPopup } = props;

    const theme = localStorage.getItem('appTheme');
    const operationData = TaskService.getDataFormOperation(taskOperation);

    const [isLoading, setIsLoading] = useState(false);

    const [idContract, setIdContract] = useState(data?.idContract ?? null);
    const [contractsIDs, setContractsIDs] = useState({});

    const [refreshTask, setRefreshTask] = useState(null);

    const { values, errorsInfo, onChange, onChangeByKey, onClick, getModalConfig, checkData } = useTaskForm(
        TaskService.getTaskData(data?.task, operationData?.disabledFields),
        operationData?.disabledFields
    );

    // const socket = useContext(SocketContext);
    const { addToHistory } = useHistoryContext();
    const navigate = useNavigate();

    // console.log(`data?.task: ${JSON.stringify(data?.task, null, 4)}`);
    // console.log(`TaskPopup errorsInfo: ${JSON.stringify(errorsInfo, null, 4)}`);
    console.log(`TaskPopup deleteInfo: ${JSON.stringify(getModalConfig(refreshTask), null, 4)}`);

    // console.log(`values: ${JSON.stringify(values, null, 4)}`);
    // console.log(`operationData: ${JSON.stringify(operationData, null, 4)}`);
    // console.log(`TaskPopup data: ${JSON.stringify(data, null, 4)}`);

    // Удаление задачи
    async function onDeleteTask() {
        if (data?.task && Object.keys(data?.task).length !== 0) {
            await TaskService.deleteTask(data?.task?.id, Cookies.get('MMUSERID'));
            setPopupState(false);
            navigate(window.location.pathname);
        }
    }

    // Обновить данные по задаче
    async function refreshTaskData() {
        // Получение информации о задаче
        const taskData = await TaskService.getTaskInfo(data?.task?.id, data?.task?.parentTaskId);

        setRefreshTask(taskData);
    }

    // Получение идентификаторов
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

        // Создание новой задачи
        if (taskOperation === 'creation') {
            const resultData = {
                typeWorkId: values?.typeWork?.id,
                contractId: idContract ?? null,
                directorId: values?.director?.id,
                executorId: values?.executor?.id,
                dateStart: values?.dateStart,
                deadline: values?.deadlineTask?.value,
                plannedTimeCosts: Number(values?.plannedTimeCosts),
                parentId: values?.parentId,
                task: values?.task,
                comment: values?.comment
            };

            if (checkData()) {
                // alert(`Add task data: ${JSON.stringify(values, null, 4)}`);
                await TaskService.addTask(resultData, null, {
                    director: values?.director,
                    executor: values?.executor
                });

                setPopupState(false);
                navigate(window.location.pathname);
            }
        }
        // Редактирование задачи
        if (taskOperation === 'update') {
            const resultData = {
                status: values?.status?.title,
                typeWorkId: values?.idTypeWork,
                contractId: idContract,
                directorId: values?.director?.id,
                executorId: values?.executor?.id,
                taskId: data?.task?.id,
                dateStart: values?.dateStart,
                deadline: values?.deadlineTask?.value,
                plannedTimeCosts: Number(values?.plannedTimeCosts),
                parentId: values?.parentId,
                done: !values?.done || values?.done === null ? 0 : values?.done,
                task: values?.task,
                comment: values?.comment
            };

            if (checkData()) {
                // alert(`Edit task resultData: ${JSON.stringify(resultData, null, 4)}`);
                // alert(`Edit task values: ${JSON.stringify(values, null, 4)}`);
                await TaskService.editTask(resultData);
                setPopupState(false);
                navigate(window.location.pathname);
            }
        }
    }

    useEffect(() => {
        refreshTaskData();
    }, []);

    useEffect(() => {
        // Загрузка номеров договоров
        fetchContractsIDs();
    }, [idContract]);

    return (
        <>
            <div id="portal"></div>
            <InputDataPopup
                idForm="task-form"
                title={title}
                additClass={additClass}
                overlay={true}
                modalWindowConf={getModalConfig(refreshTask)}
                statePopup={popupState}
                setStatePopup={setPopupState}
                onDelete={
                    EMPLOYEE_ACTIONS?.delete(taskOperation, data?.task?.director?.mmId, Cookies.get('MMUSERID'))
                        ? onDeleteTask
                        : null
                }
            >
                <form
                    id="task-form"
                    className="popup__task-form"
                    // className="popup__content-add-task popup-content"
                    onSubmit={e => onOnSubmitData(e)}
                >
                    <div
                        className={classNames('popup__add-task-form', {
                            'popup__edit-task-form': taskOperation === 'update'
                        })}
                    >
                        {/* Цепочка статусов */}
                        {taskOperation === 'update' ? (
                            <StatusChain
                                presetValue={data?.task?.status}
                                director={values?.director}
                                executor={values?.executor}
                                onSelect={onClick}
                            />
                        ) : null}
                        <ul className="popup__task-form-left">
                            {/* Номер договора */}
                            <ContractNumber
                                contract={{
                                    id: idContract
                                }}
                                isLoading={isLoading}
                                contractsIDs={contractsIDs}
                                config={{
                                    partition: data?.partition,
                                    hidden: operationData?.hiddenFields?.typeWork ? true : false,
                                    contractOperations: data?.contractOperations
                                }}
                                setIdContract={setIdContract}
                                onSelect={onClick}
                            />
                            {/* Вид работы */}
                            <TypeWork
                                presetValue={data?.task?.idTypeWork}
                                idContract={idContract}
                                config={{ hidden: operationData?.hiddenFields?.typeWork ? true : false }}
                                setIdContract={setIdContract}
                                onSelect={onClick}
                            />
                            {/* Постановщик */}
                            <Director
                                presetValue={data?.task?.director}
                                config={{
                                    appTheme: theme,
                                    hidden: operationData?.hiddenFields?.director ? true : false
                                }}
                                directorError={errorsInfo?.director}
                                onSelect={onClick}
                            />
                            {/* Исполнитель */}
                            <Executor
                                presetValue={data?.task?.executor}
                                config={{
                                    appTheme: theme,
                                    hidden: operationData?.hiddenFields?.executor ? true : false
                                }}
                                executorError={errorsInfo?.executor}
                                onSelect={onClick}
                            />
                            {/* Родительская задача */}
                            <ParentsTasks
                                presetValue={data?.task?.parentId}
                                config={{
                                    hidden: operationData?.hiddenFields?.parentTask,
                                    popupData: { ...data },
                                    taskForDelete: +data?.task?.id,
                                    // добавляем к массиву задачу которая может не отображаться т.к. пользователь может не являться
                                    // исполнителем или постановщиком задачи
                                    tasksData: [...data?.tasks, data?.task?.parent]
                                }}
                                onSelect={onClick}
                                switchPopup={switchPopup}
                            />
                            {/* Название задачи */}
                            <TaskName
                                presetValue={data?.task?.task}
                                config={{ hidden: operationData?.hiddenFields?.task ? true : false }}
                                taskError={errorsInfo?.task}
                                onChange={onChange}
                                onSelect={onClick}
                            />
                            {/* Дата начала */}
                            <CommencementDate
                                presetValue={data?.task?.dateStart || data?.task?.startDate}
                                config={{ hidden: operationData?.hiddenFields?.dateStart ? true : false }}
                                onSelect={onClick}
                            />
                            {/* Дедлайн */}
                            <DeadlineTask
                                presetValue={data?.task?.deadlineTask}
                                config={{ hidden: operationData?.hiddenFields?.deadlineTask ? true : false }}
                                onSelect={onClick}
                            />
                            <PlannedTimeCosts
                                presetValue={data?.task?.plannedTimeCosts}
                                plannedTimeCostsError={errorsInfo?.plannedTimeCosts}
                                onSelect={onClick}
                                onChange={onChange}
                            />
                            {/* Комментарий */}
                            <Comment
                                presetValue={data?.task?.comment}
                                config={{ hidden: operationData?.hiddenFields?.comment ? true : false }}
                                onChange={onChange}
                                onChangeByKey={onChangeByKey}
                            />
                        </ul>
                        <div className="popup__task-form-right">
                            {/* Обсуждение задачи */}
                            <MattermostDiscussionTasks idPost={data?.task?.idPost} />
                        </div>
                    </div>
                    {/* Разделы таблиц */}
                    {taskOperation === 'update' ? (
                        <TablesPopup
                            config={{
                                appTheme: theme,
                                taskOperation,
                                navigate,
                                addToHistory
                            }}
                            refreshTask={refreshTask}
                            taskInfoConfig={{
                                popupData: { ...data },
                                taskData: data?.task?.subtasks,
                                switchPopup
                            }}
                            timeCostsConfig={{
                                taskInfo: {
                                    // добавляем к массиву задачу которая может не отображаться т.к. пользователь может не являться
                                    // исполнителем или постановщиком задачи
                                    allTasks: data?.tasks,
                                    task: {
                                        id: data?.task?.id,
                                        title: data?.task?.task,
                                        parentTaskId: data?.task?.parent?.id,
                                        contract: {
                                            id: idContract,
                                            data: contractsIDs
                                        },
                                        director: data?.task?.director ?? {},
                                        executor: data?.task?.executor ?? {}
                                    }
                                }
                            }}
                            coExecutorsConfig={{
                                task: {
                                    id: data?.task?.id,
                                    parentTaskId: data?.task?.parent?.id
                                }
                            }}
                            refreshTaskData={refreshTaskData}
                            onSelect={onClick}
                        />
                    ) : null}
                </form>
            </InputDataPopup>
        </>
    );
}
