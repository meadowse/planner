import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Импорт конфигураций
import { MONTHS } from '@config/calendar.config';

// Импорт дополнительного функционала
import {
    getDaysBetweenTwoDates,
    getDateFromString,
    getDateInSpecificFormat,
    getDaysYear,
    getAddedDay,
    getDayInYear
} from '@helpers/calendar';
import { isObject, isArray, getUniqueData, findNestedObj, simplifyData } from '@helpers/helper';

// Импорт стилей
import './gantt_mode.css';

function getHeadlinesGantt(data, modeOption) {
    console.log(`modeOption: ${JSON.stringify(modeOption, null, 4)}`);
    if (data && data.length !== 0) {
        // Формирование заголовков по которым будут отфильтрованы данные для диаграммы Ганта
        const headlinesGantt = getUniqueData(data, modeOption)?.map(item => {
            if (modeOption && Object.keys(modeOption).length !== 0) {
                if (item && item[modeOption?.key] && modeOption?.key) {
                    if (isObject(item[modeOption?.key]) && Object.keys(item[modeOption?.key]).length !== 0)
                        return item[modeOption?.key];
                    else if (isArray(item[modeOption?.key]) && item[modeOption?.key].length !== 0) {
                        return item[modeOption?.key].map(subItem => {
                            return subItem;
                        });
                    } else return item[modeOption?.key];
                }
            }
        });
        console.log(`headlinesGantt: ${JSON.stringify(headlinesGantt, null, 4)}`);
        return headlinesGantt;
    }
    return [];
}

// Функция фильтрации данных
function getFilteredData(data, selectedItem, modeOption) {
    const simplifiedData = simplifyData(data);
    // Индексы найденных элементов
    const indexes = [];
    // Элементы которые нужно найти
    let elemsToFind =
        isArray(selectedItem) && selectedItem.length !== 0
            ? selectedItem.map(item => item[modeOption?.uniqueness]).sort((a, b) => a.localeCompare(b))
            : [];
    // Найденные элементы
    let foundElems = [];

    if (isArray(selectedItem) && selectedItem.length !== 0) {
        if (foundElems.length !== 0) foundElems = [];
        simplifiedData.forEach((item, indItem) => {
            foundElems = [];
            elemsToFind.forEach(elem => {
                if (item.includes(elem)) foundElems.push(elem);
            });
            foundElems = Array.from(new Set(foundElems)).sort((a, b) => a.localeCompare(b));
            if (JSON.stringify(elemsToFind) === JSON.stringify(foundElems)) indexes.push(indItem);
        });
    } else {
        simplifiedData.forEach((item, indItem) => {
            if (item.includes(selectedItem?.title)) indexes.push(indItem);
        });
    }

    return indexes.map(item => data[item]);
}

function initGanttChart(data, selectedItem, modeOption) {
    // console.log(`selectedItem: ${JSON.stringify(selectedItem, null, 4)}`);
    console.log(`data: ${JSON.stringify(data, null, 4)}`);
    const newData = {};
    const tasks = [];

    let filteredData = getFilteredData(data, selectedItem, modeOption),
        dateRanges = [],
        daysBetweenTwoDate = [];

    let newItem = {};
    let dateStart, dateEnd;

    //
    filteredData.forEach(item => {
        dateStart = getDateFromString(item?.dateOfStart?.value);
        dateEnd = getDateFromString(item?.dateOfEnding?.value);

        if (dateStart > dateEnd) {
            daysBetweenTwoDate = getDaysBetweenTwoDates(dateEnd, dateStart).map(date =>
                getDateInSpecificFormat(date, { format: 'YYYYMMDD', separator: '-' })
            );
        } else {
            daysBetweenTwoDate = getDaysBetweenTwoDates(dateStart, dateEnd).map(date =>
                getDateInSpecificFormat(date, { format: 'YYYYMMDD', separator: '-' })
            );
        }

        if (daysBetweenTwoDate && daysBetweenTwoDate.length !== 0) dateRanges.push(daysBetweenTwoDate);

        if (item?.tasks && item?.tasks.length !== 0) {
            item?.tasks.map(task => {
                dateStart = getDateFromString(task?.dateOfStart);
                dateEnd = getDateFromString(task?.dateOfEnding);

                if (dateStart > dateEnd) {
                    daysBetweenTwoDate = getDaysBetweenTwoDates(dateEnd, dateStart).map(date =>
                        getDateInSpecificFormat(date, { format: 'YYYYMMDD', separator: '-' })
                    );
                } else {
                    daysBetweenTwoDate = getDaysBetweenTwoDates(dateStart, dateEnd).map(date =>
                        getDateInSpecificFormat(date, { format: 'YYYYMMDD', separator: '-' })
                    );
                }

                if (daysBetweenTwoDate && daysBetweenTwoDate.length !== 0) dateRanges.push(daysBetweenTwoDate);
            });
        }
    });

    newData.totalTasks = dateRanges;
    newData.bgColorTask = '#E4E4E4';

    filteredData.forEach(item => {
        if (item && Object.keys(item).length !== 0) {
            newItem.id = item?.id;
            //
            newItem.title =
                (item?.address || 'Адрес отсутствует') +
                ` ${String.fromCodePoint(8212)} ` +
                (item?.contractNum || 'Номер договора отсутствует') +
                ` ${String.fromCodePoint(8212)} ` +
                (item?.company || 'Заказчик отсутствует');
            //
            newItem.contractNum = item?.contractNum;

            //
            if (getDateFromString(item?.dateOfStart?.value) > getDateFromString(item?.dateOfEnding?.value)) {
                newItem.dateOfStart = item?.dateOfEnding?.value;
                newItem.dateOfEnding = item?.dateOfStart?.value;
            } else {
                newItem.dateOfStart = item?.dateOfStart?.value;
                newItem.dateOfEnding = item?.dateOfEnding?.value;
            }

            //
            newItem.bgColorTask = item?.stage?.color;
            //
            newItem.visibleSubtasks = true;
            //
            newItem.subTasks =
                item?.tasks && item?.tasks.length !== 0
                    ? item?.tasks.map((task, ind) => {
                          return {
                              title: task?.title || 'Нет данных',
                              contractNum: `${item?.contractNum}_${ind + 1}`,
                              dateOfStart:
                                  getDateFromString(task?.dateOfStart) > getDateFromString(task?.dateOfEnding)
                                      ? task?.dateOfEnding
                                      : task?.dateOfStart,
                              dateOfEnding:
                                  getDateFromString(task?.dateOfEnding) > getDateFromString(task?.dateOfStart)
                                      ? task?.dateOfEnding
                                      : task?.dateOfStart,
                              bgColorTask: item?.stage?.color
                          };
                      })
                    : [];

            tasks.push(newItem);
            newItem = {};
        }
    });

    newData.tasks = tasks;

    return newData;
}

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

    return totalTasks && totalTasks.length !== 0 ? (
        <div className="gantt-grid__main-row">
            <div
                className="gantt-task-main-title gantt-task-title"
                style={{ backgroundColor: `${bgColorTask}` }}
                onClick={onHideTasks}
            >
                <img src="/img/arrow_down_bl.png" alt="Arrow" />
                {isArray(selectedItem) && selectedItem.length !== 0 ? (
                    <ul className="gantt-task-titles">
                        {selectedItem.map(item => (
                            <li>{item[modeOption?.uniqueness]}</li>
                        ))}
                    </ul>
                ) : (
                    <span>{selectedItem?.title}</span>
                )}
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
    ) : null;
}

// Отображение задач
function TaskRow(props) {
    const {
        tasks,
        dateState,
        indexTask,
        config,
        dataOperations,
        onHideSubtasks,
        onDragStartHandler,
        onDragEndHandler,
        onDragOverHandler,
        onDropHandler
    } = props;
    const navigate = useNavigate();
    // console.log(`tasks: ${JSON.stringify(tasks, null, 4)}`);

    // Перемещение к задаче
    function onMoveToTask(e, id) {
        e.preventDefault();
        const element = document.getElementById(id);
        if (element) element.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }

    async function onShowInfoCard(id, operationVal) {
        await axios.post(`${window.location.origin}/api/getAgreement`, { contractId: id }).then(response => {
            // console.log(`response: ${JSON.stringify(response, null, 4)}`);
            if (response.status === 200) {
                const navigationArg = {
                    state: {
                        data: response?.data[0],
                        dataOperation: findNestedObj(dataOperations, 'key', operationVal)
                    }
                };
                navigate('../../dataform/', navigationArg);
            }
        });
    }

    // console.log(`tasks: ${JSON.stringify(tasks, null, 4)}`);

    return tasks && tasks.length !== 0
        ? tasks?.map((task, indTask) => {
              let daysDiff = getDaysBetweenTwoDates(
                  getDateFromString(task?.dateOfStart),
                  getDateFromString(task?.dateOfEnding)
              ).length;
              //   console.log(`task: ${JSON.stringify(task, null, 4)}`);
              //   console.log(
              //       `title: ${task?.title}\ndateOfStart: ${task?.dateOfStart}\ndateOfEnding: ${task?.dateOfEnding}\ndaysDiff: ${daysDiff}`
              //   );

              return (
                  <>
                      <div className="gantt-grid__main-row">
                          {task?.subTasks && task?.subTasks.length !== 0 ? (
                              <div className="gantt-task-title-wrapper">
                                  <div className="gantt-task-title" onClick={() => onShowInfoCard(task?.id, 'update')}>
                                      <span>{task?.title}</span>
                                  </div>
                                  <div className="gantt-task-images">
                                      <img src="/img/eye.png" alt="" onClick={() => onHideSubtasks(indTask)} />
                                      {task?.dateOfStart && task?.dateOfEnding ? (
                                          <img
                                              src="/img/ic_move.png"
                                              alt=""
                                              onClick={e => onMoveToTask(e, task?.contractNum)}
                                          />
                                      ) : null}
                                  </div>
                              </div>
                          ) : (
                              <div className="gantt-task-wrapper" style={{ paddingLeft: `${config.indent / 16}rem` }}>
                                  <div className="gantt-task-title">
                                      <span>{task?.title}</span>
                                  </div>
                                  {task?.dateOfStart && task?.dateOfEnding ? (
                                      <img
                                          src="/img/ic_move.png"
                                          alt=""
                                          onClick={e => onMoveToTask(e, task?.contractNum)}
                                      />
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
                                  const idTask =
                                      task?.dateOfEnding && task?.dateOfEnding === dateVal ? task?.contractNum : null;
                                  return (
                                      <li
                                          id={idTask}
                                          className="gantt-time-period-cell"
                                          onDragOver={e => onDragOverHandler(e)}
                                          onDrop={e => {
                                              if (config?.subTasks)
                                                  onDropHandler(e, {
                                                      indTask: indexTask,
                                                      indSubTask: indTask,
                                                      dateOfStart: day,
                                                      duration: daysDiff
                                                  });
                                              else
                                                  onDropHandler(e, {
                                                      indTask: indTask,
                                                      indSubTask: -1,
                                                      dateOfStart: day,
                                                      duration: daysDiff
                                                  });
                                          }}
                                      >
                                          {task?.dateOfStart && task?.dateOfStart === dateVal ? (
                                              <DurationTask
                                                  additClass="gantt-time-period-cell__task"
                                                  data={{
                                                      indexes: config?.subTasks
                                                          ? {
                                                                task: indexTask,
                                                                subTask: indTask
                                                            }
                                                          : { task: indTask, subTask: -1 },
                                                      dateOfStart: getDayInYear(getDateFromString(task?.dateOfStart)),
                                                      duration: daysDiff,
                                                      bgColorTask: task?.bgColorTask
                                                  }}
                                                  draggable={true}
                                                  onDragStartHandler={onDragStartHandler}
                                                  onDragEndHandler={onDragEndHandler}
                                              />
                                          ) : null}
                                      </li>
                                  );
                              })}
                          </ul>
                      </div>
                      {/* Отображение подзадач */}
                      {task?.visibleSubtasks && task?.subTasks && task?.subTasks.length !== 0 ? (
                          <TaskRow
                              tasks={task?.subTasks}
                              dateState={dateState}
                              indexTask={indTask}
                              config={{ subTasks: true, indent: config.indent * 2 }}
                              onDragStartHandler={onDragStartHandler}
                              onDragEndHandler={onDragEndHandler}
                              onDragOverHandler={onDragOverHandler}
                              onDropHandler={onDropHandler}
                          />
                      ) : null}
                  </>
              );
          })
        : null;
}

function GanttChart(props) {
    const { data, dateState, selectedItem, modeOption, dataOperations } = props;

    const [ganttData, setGanttData] = useState({});
    const [showTasks, setShowTasks] = useState(true);
    const [showSubtasks, setShowSubtasks] = useState(true);
    const [currTask, setCurrTask] = useState({});

    // Скрытие основных задач
    function onHideTasks() {
        setShowTasks(!showTasks);
    }

    // Скрытие подзадач
    function onHideSubtasks(indTask) {
        // console.log(`gantt tasks: ${JSON.stringify(ganttData?.tasks, null, 4)}`);
        const data = ganttData;
        const tasks = data?.tasks;

        tasks[indTask].visibleSubtasks = !showSubtasks;
        data.tasks = tasks;

        setGanttData(data);
        setShowSubtasks(!showSubtasks);
    }

    // Обработка события в момент захвата объекта
    function onDragStart(e, data) {
        e.target.classList.add('gantt-time-period-cell-task_dragging');
        setCurrTask(data);
    }

    // Обработка события в момент отпускания объекта
    function onDragEnd(e) {
        e.target.classList.remove('gantt-time-period-cell-task_dragging');
    }

    // Обработка события в процессе движения перемещаемого объекта
    function onDragOver(e) {
        e.preventDefault();
    }

    // Обработка события в момент отпускания объекта
    function onDrop(e, taskData) {
        if (taskData?.indTask + taskData?.indSubTask === currTask?.indexes?.task + currTask?.indexes?.subTask) {
            let dateOfStart = taskData?.dateOfStart;
            let dateOfEnding = getAddedDay(dateOfStart, taskData?.duration - 1);

            dateOfStart = getDateInSpecificFormat(dateOfStart, {
                format: 'YYYYMMDD',
                separator: '-'
            });
            dateOfEnding = getDateInSpecificFormat(dateOfEnding, {
                format: 'YYYYMMDD',
                separator: '-'
            });

            const tempData = getFilteredData(Array.from(data), selectedItem, modeOption);

            if (taskData?.indSubTask !== -1) {
                const subTasks = tempData[taskData?.indTask]?.tasks;
                if (subTasks && subTasks.length !== 0) {
                    subTasks[taskData?.indSubTask].dateOfStart = dateOfStart;
                    subTasks[taskData?.indSubTask].dateOfEnding = dateOfEnding;
                    tempData[taskData?.indTask].tasks = subTasks;
                }
            } else {
                tempData[taskData?.indTask].dateOfStart.value = dateOfStart;
                tempData[taskData?.indTask].dateOfEnding.value = dateOfEnding;
            }

            setGanttData(initGanttChart(tempData, selectedItem, modeOption));
        }
    }

    // console.log(`year: ${JSON.stringify(getDaysYear(dateState), null, 4)}`);
    // console.log(`new Data: ${JSON.stringify(ganttData, null, 4)}`);

    useEffect(() => {
        const ganttChartData = initGanttChart(data, selectedItem, modeOption);
        setGanttData(ganttChartData);
    }, [selectedItem, modeOption]);

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
                            {getDaysYear(dateState).map(day => (
                                <li className="gantt-time-period__day gantt-time-period">{day.getDate()}</li>
                            ))}
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
                    {showTasks ? (
                        <TaskRow
                            tasks={ganttData?.tasks}
                            dateState={dateState}
                            config={{ subTasks: false, indTask: 0, indent: 10 }}
                            dataOperations={dataOperations}
                            onHideSubtasks={onHideSubtasks}
                            onDragStartHandler={onDragStart}
                            onDragEndHandler={onDragEnd}
                            onDragOverHandler={onDragOver}
                            onDropHandler={onDrop}
                        />
                    ) : null}
                </div>
            </div>
        </div>
    ) : null;
}

export default function GanttMode({ data, modeOption, searchElem, dataOperations }) {
    const [selectedItemInd, setSelectedItemInd] = useState(0);
    // Состояние текущей даты
    const [dateState] = useState({ year: new Date().getFullYear(), month: new Date().getMonth() });

    const ganttConfig = getHeadlinesGantt(data, modeOption);
    console.log(`ganttConfig: ${JSON.stringify(ganttConfig, null, 4)}`);

    useEffect(() => setSelectedItemInd(0), [modeOption]);

    return ganttConfig && ganttConfig.length !== 0 ? (
        <div className="gantt-mode">
            <GanttChart
                data={data}
                dateState={dateState}
                selectedItem={ganttConfig[selectedItemInd]}
                modeOption={modeOption}
                dataOperations={dataOperations}
            />
            <select className="gantt-mode__select-list" onChange={e => setSelectedItemInd(e.target.value)}>
                {ganttConfig?.map((headline, index) => {
                    if (isObject(headline) && Object.keys(headline).length !== 0) {
                        return (
                            <option key={headline?.title} value={index}>
                                {headline[modeOption?.uniqueness]}
                            </option>
                        );
                    }
                    if (isArray(headline) && headline.length !== 0) {
                        return (
                            <option key={headline?.title} value={index}>
                                {headline.map(item => {
                                    if (isObject(item) && Object.keys(item).length !== 0)
                                        return item[modeOption?.uniqueness] + String.fromCodePoint(8194);
                                })}
                            </option>
                        );
                    }
                })}
            </select>
        </div>
    ) : null;
}
