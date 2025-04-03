import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import classNames from 'classnames';

// Импорт компонентов
import FiltersGantt from './filters/FiltersGantt';

// Импорт конфигураций
import { MONTHS } from '@config/calendar.config';

// Импорт кастомных хуков
import { useGanttMode } from '@hooks/useGanttMode';
import { useFiltersGantt } from '@hooks/useFiltersGantt';

// Импорт дополнительного функционала
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
    const {
        timeLine,
        totalTasks,
        selectedItemInd,
        dateState,
        modeConfig,
        ganttConfig,
        bgColorTask,
        onHideTasks,
        onSelectItem
    } = props;

    return (
        <div className="gantt-grid__main-row">
            <div
                className="gantt-task-main-title gantt-task-title"
                style={{ backgroundColor: `${bgColorTask}` }}
                onClick={onHideTasks}
            >
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
            </div>
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
    const { timeLine, partition, task, dateState, config, dataOperations } = props;

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
                    {timeLine && Object.keys(timeLine).length !== 0
                        ? timeLine?.data?.map(day => {
                              const idTask =
                                  task?.dateOfEnding && task?.dateOfEnding === day ? task?.contractNum : null;
                              return (
                                  <li id={idTask} className="gantt-time-period-cell">
                                      {task?.dateOfStart && task?.dateOfStart === day ? (
                                          <DurationTask
                                              additClass="gantt-time-period-cell__task"
                                              data={{
                                                  dateOfStart: timeLine?.data?.indexOf(task?.dateOfStart),
                                                  duration: daysDiff,
                                                  bgColorTask: task?.bgColorTask
                                              }}
                                          />
                                      ) : null}
                                  </li>
                              );
                          })
                        : null}
                </ul>
            </div>
            {/* Отображение подзадач */}
            {showTasks && task?.tasks && task?.tasks.length !== 0
                ? task?.tasks.map(task => (
                      <TaskRow
                          timeLine={timeLine}
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
    const { timeLine, partition, gantt, dateState, selectedItemInd, modeConfig, onSelectItem } = props;

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
    }, [gantt?.data]);

    return gantt?.data && Object.keys(gantt?.data).length !== 0 ? (
        <div className="gantt-grid-wrapper">
            <div className="gantt-grid">
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
                                      let today = new Date();
                                      today.setMonth(today.getMonth() + 1);

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
                                              ref={
                                                  today.getMonth() === getDateFromString(day).getMonth()
                                                      ? getLastDayOfMonth(today) ===
                                                        getLastDayOfMonth(getDateFromString(day))
                                                          ? refCurrMonth
                                                          : null
                                                      : null
                                              }
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
                        selectedItemInd={selectedItemInd}
                        dateState={dateState}
                        modeConfig={modeConfig}
                        ganttConfig={gantt?.config}
                        bgColorTask={gantt?.data?.bgColorTask}
                        onHideTasks={onHideTasks}
                        onSelectItem={onSelectItem}
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
                              />
                          ))
                        : null}
                </div>
            </div>
        </div>
    ) : null;
}

export default function GanttMode({ data, modeConfig }) {
    // Сохраненные значения выпадающего списка
    const [ganttFilters, setGanttFilters] = useState(
        JSON.parse(localStorage.getItem('gantt-filters')) || {
            responsible: 0,
            section: 0,
            services: 0
        }
    );
    const { OPTIONS_FILTER_CONF, activeFilters, filteredData, onChangeFilter } = useFiltersGantt(
        modeConfig?.modeOption,
        data
    );
    const { timeLine, ganttConfig, formData } = useGanttMode({
        data: filteredData,
        selectedItemInd: ganttFilters[modeConfig?.modeOption?.key],
        modeOption: modeConfig?.modeOption
    });

    // Состояние текущей даты
    const [dateState] = useState({ year: new Date().getFullYear(), month: new Date().getMonth() });
    // Данные для диаграммы Ганта
    const [ganttData, setGanttData] = useState({});

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

    return ganttConfig && ganttConfig.length !== 0 ? (
        <div className="gantt-mode">
            <FiltersGantt
                activeFilters={activeFilters}
                optionsFilter={OPTIONS_FILTER_CONF}
                keys={['stage']}
                onChangeFilter={onChangeFilter}
            />
            <GanttChart
                timeLine={timeLine}
                gantt={{ config: ganttConfig, data: ganttData }}
                dateState={dateState}
                selectedItemInd={ganttFilters[modeConfig?.modeOption?.key]}
                modeConfig={modeConfig}
                onSelectItem={onSelectItem}
            />
        </div>
    ) : null;
}
