// Импорт доп.функционала
import { getDaysYear, getDaysBetweenTwoDates, getDateFromString, getDateInSpecificFormat } from '@helpers/calendar';
import { isObject, isArray, getUniqueData, extractSampleData, simplifyData } from '@helpers/helper';

export const useGanttMode = args => {
    const { partition, data, filteredData, selectedItemInd, modeOption, authorizedUserId } = args;

    // Получение заголовков Ганта
    const getHeadlinesGantt = () => {
        // console.log(`modeOption: ${JSON.stringify(modeOption, null, 4)}`);
        if (data && data.length !== 0) {
            const headlinesGantt = [];

            if (modeOption && Object.keys(modeOption).length !== 0) {
                // Формирование заголовков по которым будут отфильтрованы данные для диаграммы Ганта
                const tempData = getUniqueData(data, modeOption)?.map(item => {
                    // console.log(`getHeadlinesGantt item: ${JSON.stringify(item, null, 4)}`);
                    if (item && modeOption?.key && item[modeOption?.key]) {
                        if (isObject(item[modeOption?.key]) && Object.keys(item[modeOption?.key]).length !== 0)
                            return item[modeOption?.key];
                        else return item[modeOption?.key];
                    }
                });
                if (tempData && tempData.length !== 0)
                    tempData?.forEach(item => (item ? headlinesGantt.push(item) : null));
            }

            // Формирование заголовков по которым будут отфильтрованы данные для диаграммы Ганта
            // const tempData = getUniqueData(data, modeOption)?.map(item => {
            //     if (modeOption && Object.keys(modeOption).length !== 0) {
            //         // console.log(`getHeadlinesGantt item: ${JSON.stringify(item, null, 4)}`);
            //         if (item && modeOption?.key && item[modeOption?.key]) {
            //             if (isObject(item[modeOption?.key]) && Object.keys(item[modeOption?.key]).length !== 0)
            //                 return item[modeOption?.key];
            //             else return item[modeOption?.key];
            //         }
            //     }
            // });
            // if (tempData && tempData.length !== 0) tempData?.forEach(item => (item ? headlinesGantt.push(item) : null));
            // console.log(`headlinesGantt: ${JSON.stringify(headlinesGantt, null, 4)}`);
            return headlinesGantt;
        }
        return [];
    };

    // Функция фильтрации данных
    const getFilteredData = () => {
        // const simplifiedData = simplifyData(data);
        const simplifiedData = simplifyData(filteredData);
        // Индексы найденных элементов
        const indexes = [];
        //
        const selectedItem = getHeadlinesGantt()[selectedItemInd];

        // Элементы которые нужно найти
        let elemsToFind =
            isArray(selectedItem) && selectedItem.length !== 0
                ? selectedItem.map(item => item[modeOption?.uniqueness]).sort((a, b) => a.localeCompare(b))
                : [];
        // Найденные элементы
        let foundElems = [];

        // if (isArray(selectedItem) && selectedItem.length !== 0) {
        //     if (foundElems.length !== 0) foundElems = [];
        //     simplifiedData.forEach((item, indItem) => {
        //         foundElems = [];
        //         elemsToFind.forEach(elem => {
        //             if (item.includes(elem)) foundElems.push(elem);
        //         });
        //         foundElems = Array.from(new Set(foundElems)).sort((a, b) => a.localeCompare(b));
        //         if (JSON.stringify(elemsToFind) === JSON.stringify(foundElems)) indexes.push(indItem);
        //     });
        // } else {
        //     simplifiedData.forEach((item, indItem) => {
        //         if (selectedItem && Object.keys(selectedItem).length !== 0) {
        //             if (item.includes(selectedItem[modeOption?.uniqueness])) indexes.push(indItem);
        //         }
        //     });
        // }

        if (selectedItem) {
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
            }
            if (isObject(selectedItem) && Object.keys(selectedItem).length !== 0) {
                simplifiedData.forEach((item, indItem) => {
                    if (item.includes(selectedItem[modeOption?.uniqueness])) indexes.push(indItem);
                });
            }
        } else return filteredData;

        return indexes.map(item => filteredData[item]);
    };

    // Формирование временной шкалы
    function formTimeline() {
        let years = [];

        // console.log(`partition : ${JSON.stringify(partition, null, 4)}`);

        // Временная шкала
        const timeLine = [];
        const keyData = modeOption?.keyData ?? partition;
        const DATA_CONF = {
            equipment: () => {
                // console.log(`SampleData ${JSON.stringify(extractSampleData(data, ['dates']), null, 4)}`);
                console.log(`SampleData  ${JSON.stringify(extractSampleData(data, ['dates']), null, 4)}`);
                return extractSampleData(data, ['dates']);
            },
            contracts: () => {
                return extractSampleData(data, ['dateOfStart', 'dateOfEnding', 'tasks']);
            },
            sections: () => {
                const contracts = [];

                data?.forEach(item => {
                    if (item && Object.keys(item).length !== 0) {
                        if (item?.contracts && item?.contracts.length !== 0) {
                            extractSampleData(item?.contracts, ['dateOfStart', 'dateOfEnding']).forEach(elem => {
                                contracts.push(elem);
                            });
                        }
                    }
                });
                return extractSampleData(contracts, ['dateOfStart', 'dateOfEnding']);
            }
        };

        if (keyData in DATA_CONF) {
            DATA_CONF[keyData]().forEach(item => {
                if (item && Object.keys(item).length !== 0) {
                    if (item?.dateOfStart && Object.keys(item?.dateOfStart).length !== 0 && item?.dateOfStart.value)
                        years.push(getDateFromString(item?.dateOfStart.value)?.getFullYear());
                    if (item?.dateOfEnding && Object.keys(item?.dateOfEnding).length !== 0 && item?.dateOfEnding.value)
                        years.push(getDateFromString(item?.dateOfEnding.value)?.getFullYear());
                    if (item.tasks && item.tasks.length !== 0) {
                        item.tasks.forEach(elem => {
                            if (elem?.dateOfStart) years.push(getDateFromString(elem?.dateOfStart)?.getFullYear());
                            if (elem?.dateOfEnding) years.push(getDateFromString(elem?.dateOfEnding)?.getFullYear());
                        });
                    }
                    if (item?.dates && isArray(item?.dates) && item?.dates.length !== 0) {
                        item?.dates?.forEach(elem => {
                            if (elem?.start) years.push(getDateFromString(elem?.start)?.getFullYear());
                            if (elem?.end) years.push(getDateFromString(elem?.end)?.getFullYear());
                        });
                    }
                }
            });
        }

        years = Array.from(new Set(years)).sort((a, b) => a - b);

        years.forEach(year => {
            const beginDate = { year, month: 0, day: 1 };
            getDaysYear(beginDate).forEach(date => {
                let dateVal = getDateInSpecificFormat(date, {
                    format: 'YYYYMMDD',
                    separator: '-'
                });
                timeLine.push(dateVal);
            });
        });

        // console.log(
        //     `formTimeline: ${JSON.stringify(
        //         {
        //             years: years,
        //             data: timeLine
        //         },
        //         null,
        //         4
        //     )}`
        // );

        return {
            years: years,
            data: timeLine
        };
    }

    // Инициализация данных
    const formData = () => {
        const newData = {};
        const tasks = [];

        let filteredData = getFilteredData(),
            range = [],
            dateRanges = [],
            // newDateRanges = [],
            daysBetweenTwoDate = [];

        let tempData = [];
        let newItem = {};
        let totalCount = 0;
        let dateStart, dateEnd, diffDates;

        const KEYS_DATA_CONF = {
            equipment: item => {
                newItem.moveElemId = item?.serialNumber;
                // Заголовок задачи
                newItem.title = {
                    name:
                        `${item?.equipment?.title} ${String.fromCodePoint(8212)}` + ' ' ??
                        `Название отсутствует ${String.fromCodePoint(8212)}` + ' ',
                    model: item?.equipment?.model ?? 'Модель отсутствует'
                };

                // Номер договора
                newItem.contractNum = item?.equipment?.model;

                // Задний фон
                newItem.bgColorTask = '#ced4da';
                // Навигация
                newItem.navKey = 'equipment';

                if (item?.dates && isArray(item?.dates) && item?.dates.length !== 0) {
                    const sortedDates = item?.dates.sort((dateA, dateB) => {
                        return new Date(getDateFromString(dateB?.end)) - new Date(getDateFromString(dateA?.end));
                    });
                    // Даты (Начало и Конец)
                    newItem.dateOfStart = sortedDates[0]?.start ?? 'Нет данных';
                    newItem.dateOfEnding = sortedDates[0]?.end ?? 'Нет данных';
                }

                tasks.push(newItem);
                newItem = {};
            },
            // Данные по договорам
            contracts: item => {
                // id
                newItem.moveElemId = item?.contractId;
                // id договора
                newItem.contractId = item?.contractId;
                // Заголовок задачи
                newItem.title = {
                    contractNum:
                        `${item?.contractNum} ${String.fromCodePoint(8212)}` + ' ' ??
                        `Номер договора отсутствует ${String.fromCodePoint(8212)}` + ' ',
                    address:
                        `${item?.address} ${String.fromCodePoint(8212)}` + ' ' ??
                        `Адрес отсутствует ${String.fromCodePoint(8212)}` + ' ',
                    company: item?.company ?? 'Заказчик отсутствует'
                };
                // Номер договора
                newItem.contractNum = item?.contractNum;

                // Даты (Начало и Конец)
                newItem.dateOfStart = item?.dateOfStart?.value;
                newItem.dateOfEnding = item?.dateOfEnding?.value;

                // Задний фон
                newItem.bgColorTask = item?.stage?.color;
                // Навигация
                newItem.navKey = 'contract';
                // Формирование задач
                newItem.tasks =
                    item?.tasks && item?.tasks.length !== 0
                        ? item?.tasks.map((task, ind) => {
                              const subtasks = [];
                              const assignedUsersData = [];
                              let users = [];

                              if (task?.director && task?.executor) {
                                  if (
                                      Object.keys(task?.director).length !== 0 &&
                                      Object.keys(task?.executor).length !== 0
                                  ) {
                                      users = [
                                          ...(Object?.values(task?.director) || null),
                                          ...(Object?.values(task?.executor) || null)
                                      ];
                                  }
                              }

                              if (users.length !== 0) {
                                  const mmIdDirector = task?.director?.mmId;
                                  const mmIdExecutor = task?.executor?.mmId;

                                  if (mmIdDirector === mmIdExecutor) {
                                      //
                                      assignedUsersData.push({
                                          mmId: task?.executor?.mmId || task?.director?.mmId,
                                          authorizedUser:
                                              authorizedUserId === mmIdExecutor && authorizedUserId === mmIdDirector
                                                  ? true
                                                  : false,
                                          fullName: task?.executor?.fullName || '',
                                          role: 'Исполнитель / Постановщик',
                                          photo: task?.executor?.mmId
                                              ? `https://mm-mpk.ru/api/v4/users/${task?.executor?.mmId}/image`
                                              : '/img/user.svg'
                                      });
                                  } else {
                                      // Добавление Постановщика
                                      assignedUsersData.push({
                                          mmId: task?.director?.mmId,
                                          authorizedUser: mmIdDirector === authorizedUserId ? true : false,
                                          fullName: task?.director?.fullName || '',
                                          role: 'Постановщик',
                                          photo: task?.director?.mmId
                                              ? `https://mm-mpk.ru/api/v4/users/${task?.director?.mmId}/image`
                                              : '/img/user.svg'
                                      });

                                      // Добавление Исполнителя
                                      assignedUsersData.push({
                                          mmId: task?.executor?.mmId,
                                          authorizedUser: mmIdExecutor === authorizedUserId ? true : false,
                                          fullName: task?.executor?.fullName || '',
                                          role: 'Исполнитель',
                                          photo: task?.executor?.mmId
                                              ? `https://mm-mpk.ru/api/v4/users/${task?.executor?.mmId}/image`
                                              : '/img/user.svg'
                                      });
                                  }
                              }

                              // Формирование подзадач основной задачи
                              if (task?.tasks && task?.tasks.length !== 0) {
                                  task?.tasks.forEach(subtask => {
                                      const assignedUsersDataSubTasks = [];
                                      if (subtask?.director && subtask?.executor) {
                                          if (
                                              Object.keys(subtask?.director).length !== 0 &&
                                              Object.keys(subtask?.executor).length !== 0
                                          ) {
                                              users = [
                                                  ...(Object?.values(subtask?.director) || null),
                                                  ...(Object?.values(subtask?.executor) || null)
                                              ];
                                          }
                                      }

                                      if (users.length !== 0) {
                                          const mmIdDirector = subtask?.director?.mmId;
                                          const mmIdExecutor = subtask?.executor?.mmId;

                                          if (mmIdDirector === mmIdExecutor) {
                                              //
                                              assignedUsersDataSubTasks.push({
                                                  mmId: subtask?.executor?.mmId || subtask?.director?.mmId,
                                                  authorizedUser:
                                                      authorizedUserId === mmIdExecutor &&
                                                      authorizedUserId === mmIdDirector
                                                          ? true
                                                          : false,
                                                  fullName: subtask?.executor?.fullName || '',
                                                  role: 'Исполнитель / Постановщик',
                                                  photo:
                                                      subtask?.executor?.mmId || subtask?.director?.mmId
                                                          ? `https://mm-mpk.ru/api/v4/users/${
                                                                subtask?.executor?.mmId || subtask?.director?.mmId
                                                            }/image`
                                                          : '/img/user.svg'
                                              });
                                          } else {
                                              // Добавление Постановщика
                                              assignedUsersDataSubTasks.push({
                                                  mmId: subtask?.director?.mmId,
                                                  authorizedUser: mmIdDirector === authorizedUserId ? true : false,
                                                  fullName: subtask?.director?.fullName || '',
                                                  role: 'Постановщик',
                                                  photo: subtask?.director?.mmId
                                                      ? `https://mm-mpk.ru/api/v4/users/${subtask?.director?.mmId}/image`
                                                      : '/img/user.svg'
                                              });

                                              // Добавление Исполнителя
                                              assignedUsersDataSubTasks.push({
                                                  mmId: subtask?.executor?.mmId,
                                                  authorizedUser: mmIdExecutor === authorizedUserId ? true : false,
                                                  fullName: subtask?.executor?.fullName || '',
                                                  role: 'Исполнитель',
                                                  photo: subtask?.executor?.mmId
                                                      ? `https://mm-mpk.ru/api/v4/users/${subtask?.executor?.mmId}/image`
                                                      : '/img/user.svg'
                                              });
                                          }
                                      }

                                      subtasks.push({
                                          moveElemId: item?.contractId + (ind + 1),
                                          contractId: item?.contractId,
                                          taskId: subtask?.id || -1,
                                          title: subtask?.title || 'Нет данных',
                                          contractNum: `${item?.contractNum}_${ind + 1}`,
                                          //   navKey: 'subtask',
                                          navKey: 'task',
                                          done: +subtask?.done,
                                          dateOfStart: subtask?.dateOfStart,
                                          dateOfEnding: subtask?.dateOfEnding,
                                          //   bgColorTask: item?.stage?.color,
                                          bgColorTask: +subtask?.done ? '#8ac926' : '#d53032',
                                          assignedUsers: assignedUsersDataSubTasks
                                      });
                                  });
                              }

                              return {
                                  moveElemId: item?.contractId + (ind + 1),
                                  contractId: item?.contractId,
                                  taskId: task?.id || -1,
                                  title: task?.title || 'Нет данных',
                                  contractNum: `${item?.contractNum}_${ind + 1}`,
                                  navKey: 'task',
                                  done: +task?.done,
                                  dateOfStart: task?.dateOfStart,
                                  dateOfEnding: task?.dateOfEnding,
                                  //   bgColorTask: item?.stage?.color,
                                  bgColorTask: +task?.done ? '#8ac926' : '#d53032',
                                  assignedUsers: assignedUsersData,
                                  tasks: subtasks
                              };
                          })
                        : [];

                // сортировка данных, которая отсротирована по done отсортировать по полю dateOfEnding
                newItem.tasks = Array.from(newItem?.tasks).sort(
                    (a, b) => getDateFromString(a?.dateOfEnding) - getDateFromString(b?.dateOfEnding)
                );
                // сортировка данных по полю done
                newItem.tasks = Array.from(newItem?.tasks).sort((a, b) => +a?.done - +b?.done);

                totalCount += newItem.tasks.length;
                tasks.push(newItem);
                newItem = {};
            },
            // Данные по всем отделам
            sections: item => {
                let taskItem = {};

                // id договора
                // newItem.contractId = item?.contractId;
                // Заголовок задачи
                // newItem.title = item?.employee?.fullName || 'Сотрудник отсутствует';
                newItem.title = {
                    fullName: item?.employee?.fullName || 'Сотрудник отсутствует'
                };
                // Идентификатор пользователя
                newItem.idEmployee = item?.employee?.id;
                // Ключ навигации
                newItem.navKey = 'user';
                // Задачи
                newItem.tasks = [];

                // Формирование договоров
                if (item?.contracts && item?.contracts.length !== 0) {
                    item?.contracts.forEach(contract => {
                        taskItem.moveElemId = `${contract?.contractId}-${Date.now() + Math.random()}`;
                        // taskItem.moveElemId = +contract?.contractId;
                        // id договора
                        taskItem.contractId = +contract?.contractId;
                        // Заголовок задачи
                        taskItem.title = {
                            contractNum:
                                `${contract?.contractNum} ${String.fromCodePoint(8212)}` + ' ' ??
                                `Номер договора отсутствует ${String.fromCodePoint(8212)}` + ' ',
                            address:
                                `${contract?.address} ${String.fromCodePoint(8212)}` + ' ' ??
                                `Адрес отсутствует ${String.fromCodePoint(8212)}` + ' ',
                            company: contract?.company || 'Заказчик отсутствует'
                        };
                        // Ключ навигации
                        taskItem.navKey = 'contract';
                        // Номер договора
                        // taskItem.contractNum = contract?.contractNum;
                        taskItem.contractNum = `${contract?.contractNum}-${Date.now() + Math.random()}`;
                        // Задний фон
                        taskItem.bgColorTask = contract?.stage?.color;

                        // Даты (Начало и Конец)
                        taskItem.dateOfStart = contract?.dateOfStart?.value;
                        taskItem.dateOfEnding = contract?.dateOfEnding?.value;

                        taskItem.tasks = [];

                        if (contract?.tasks && contract?.tasks.length !== 0) {
                            contract?.tasks.forEach((task, ind) => {
                                if (item?.employee?.id === task?.executor?.mmId) {
                                    const subtasks = [];
                                    const assignedUsersData = [];
                                    let users = [];

                                    if (task?.director && task?.executor) {
                                        if (
                                            Object.keys(task?.director).length !== 0 &&
                                            Object.keys(task?.executor).length !== 0
                                        ) {
                                            users = [
                                                ...(Object?.values(task?.director) || null),
                                                ...(Object?.values(task?.executor) || null)
                                            ];
                                        }
                                    }

                                    if (users.length !== 0) {
                                        const mmIdDirector = task?.director?.mmId;
                                        const mmIdExecutor = task?.executor?.mmId;

                                        if (mmIdDirector === mmIdExecutor) {
                                            //
                                            assignedUsersData.push({
                                                mmId: task?.executor?.mmId || task?.director?.mmId,
                                                authorizedUser:
                                                    authorizedUserId === mmIdExecutor &&
                                                    authorizedUserId === mmIdDirector
                                                        ? true
                                                        : false,
                                                fullName: task?.executor?.fullName || '',
                                                role: 'Исполнитель / Постановщик',
                                                photo:
                                                    task?.executor?.mmId || task?.director?.mmId
                                                        ? `https://mm-mpk.ru/api/v4/users/${
                                                              task?.executor?.mmId || task?.director?.mmId
                                                          }/image`
                                                        : '/img/user.svg'
                                            });
                                        } else {
                                            // Добавление Постановщика
                                            assignedUsersData.push({
                                                mmId: task?.director?.mmId,
                                                authorizedUser: mmIdDirector === authorizedUserId ? true : false,
                                                fullName: task?.director?.fullName || '',
                                                role: 'Постановщик',
                                                photo: task?.director?.mmId
                                                    ? `https://mm-mpk.ru/api/v4/users/${task?.director?.mmId}/image`
                                                    : '/img/user.svg'
                                            });

                                            // Добавление Исполнителя
                                            assignedUsersData.push({
                                                mmId: task?.executor?.mmId,
                                                authorizedUser: mmIdExecutor === authorizedUserId ? true : false,
                                                fullName: task?.executor?.fullName || '',
                                                role: 'Исполнитель',
                                                photo: task?.executor?.mmId
                                                    ? `https://mm-mpk.ru/api/v4/users/${task?.executor?.mmId}/image`
                                                    : '/img/user.svg'
                                            });
                                        }
                                    }

                                    // Формирование подзадач основной задачи
                                    if (task?.tasks && task?.tasks.length !== 0) {
                                        task?.tasks.forEach(subtask => {
                                            const assignedUsersDataSubTasks = [];

                                            if (subtask?.director && subtask?.executor) {
                                                if (
                                                    Object.keys(subtask?.director).length !== 0 &&
                                                    Object.keys(subtask?.executor).length !== 0
                                                ) {
                                                    users = [
                                                        ...(Object?.values(subtask?.director) || null),
                                                        ...(Object?.values(subtask?.executor) || null)
                                                    ];
                                                }
                                            }

                                            if (users.length !== 0) {
                                                const mmIdDirector = subtask?.director?.mmId;
                                                const mmIdExecutor = subtask?.executor?.mmId;

                                                if (mmIdDirector === mmIdExecutor) {
                                                    //
                                                    assignedUsersDataSubTasks.push({
                                                        mmId: subtask?.executor?.mmId || subtask?.director?.mmId,
                                                        authorizedUser:
                                                            authorizedUserId === mmIdExecutor &&
                                                            authorizedUserId === mmIdDirector
                                                                ? true
                                                                : false,
                                                        fullName: subtask?.executor?.fullName || '',
                                                        role: 'Исполнитель / Постановщик',
                                                        photo:
                                                            subtask?.executor?.mmId || subtask?.director?.mmId
                                                                ? `https://mm-mpk.ru/api/v4/users/${
                                                                      subtask?.executor?.mmId || subtask?.director?.mmId
                                                                  }/image`
                                                                : '/img/user.svg'
                                                    });
                                                } else {
                                                    // Добавление Постановщика
                                                    assignedUsersDataSubTasks.push({
                                                        mmId: subtask?.director?.mmId,
                                                        authorizedUser:
                                                            mmIdDirector === authorizedUserId ? true : false,
                                                        fullName: subtask?.director?.fullName || '',
                                                        role: 'Постановщик',
                                                        photo: subtask?.director?.mmId
                                                            ? `https://mm-mpk.ru/api/v4/users/${subtask?.director?.mmId}/image`
                                                            : '/img/user.svg'
                                                    });

                                                    // Добавление Исполнителя
                                                    assignedUsersDataSubTasks.push({
                                                        mmId: subtask?.executor?.mmId,
                                                        authorizedUser:
                                                            mmIdExecutor === authorizedUserId ? true : false,
                                                        fullName: subtask?.executor?.fullName || '',
                                                        role: 'Исполнитель',
                                                        photo: subtask?.executor?.mmId
                                                            ? `https://mm-mpk.ru/api/v4/users/${subtask?.executor?.mmId}/image`
                                                            : '/img/user.svg'
                                                    });
                                                }
                                            }

                                            subtasks.push({
                                                moveElemId: +contract?.contractId + (ind + 1),
                                                contractId: +contract?.contractId,
                                                title: subtask?.title || 'Нет данных',
                                                contractNum: `${contract?.contractNum}_${ind + 1}`,
                                                navKey: 'task',
                                                done: +subtask?.done,
                                                dateOfStart: subtask?.dateOfStart,
                                                dateOfEnding: subtask?.dateOfEnding,
                                                //   bgColorTask: contract?.stage?.color,
                                                bgColorTask: +subtask?.done ? '#8ac926' : '#d53032',
                                                assignedUsers: assignedUsersDataSubTasks
                                            });
                                        });
                                    }

                                    taskItem.tasks.push({
                                        moveElemId: +contract?.contractId + (ind + 1),
                                        contractId: +contract?.contractId,
                                        title: task?.title || 'Нет данных',
                                        contractNum: `${contract?.contractNum}_${ind + 1}`,
                                        navKey: 'task',
                                        done: +task?.done,
                                        dateOfStart: task?.dateOfStart,
                                        dateOfEnding: task?.dateOfEnding,
                                        //   bgColorTask: contract?.stage?.color,
                                        bgColorTask: +task?.done ? '#8ac926' : '#d53032',
                                        assignedUsers: assignedUsersData,
                                        tasks: subtasks
                                    });
                                }
                            });
                        }

                        // сортировка данных, которая отсротирована по done отсортировать по полю dateOfEnding
                        // taskItem.tasks = Array.from(taskItem?.tasks).sort(
                        //     (a, b) => getDateFromString(a?.dateOfEnding) - getDateFromString(b?.dateOfEnding)
                        // );
                        // сортировка данных по полю done
                        // taskItem.tasks = Array.from(taskItem?.tasks).sort((a, b) => +a?.done - +b?.done);

                        // console.log(`sections\ntaskItem: ${JSON.stringify(taskItem, null, 4)}`);
                        newItem.tasks.push(taskItem);
                        taskItem = {};

                        totalCount += contract?.tasks?.length;
                    });
                }

                // totalCount += taskItem?.tasks?.length + newItem?.tasks?.length;
                totalCount += newItem?.tasks?.length;

                // newItem.contractNum = item?.contractNum;

                tasks.push(newItem);

                taskItem = {};
                newItem = {};
            }
        };

        // Формирование массива данных всех задач
        if (filteredData && isArray(filteredData) && filteredData.length !== 0) {
            filteredData.forEach(item => {
                dateStart = getDateFromString(item?.dateOfStart?.value);
                dateEnd = getDateFromString(item?.dateOfEnding?.value);

                daysBetweenTwoDate = getDaysBetweenTwoDates(dateStart, dateEnd).map(date =>
                    getDateInSpecificFormat(date, { format: 'YYYYMMDD', separator: '-' })
                );

                if (daysBetweenTwoDate && daysBetweenTwoDate.length !== 0)
                    daysBetweenTwoDate.forEach(dateVal => tempData.push(dateVal));

                // dateRanges.push(daysBetweenTwoDate);

                if (item?.tasks && item?.tasks.length !== 0) {
                    item?.tasks.map(task => {
                        dateStart = getDateFromString(task?.dateOfStart);
                        dateEnd = getDateFromString(task?.dateOfEnding);

                        daysBetweenTwoDate = getDaysBetweenTwoDates(dateStart, dateEnd).map(date =>
                            getDateInSpecificFormat(date, { format: 'YYYYMMDD', separator: '-' })
                        );

                        if (daysBetweenTwoDate && daysBetweenTwoDate.length !== 0)
                            daysBetweenTwoDate.forEach(dateVal => tempData.push(dateVal));
                        // dateRanges.push(daysBetweenTwoDate);
                    });
                }
            });
        }

        const sortedDates = Array.from(new Set(tempData)).sort((a, b) => {
            return new Date(getDateFromString(a)) - new Date(getDateFromString(b));
        });

        sortedDates.forEach((_, ind) => {
            if (ind + 1 <= sortedDates.length) {
                diffDates =
                    getDaysBetweenTwoDates(getDateFromString(sortedDates[ind]), getDateFromString(sortedDates[ind + 1]))
                        .length - 1;

                if (diffDates === 0) {
                    if (range.length !== 0) dateRanges.push(Array.from(new Set(range)));
                    range = [];
                }
                if (diffDates === 1) range.push(sortedDates[ind], sortedDates[ind + 1]);
                if (diffDates > 1) {
                    if (range.length === 0) dateRanges.push([sortedDates[ind]]);
                    else {
                        if (range.length !== 0) dateRanges.push(Array.from(new Set(range)));
                        range = [];
                    }
                }
            }
        });

        // Все задачи
        newData.totalTasks = dateRanges;
        // Задний фон
        newData.bgColorTask = '#E4E4E4';

        if (filteredData && isArray(filteredData) && filteredData.length !== 0) {
            console.log(`modeOption: ${JSON.stringify(modeOption, null, 4)}\npartition: ${partition}`);
            filteredData.forEach(item => {
                if (item && Object.keys(item).length !== 0) {
                    if (modeOption?.keyData) KEYS_DATA_CONF[modeOption?.keyData](item);
                    else if (KEYS_DATA_CONF[partition]) KEYS_DATA_CONF[partition](item);
                }
            });
        }

        totalCount += tasks.length;

        newData.totalCount = totalCount;
        newData.tasks = tasks;
        // console.log(`newData: ${JSON.stringify(newData, null, 4)}`);

        return newData;
    };

    return {
        timeLine: formTimeline(),
        ganttConfig: getHeadlinesGantt(),
        formData
    };
};
