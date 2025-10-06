import { startTransition, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import classNames from 'classnames';

// Импорт компонентов
import FiltersGantt from './filters/FiltersGantt';
import TaskPopup from '@components/pages/data_display/data_form/tabs/tab_work/popups/task/TaskPopup';
import TaskService from '@services/popups/popup_task.service';

// Импорт конфигураций
import { MONTHS } from '@config/calendar.config';

// Импорт кастомных хуков
import { useGanttMode } from '@hooks/useGanttMode';
import { useFiltersGantt } from '@hooks/useFiltersGantt';

// Импорт дополнительного функционала
import { isObject, isArray, findNestedObj } from '@helpers/helper';
import {
    getDaysBetweenTwoDates,
    getLastDayOfMonth,
    getDateFromString,
    getDateInSpecificFormat,
    getDaysYear,
    getDayInYear,
    getAddedDay
} from '@helpers/calendar';

// Импорт контекста
import { useHistoryContext } from '../../../../../contexts/history.context';

// Импорт стилей
import './gantt_mode.css';
import { createPortal } from 'react-dom';
import GanttService from '../../../../../services/display_modes/gantt.service';

function AssignedUser({ employee }) {
    const { addToHistory } = useHistoryContext();
    const navigate = useNavigate();

    // Переход к разделу с инфой о пользователе
    function showInfoEmployee() {
        if (employee?.mmId && employee?.mmId !== -1) {
            const navigationArg = {
                state: {
                    idEmployee: employee?.mmId,
                    path: `${window.location.pathname}`
                }
            };
            startTransition(() => {
                addToHistory(`${window.location.pathname}`);
                navigate(`../../user/${employee?.mmId}/profile/profile/`, navigationArg);
            });
        }
    }

    return employee && Object.keys(employee).length !== 0 ? (
        <div
            className={classNames('gantt-task-assigned-user', {
                'gantt-task-assigned-user_backlight': employee?.authorizedUser
            })}
            onClick={showInfoEmployee}
        >
            <img className="gantt-task-assigned-user__photo" src={employee?.photo} alt="" />
            <div className="gantt-task-assigned-user__info">
                <h2 className="gantt-task-assigned-user__fullname">{employee?.fullName || 'Нет данных'}</h2>
                {employee?.role ? (
                    <p className="gantt-task-assigned-user__role">{employee?.role || 'Нет данных'}</p>
                ) : null}
            </div>
        </div>
    ) : null;
}

// Продолжительность задачи
function DurationTask(props) {
    const { additClass, data, draggable, onDragStartHandler, onDragEndHandler } = props;

    return (
        <div
            id={`${data?.id}`}
            className={`${additClass} gantt-time-period-cell-task`}
            draggable={draggable}
            onDragStart={e => onDragStartHandler(e, data)}
            onDragEnd={e => onDragEndHandler(e)}
            style={{
                gridColumn:
                    data?.duration && data?.duration !== 0 ? `${data?.dateOfStart} / span ${data?.duration}` : null,
                backgroundColor: data?.bgColorTask
            }}
        ></div>
    );
}

// Отображение суммы всех задач
function TotalTaskRow(props) {
    const {
        timeLine,
        totalTasks,
        // selectedItemInd,
        // dateState,
        // modeConfig,
        // ganttConfig,
        bgColorTask,
        onHideTasks
        // onSelectItem
    } = props;

    return (
        <div className="gantt-grid__main-row">
            <div className="gantt-task-title gantt-task-main-title" onClick={null}></div>
            <div className="gantt-empty-row"></div>
            <ul className="gantt-time-period">
                {timeLine && Object.keys(timeLine).length !== 0
                    ? timeLine?.data?.map(day => {
                          return (
                              <li className="gantt-time-period-cell">
                                  {totalTasks.map(totalTask => {
                                      return totalTask && totalTask.length !== 0 ? (
                                          totalTask[0] === day ? (
                                              <DurationTask
                                                  additClass="gantt-time-period-cell__total-task"
                                                  data={{
                                                      dateOfStart: getDayInYear(getDateFromString(totalTask[0])),
                                                      duration: totalTask.length,
                                                      bgColorTask: bgColorTask
                                                  }}
                                                  draggable={false}
                                              />
                                          ) : null
                                      ) : null;
                                  })}
                              </li>
                          );
                      })
                    : null}
            </ul>
        </div>
    );
}

// Отображение задач
function TaskRow(props) {
    const { timeLine, partition, task, dateState, config, dataOperations, setPopupState, openPopup } = props;

    const { addToHistory } = useHistoryContext();
    const navigate = useNavigate();

    const containTasks = task && Object.keys(task).length !== 0 ? 'tasks' in task : false;
    let daysDiff = getDaysBetweenTwoDates(
        getDateFromString(task?.dateOfStart),
        getDateFromString(task?.dateOfEnding)
    ).length;

    const [showTasks, setShowTasks] = useState(false);

    // console.log(`tasks: ${JSON.stringify(tasks, null, 4)}`);

    // Скрытие задач
    function onHideTasks() {
        setShowTasks(!showTasks);
    }

    // Перемещение к задаче
    function onMoveToTask(e, task) {
        // alert(`onMoveToTask: ${JSON.stringify(task?.id, null, 4)}`);
        e.preventDefault();

        const moveElement = document.getElementById(task?.moveElemId);
        const backlightElement = document.getElementById(task?.contractNum);

        if (moveElement) moveElement.scrollIntoView({ block: 'center', behavior: 'smooth' });
        if (backlightElement) {
            backlightElement.classList.add('backlight');
            setTimeout(() => {
                backlightElement.classList.remove('backlight');
            }, 1500);
        }
    }

    // Просмотр подробной информации о ...
    function onShowInfo(event, task, operationVal) {
        // console.log(`task: ${JSON.stringify(task, null, 4)}`);
        localStorage.setItem('idContract', JSON.stringify(task?.contractId));

        const NAVIGATION_CONF = {
            user: () => {
                if (task?.idEmployee && task?.idEmployee !== -1) {
                    const navigationArg = {
                        state: {
                            idEmployee: task?.idEmployee,
                            path: `${window.location.pathname}`
                        }
                    };
                    startTransition(() => {
                        addToHistory(`${window.location.pathname}`);
                        navigate(`../../user/${task?.idEmployee}/profile/profile/`, navigationArg);
                    });
                }
            },
            contract: () => {
                if (task?.contractId && task?.contractId !== -1) {
                    const navigationArg = {
                        state: {
                            idContract: task?.contractId,
                            tabForm: { key: 'general', title: 'Общие' },
                            partition: partition,
                            path: `${window.location.pathname}`,
                            dataOperation: findNestedObj(dataOperations, 'key', operationVal)
                        }
                    };
                    startTransition(() => {
                        addToHistory(`${window.location.pathname}`);
                        if (event && event.button === 1) {
                            const url = `../../dataform/general?data=${encodeURIComponent(
                                JSON.stringify(navigationArg.state)
                            )}`;
                            window.open(url, '_blank');
                        } else navigate('../../dataform/general/', navigationArg);
                        // window.open('../../dataform/general/', '_blank');
                    });
                    localStorage.setItem('selectedTab', JSON.stringify({ key: 'general', title: 'Общие' }));
                }
            },
            task: async () => {
                if (task?.contractId && task?.contractId !== -1) {
                    if (event && event.button === 0) {
                        // Работаем пока здесь
                        const tasksContract = await GanttService.getTasksContract(task?.contractId);
                        // Получение информации о задаче
                        const taskData = await TaskService.getTaskInfo(+task?.taskId, +task?.parentTaskId);

                        setPopupState(true);
                        openPopup('update', 'editTask', {
                            idContract: task?.contractId,
                            partition,
                            tasks: tasksContract || [],
                            task: taskData,
                            contractOperations: findNestedObj(dataOperations, 'key', operationVal)
                        });
                    }

                    if (event && event.button === 1) {
                        const url = `${window.location.pathname}?data=${encodeURIComponent(
                            JSON.stringify({
                                idContract: task?.contractId,
                                rowItem: 'task',
                                partition,
                                taskInfo: { id: +task?.taskId, parentTaskId: +task?.parentTaskId },
                                contractOperations: findNestedObj(dataOperations, 'key', operationVal)
                            })
                        )}`;
                        window.open(url, '_blank');
                    }

                    // localStorage.setItem('selectedTab', JSON.stringify({ key: 'works', title: 'Работа и задачи' }));
                }
            }
        };

        return task?.navKey in NAVIGATION_CONF ? NAVIGATION_CONF[task?.navKey]() : null;
    }

    // console.log(`gantt task data: ${JSON.stringify(task, null, 4)}`);

    return (
        <>
            <div className="gantt-grid__main-row">
                {containTasks ? (
                    <div className="gantt-task-title-wrapper" style={{ paddingLeft: `${config.indent / 16}rem` }}>
                        {isObject(task?.title) && Object.keys(task?.title).length !== 0 ? (
                            <p
                                className="gantt-task-title"
                                onClick={() => onShowInfo(null, task, 'update')}
                                onMouseDown={e => onShowInfo(e, task, 'update')}
                            >
                                {task?.title?.fullName ?? null}
                                <span className="gantt-task-title__span">{task?.title?.contractNum}</span>
                                {task?.title?.address}
                                {task?.title?.company}
                            </p>
                        ) : (
                            <p
                                // className="gantt-task-title"
                                className={classNames('gantt-task-title', {
                                    'gantt-task-title_done': +task?.done === 1
                                })}
                                onClick={() => onShowInfo(null, task, 'update')}
                                onMouseDown={e => onShowInfo(e, task, 'update')}
                            >
                                {task?.title}
                            </p>
                        )}
                        <div className="gantt-task-actions">
                            {task?.tasks && task.tasks.length !== 0 ? (
                                <button
                                    className="gantt-task-actions__btn-hide gantt-task-btn-action"
                                    onClick={onHideTasks}
                                >
                                    {showTasks
                                        ? String.fromCharCode(parseInt('2212', 16))
                                        : String.fromCharCode(parseInt('002B', 16))}
                                </button>
                            ) : null}
                            {task?.dateOfStart && task?.dateOfEnding ? (
                                <button className="gantt-task-btn-action" onClick={e => onMoveToTask(e, task)}>
                                    &#11122;
                                </button>
                            ) : null}
                        </div>
                    </div>
                ) : (
                    <div className="gantt-task-wrapper" style={{ paddingLeft: `${config.indent / 16}rem` }}>
                        <div
                            className={classNames('gantt-task-title', {
                                'gantt-task-title_done': +task?.done
                            })}
                            onClick={() => onShowInfo(null, task, 'update')}
                            onMouseDown={e => onShowInfo(e, task, 'update')}
                        >
                            {/* <span>{task?.title?.contractNum ?? task?.title?.name}</span>
                            {task?.title?.address ?? task?.title?.model}
                            {task?.title?.company} */}
                            <span>{task?.title}</span>
                        </div>
                        {task?.dateOfStart && task?.dateOfEnding ? (
                            <button className="gantt-task-btn-action" onClick={e => onMoveToTask(e, task)}>
                                &#11122;
                            </button>
                        ) : null}
                    </div>
                )}
                <div className="gantt-empty-row"></div>
                <ul className={classNames('gantt-time-period', { 'top-divide': task?.navKey === 'contract' })}>
                    {timeLine && Object.keys(timeLine).length !== 0
                        ? timeLine?.data?.map(day => {
                              //   const idTask =
                              //       task?.dateOfEnding && task?.dateOfEnding === day ? task?.contractNum : null;
                              const idTask = task?.dateOfEnding && task?.dateOfEnding === day ? task?.moveElemId : null;
                              return (
                                  <li
                                      id={idTask}
                                      className="gantt-time-period-cell"
                                      style={idTask ? { position: 'relative', scrollMargin: '500px' } : null}
                                  >
                                      {task?.dateOfStart && task?.dateOfStart === day ? (
                                          <DurationTask
                                              additClass="gantt-time-period-cell__task"
                                              data={{
                                                  id: task?.contractNum,
                                                  dateOfStart: timeLine?.data?.indexOf(task?.dateOfStart),
                                                  duration: daysDiff,
                                                  bgColorTask: task?.bgColorTask,
                                                  assignedUsers: task?.assignedUsers
                                              }}
                                          />
                                      ) : null}
                                      {task?.dateOfEnding && task?.dateOfEnding === day ? (
                                          task?.assignedUsers && task?.assignedUsers?.length !== 0 ? (
                                              <div className="gantt-time-period-cell__users">
                                                  {task?.assignedUsers?.length !== 0
                                                      ? task?.assignedUsers.map(user => (
                                                            <AssignedUser employee={user} />
                                                        ))
                                                      : null}
                                              </div>
                                          ) : null
                                      ) : null}
                                  </li>
                              );
                          })
                        : null}
                </ul>
            </div>
            {/* Отображение подзадач */}
            {showTasks && task?.tasks && isArray(task?.tasks) && task?.tasks.length !== 0
                ? task?.tasks.map(task => (
                      <TaskRow
                          timeLine={timeLine}
                          partition={partition}
                          task={task}
                          dateState={dateState}
                          config={{ indent: config.indent * 2 }}
                          dataOperations={dataOperations}
                          setPopupState={setPopupState}
                          openPopup={openPopup}
                      />
                  ))
                : null}
        </>
    );
}

function GanttChart(props) {
    const {
        timeLine,
        partition,
        gantt,
        dateState,
        selectedItemInd,
        modeConfig,
        onSelectItem,
        setPopupState,
        openPopup
    } = props;

    const [showTasks, setShowTasks] = useState(true);
    // const [currTask, setCurrTask] = useState({});
    const ganttGridMain = useRef(null);
    const refCurrMonth = useRef(null);

    const location = useLocation();

    // Конфигурация по обработке направлений
    const PROCESSING_DIRECTIONS_CONF = {
        task: async queryData => {
            const tasksContract = await GanttService.getTasksContract(queryData?.idContract);
            // Получение информации о задаче
            const taskData = await TaskService.getTaskInfo(queryData?.taskInfo?.id, queryData?.taskInfo?.parentTaskId);

            // Установил чтобы не дергалось окно
            setTimeout(() => {
                setPopupState(true);
                openPopup('update', 'editTask', {
                    idContract: queryData?.idContract,
                    partition,
                    tasks: tasksContract || [],
                    task: taskData,
                    contractOperations: queryData?.contractOperations
                });
            }, 500);
        }
    };

    // Скрытие основных задач
    function onHideTasks() {
        setShowTasks(!showTasks);
    }

    // Скрытие подзадач
    // function onHideSubtasks(indTask) {}

    // Обработка события в момент захвата объекта
    // function onDragStart(e, data) {}

    // Обработка события в момент отпускания объекта
    // function onDragEnd(e) {}

    // Обработка события в процессе движения перемещаемого объекта
    // function onDragOver(e) {}

    // Обработка события в момент отпускания объекта
    // function onDrop(e, taskData) {}

    // console.log(`year: ${JSON.stringify(getDaysYear(dateState), null, 4)}`);
    // console.log(`new Data: ${JSON.stringify(gantt, null, 4)}`);

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const queryData = JSON.parse(decodeURIComponent(queryParams.get('data')));

        if (queryData && Object.keys(queryData).length !== 0) {
            if (queryData?.rowItem in PROCESSING_DIRECTIONS_CONF)
                PROCESSING_DIRECTIONS_CONF[queryData?.rowItem](queryData);
        }
    }, []);

    useEffect(() => {
        if (!ganttGridMain.current || !refCurrMonth.current) return;

        const container = ganttGridMain.current;
        const line = refCurrMonth.current;

        // текущая позиция полосы относительно контейнера
        const lineOffset = line.offsetLeft;

        // располагаем полосу по центру контейнера
        const targetScrollLeft = lineOffset - container.clientWidth / 2 + line.clientWidth / 2;

        ganttGridMain?.current?.scrollTo({ left: targetScrollLeft + 500, behavior: 'smooth' });
    }, [gantt?.data]);

    return gantt?.data && Object.keys(gantt?.data).length !== 0 ? (
        <div
            className={classNames('gantt-grid-wrapper', {
                'gantt-grid-wrapper_empty': !gantt?.data?.tasks || gantt?.data?.tasks.length === 0
            })}
        >
            {gantt?.data?.tasks && gantt?.data?.tasks.length !== 0 ? (
                <div ref={ganttGridMain} className="gantt-grid">
                    <div className="gantt-grid__header">
                        <div className="gantt-grid__header-row">
                            <div className="gantt-task-empty gantt-task-row"></div>
                            <div className="gantt-empty-row"></div>
                            <ul className="gantt-time-months gantt-time-period">
                                {timeLine && Object.keys(timeLine).length !== 0
                                    ? timeLine?.years?.map(year => {
                                          return MONTHS.map(month => (
                                              <li className="gantt-time-period">
                                                  {month}&ensp;&mdash;&ensp;{year}
                                              </li>
                                          ));
                                      })
                                    : null}
                            </ul>
                        </div>
                        <div className="gantt-grid__header-row">
                            <div className="gantt-task-empty gantt-task-row"></div>
                            <div className="gantt-empty-row"></div>
                            <ul className="gantt-time-year gantt-time-period">
                                {timeLine && Object.keys(timeLine).length !== 0
                                    ? timeLine?.data.map(day => {
                                          let currDate = getDateInSpecificFormat(new Date(), {
                                              format: 'YYYYMMDD',
                                              separator: '-'
                                          });
                                          let date = day;
                                          return (
                                              <li
                                                  className={classNames('gantt-time-period__day gantt-time-period', {
                                                      'gantt-time-period__curr-day': currDate === date
                                                  })}
                                                  ref={currDate === date ? refCurrMonth : null}
                                              >
                                                  {getDateFromString(day).getDate()}
                                                  {currDate === date ? (
                                                      <div
                                                          className="gantt-time__vr-line"
                                                          style={{
                                                              height: `${(gantt?.data?.totalCount + 1) * 100}%`
                                                          }}
                                                      ></div>
                                                  ) : null}
                                              </li>
                                          );
                                      })
                                    : null}
                            </ul>
                        </div>
                    </div>
                    <div className="gantt-grid__main">
                        {/* Отображение суммы всех задач */}
                        <TotalTaskRow
                            timeLine={timeLine}
                            totalTasks={gantt?.data?.totalTasks}
                            // selectedItemInd={selectedItemInd}
                            // dateState={dateState}
                            // modeConfig={modeConfig}
                            // ganttConfig={gantt?.config}
                            bgColorTask={gantt?.data?.bgColorTask}
                            onHideTasks={onHideTasks}
                            // onSelectItem={onSelectItem}
                        />
                        {/* Отображение задач */}
                        {gantt?.data?.tasks?.length !== 0
                            ? gantt?.data?.tasks?.map(task => (
                                  <TaskRow
                                      timeLine={timeLine}
                                      partition={partition}
                                      task={task}
                                      dateState={dateState}
                                      config={{ indent: 10 }}
                                      dataOperations={modeConfig?.dataOperations}
                                      setPopupState={setPopupState}
                                      openPopup={openPopup}
                                  />
                              ))
                            : null}
                    </div>
                </div>
            ) : (
                <p className="gantt-mode__info-message">Данные отсутствуют</p>
            )}
        </div>
    ) : null;
}

export default function GanttMode(props) {
    const { partition, data, modeConfig } = props;

    // Сохраненные значения выпадающего списка
    const [ganttFilters, setGanttFilters] = useState(
        JSON.parse(localStorage.getItem('gantt-filters')) || {
            responsible: 0,
            section: 0,
            services: 0
        }
    );

    const [popupState, setPopupState] = useState(false);
    const [popupInfo, setPopupInfo] = useState({
        operation: null,
        mode: null,
        data: null
    });

    const { OPTIONS_FILTER_CONF, activeFilters, filteredData, onChangeFilter } = useFiltersGantt(
        partition,
        modeConfig?.modeOption,
        data
    );
    const { timeLine, ganttConfig, formData } = useGanttMode({
        partition,
        data,
        filteredData,
        selectedItemInd: ganttFilters[modeConfig?.modeOption?.key],
        modeOption: modeConfig?.modeOption,
        authorizedUserId: Cookies.get('MMUSERID') || null
    });

    // Состояние текущей даты
    const [dateState] = useState({ year: new Date().getFullYear(), month: new Date().getMonth() });
    // Данные для диаграммы Ганта
    const [ganttData, setGanttData] = useState({});

    // Конфигурация по всплывающим окнам
    const POPUP_CONF = {
        'addSubTask': (
            <TaskPopup
                key={`key${
                    +popupInfo?.data?.editingTask?.id + Date.now().toString(36) + Math.random().toString(36).substr(2)
                }`}
                additClass="add-task"
                title="Новая подзадача"
                data={popupInfo?.data}
                taskOperation={popupInfo?.operation}
                popupState={popupState}
                setPopupState={setPopupState}
                switchPopup={switchPopup}
            />
        ),
        'editTask': (
            <TaskPopup
                key={`key${
                    +popupInfo?.data?.editingTask?.id + Date.now().toString(36) + Math.random().toString(36).substr(2)
                }`}
                additClass="add-task"
                title="Редактирование задачи"
                data={popupInfo?.data}
                taskOperation={popupInfo?.operation}
                popupState={popupState}
                setPopupState={setPopupState}
                switchPopup={switchPopup}
            />
        )
    };

    // Открыть всплывающее окно
    function openPopup(operation, mode, data = null) {
        setPopupInfo({
            operation,
            mode,
            data
        });
    }

    // Переключить всплывающее окно
    function switchPopup(operation, mode, data) {
        setPopupInfo({ operation, mode, data });
    }

    function onSelectItem(e) {
        const tempGanttFilters = Object.assign({}, ganttFilters);
        tempGanttFilters[modeConfig?.modeOption?.key] = +e.target.value;

        setGanttFilters(tempGanttFilters);
        localStorage.setItem('gantt-filters', JSON.stringify(tempGanttFilters));
    }

    useEffect(() => {
        const oldStorageData = [
            'gantt-filter',
            'gantt-filter_undefined',
            'gantt-filter_responsible',
            'gantt-filter_section',
            'gantt-filter_services',
            'gantt-filter_participants',
            'gantt-filter_status'
        ];
        oldStorageData.forEach(item => localStorage.removeItem(item));
    }, []);

    useEffect(() => {
        setGanttData(formData());
    }, [activeFilters, filteredData]);

    useEffect(() => {
        setGanttData(formData());
    }, [ganttFilters[modeConfig?.modeOption?.key], modeConfig?.modeOption]);

    return (
        <div className="gantt-mode">
            {/* Создать отдельный компонент */}
            <div class="gantt-mode-filters">
                {ganttConfig && Object.keys(ganttConfig).length !== 0 ? (
                    <select className="gantt-mode__select-list" onChange={onSelectItem}>
                        {ganttConfig?.map((headline, index) => {
                            const selectedItemInd = ganttFilters[modeConfig?.modeOption?.key];
                            if (isObject(headline) && Object.keys(headline).length !== 0) {
                                return (
                                    <option
                                        key={headline?.title}
                                        className="gantt-mode__select-list-option"
                                        value={index}
                                        selected={selectedItemInd === index}
                                    >
                                        {headline[modeConfig?.modeOption?.uniqueness]}
                                    </option>
                                );
                            }
                        })}
                    </select>
                ) : null}
                {activeFilters && Object.keys(activeFilters).length !== 0 ? (
                    <FiltersGantt
                        activeFilters={activeFilters}
                        optionsFilter={OPTIONS_FILTER_CONF}
                        keys={['services', 'stage']}
                        onChangeFilter={onChangeFilter}
                    />
                ) : null}
            </div>
            <GanttChart
                timeLine={timeLine}
                gantt={{ config: ganttConfig, data: ganttData }}
                dateState={dateState}
                selectedItemInd={ganttFilters[modeConfig?.modeOption?.key]}
                modeConfig={modeConfig}
                onSelectItem={onSelectItem}
                setPopupState={setPopupState}
                openPopup={openPopup}
            />
            {popupState ? createPortal(POPUP_CONF[popupInfo?.mode] ?? null, document.getElementById('root')) : null}
        </div>
    );
}
