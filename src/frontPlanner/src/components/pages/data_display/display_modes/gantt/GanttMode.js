import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import classNames from 'classnames';

// Импорт конфигураций
import { MONTHS } from '@config/calendar.config';

// Импорт дополнительного функционала
import { useGanttMode } from '@hooks/useGanttMode';
import {
    getDaysBetweenTwoDates,
    getLastDayOfMonth,
    getDateFromString,
    getDateInSpecificFormat,
    getDaysYear,
    getDayInYear
} from '@helpers/calendar';
import { isObject, findNestedObj } from '@helpers/helper';

// Импорт стилей
import './gantt_mode.css';

// Продолжительность задачи
function DurationTask(props) {
    const { additClass, data, draggable, onDragStartHandler, onDragEndHandler } = props;

    return (
        <div
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
    const { totalTasks, selectedItem, dateState, modeOption, bgColorTask, onHideTasks } = props;

    return (
        <div className="gantt-grid__main-row">
            <div
                className="gantt-task-main-title gantt-task-title"
                style={{ backgroundColor: `${bgColorTask}` }}
                onClick={onHideTasks}
            >
                <img src="/img/arrow_down_bl.png" alt="Arrow" />
                <span>
                    {selectedItem && Object.keys(selectedItem).length !== 0
                        ? selectedItem[modeOption?.uniqueness]
                        : 'Нет данных'}
                </span>
                {/* <span>{selectedItem[modeOption?.uniqueness]}</span> */}
            </div>
            <div className="gantt-empty-row"></div>
            <ul className="gantt-time-period">
                {getDaysYear(dateState).map(day => {
                    let dateVal = getDateInSpecificFormat(day, {
                        format: 'YYYYMMDD',
                        separator: '-'
                    });
                    return (
                        <li className="gantt-time-period-cell">
                            {totalTasks.map(totalTask => {
                                return totalTask && totalTask.length !== 0 ? (
                                    totalTask[0] === dateVal ? (
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
                })}
            </ul>
        </div>
    );
}

// Отображение задач
function TaskRow(props) {
    const {
        partition,
        task,
        dateState,
        config,
        dataOperations
        // onHideSubtasks
        // onDragStartHandler,
        // onDragEndHandler,
        // onDragOverHandler,
        // onDropHandler
    } = props;

    const containTasks = task && Object.keys(task).length !== 0 ? 'tasks' in task : false;
    let daysDiff = getDaysBetweenTwoDates(
        getDateFromString(task?.dateOfStart),
        getDateFromString(task?.dateOfEnding)
    ).length;

    const [showTasks, setShowTasks] = useState(true);
    const navigate = useNavigate();
    // console.log(`tasks: ${JSON.stringify(tasks, null, 4)}`);

    // Скрытие задач
    function onHideTasks() {
        setShowTasks(!showTasks);
    }

    // Перемещение к задаче
    function onMoveToTask(e, id) {
        e.preventDefault();
        const element = document.getElementById(id);
        if (element) element.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }

    // Просмотр подробной информации о ...
    function onShowInfo(task, operationVal) {
        console.log(`task: ${JSON.stringify(task, null, 4)}`);
        localStorage.setItem('idContract', JSON.stringify(task?.contractId));

        const NAVIGATION_CONF = {
            user: () => {
                alert('../../user');
            },
            contract: () => {
                const navigationArg = {
                    state: {
                        idContract: task?.contractId,
                        tabForm: { key: 'general', title: 'Общие' },
                        partition: partition,
                        dataOperation: findNestedObj(dataOperations, 'key', operationVal)
                    }
                };
                navigate('../../dataform/general/', navigationArg);
            },
            task: () => {
                const navigationArg = {
                    state: {
                        idContract: task?.contractId,
                        tabForm: { key: 'works', title: 'Работа и задачи' },
                        partition: partition,
                        dataOperation: findNestedObj(dataOperations, 'key', operationVal)
                    }
                };
                navigate(`../../dataform/works/${task?.contractId}`, navigationArg);
            }
        };
        return task?.navKey in NAVIGATION_CONF ? NAVIGATION_CONF[task?.navKey]() : null;
    }

    //   console.log(`task: ${JSON.stringify(task, null, 4)}`);

    return (
        <>
            <div className="gantt-grid__main-row">
                {containTasks ? (
                    <div className="gantt-task-title-wrapper" style={{ paddingLeft: `${config.indent / 16}rem` }}>
                        <div className="gantt-task-title" onClick={() => onShowInfo(task, 'update')}>
                            <span>{task?.title}</span>
                        </div>
                        <div className="gantt-task-images">
                            <img src="/img/eye.png" alt="" onClick={onHideTasks} />
                            {task?.dateOfStart && task?.dateOfEnding ? (
                                <img src="/img/ic_move.png" alt="" onClick={e => onMoveToTask(e, task?.contractNum)} />
                            ) : null}
                        </div>
                    </div>
                ) : (
                    <div className="gantt-task-wrapper" style={{ paddingLeft: `${config.indent / 16}rem` }}>
                        <div
                            className={classNames('gantt-task-title', {
                                'gantt-task-title_done': task?.done
                            })}
                            onClick={() => onShowInfo(task, 'update')}
                        >
                            <span>{task?.title}</span>
                        </div>
                        {task?.dateOfStart && task?.dateOfEnding ? (
                            <img src="/img/ic_move.png" alt="" onClick={e => onMoveToTask(e, task?.contractNum)} />
                        ) : null}
                    </div>
                )}
                <div className="gantt-empty-row"></div>
                <ul className="gantt-time-period">
                    {getDaysYear(dateState).map(day => {
                        let dateVal = getDateInSpecificFormat(day, {
                            format: 'YYYYMMDD',
                            separator: '-'
                        });
                        const idTask = task?.dateOfEnding && task?.dateOfEnding === dateVal ? task?.contractNum : null;
                        return (
                            <li id={idTask} className="gantt-time-period-cell">
                                {task?.dateOfStart && task?.dateOfStart === dateVal ? (
                                    <DurationTask
                                        additClass="gantt-time-period-cell__task"
                                        data={{
                                            dateOfStart: getDayInYear(getDateFromString(task?.dateOfStart)),
                                            duration: daysDiff,
                                            bgColorTask: task?.bgColorTask
                                        }}
                                    />
                                ) : null}
                            </li>
                        );
                    })}
                </ul>
            </div>
            {/* Отображение подзадач */}
            {showTasks && task?.tasks && task?.tasks.length !== 0
                ? task?.tasks.map(task => (
                      <TaskRow
                          partition={partition}
                          task={task}
                          dateState={dateState}
                          config={{ indent: config.indent * 2 }}
                          dataOperations={dataOperations}
                      />
                  ))
                : null}
        </>
    );
}

function GanttChart(props) {
    const { partition, ganttData, dateState, selectedItem, modeOption, dataOperations } = props;

    const [showTasks, setShowTasks] = useState(true);
    // const [currTask, setCurrTask] = useState({});
    const refCurrMonth = useRef(null);

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
    // console.log(`new Data: ${JSON.stringify(ganttData, null, 4)}`);

    useEffect(() => {
        refCurrMonth?.current?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }, [ganttData]);

    return ganttData && Object.keys(ganttData).length !== 0 ? (
        <div className="gantt-grid-wrapper">
            <div className="gantt-grid">
                <div className="gantt-grid__header">
                    <div className="gantt-grid__header-row">
                        <div className="gantt-task-empty gantt-task-row"></div>
                        <div className="gantt-empty-row"></div>
                        <ul className="gantt-time-months gantt-time-period">
                            {MONTHS.map(month => (
                                <li className="gantt-time-period">{month}</li>
                            ))}
                        </ul>
                    </div>
                    <div className="gantt-grid__header-row">
                        <div className="gantt-task-empty gantt-task-row"></div>
                        <div className="gantt-empty-row"></div>
                        <ul className="gantt-time-year gantt-time-period">
                            {getDaysYear(dateState).map(day => {
                                let today = new Date();
                                // Прибавить текущей дате еще один месяц
                                today.setMonth(today.getMonth() + 1);

                                let currDate = getDateInSpecificFormat(new Date(), {
                                    format: 'YYYYMMDD',
                                    separator: '-'
                                });
                                let date = getDateInSpecificFormat(day, {
                                    format: 'YYYYMMDD',
                                    separator: '-'
                                });
                                // console.log(`lastDayOfCurrMonth: ${lastDayOfCurrMonth}`);
                                return (
                                    <li
                                        className={classNames('gantt-time-period__day gantt-time-period', {
                                            'gantt-time-period__curr-day': currDate === date
                                        })}
                                        ref={
                                            today.getMonth() === day.getMonth()
                                                ? getLastDayOfMonth(today) === getLastDayOfMonth(day)
                                                    ? refCurrMonth
                                                    : null
                                                : null
                                        }
                                    >
                                        {day.getDate()}
                                        {currDate === date ? (
                                            <div
                                                className="gantt-time__vr-line"
                                                style={{ height: `${(ganttData?.totalCount + 1) * 100}%` }}
                                            ></div>
                                        ) : null}
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </div>
                <div className="gantt-grid__main">
                    {/* Отображение суммы всех задач */}
                    <TotalTaskRow
                        totalTasks={ganttData?.totalTasks}
                        selectedItem={selectedItem}
                        dateState={dateState}
                        modeOption={modeOption}
                        bgColorTask={ganttData?.bgColorTask}
                        onHideTasks={onHideTasks}
                    />
                    {/* Отображение задач */}
                    {ganttData?.tasks?.length !== 0
                        ? ganttData?.tasks?.map(task => (
                              <TaskRow
                                  partition={partition}
                                  task={task}
                                  dateState={dateState}
                                  config={{ indent: 10 }}
                                  dataOperations={dataOperations}
                              />
                          ))
                        : null}
                </div>
            </div>
        </div>
    ) : null;
}

export default function GanttMode({ data, modeConfig }) {
    // Выбранный элемент выпадающего списка
    const [selectedItemInd, setSelectedItemInd] = useState(
        +localStorage.getItem(`gantt-filter_${modeConfig?.modeOption?.key}`) || 0
    );
    // Состояние текущей даты
    const [dateState] = useState({ year: new Date().getFullYear(), month: new Date().getMonth() });
    // Данные для диаграммы Ганта
    const [ganttData, setGanttData] = useState({});

    const { ganttConfig, formData } = useGanttMode({
        data,
        selectedItemInd,
        modeOption: modeConfig?.modeOption
    });
    // console.log(`ganttConfig: ${JSON.stringify(ganttConfig, null, 4)}`);

    function onSelectItem(e) {
        setSelectedItemInd(e.target.value);
        localStorage.setItem(`gantt-filter_${modeConfig?.modeOption?.key}`, e.target.value);
    }

    useEffect(() => {
        const ganttChartData = formData(data, ganttConfig[selectedItemInd], modeConfig?.modeOption);
        setGanttData(ganttChartData);
        console.log(`ganttChartData: ${JSON.stringify(ganttChartData, null, 4)}`);
    }, [selectedItemInd, modeConfig?.modeOption]);

    useEffect(() => {
        const ganttFilter = +localStorage.getItem(`gantt-filter_${modeConfig?.modeOption?.key}`);
        // localStorage.setItem('gantt-filter', 0);
        if (ganttFilter && ganttFilter !== -1) setSelectedItemInd(ganttFilter);
        else {
            localStorage.setItem(`gantt-filter_${modeConfig?.modeOption?.key}`, 0);
            setSelectedItemInd(0);
        }
    }, [modeConfig]);

    return ganttConfig && ganttConfig.length !== 0 ? (
        <div className="gantt-mode">
            <select className="gantt-mode__select-list" onChange={onSelectItem}>
                {ganttConfig?.map((headline, index) => {
                    if (isObject(headline) && Object.keys(headline).length !== 0) {
                        return (
                            <option key={headline?.title} value={index} selected={selectedItemInd === index}>
                                {headline[modeConfig?.modeOption?.uniqueness]}
                            </option>
                        );
                    }
                })}
            </select>
            <GanttChart
                ganttData={ganttData}
                dateState={dateState}
                selectedItem={ganttConfig[selectedItemInd]}
                modeOption={modeConfig?.modeOption}
                dataOperations={modeConfig?.dataOperations}
            />
        </div>
    ) : null;
}
