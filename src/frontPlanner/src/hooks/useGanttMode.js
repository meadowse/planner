import { getDaysYear, getDaysBetweenTwoDates, getDateFromString, getDateInSpecificFormat } from '@helpers/calendar';
import { isObject, isArray, getUniqueData, extractSampleData, simplifyData } from '@helpers/helper';

export const useGanttMode = args => {
    const { data, filteredData, selectedItemInd, modeOption, authorizedUserId } = args;

    // Получение заголовков Ганта
    const getHeadlinesGantt = () => {
        console.log(`modeOption: ${JSON.stringify(modeOption, null, 4)}`);
        if (data && data.length !== 0) {
            const headlinesGantt = [];
            // Формирование заголовков по которым будут отфильтрованы данные для диаграммы Ганта
            const tempData = getUniqueData(data, modeOption)?.map(item => {
                if (modeOption && Object.keys(modeOption).length !== 0) {
                    // console.log(`getHeadlinesGantt item: ${JSON.stringify(item, null, 4)}`);
                    if (item && item[modeOption?.key] && modeOption?.key) {
                        if (isObject(item[modeOption?.key]) && Object.keys(item[modeOption?.key]).length !== 0)
                            return item[modeOption?.key];
                        else return item[modeOption?.key];
                    }
                }
            });
            if (tempData && tempData.length !== 0) tempData?.forEach(item => (item ? headlinesGantt.push(item) : null));
            console.log(`headlinesGantt: ${JSON.stringify(headlinesGantt, null, 4)}`);
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
                if (selectedItem && Object.keys(selectedItem).length !== 0) {
                    if (item.includes(selectedItem[modeOption?.uniqueness])) indexes.push(indItem);
                }
            });
        }

        return indexes.map(item => filteredData[item]);
    };

    // Формирование временной шкалы
    function formTimeline() {
        const timeLine = [];
        let years = [];

        const DATA_CONF = {
            contracts: () => {
                return extractSampleData(data, ['dateOfStart', 'dateOfEnding']);
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

        if (modeOption?.keyData in DATA_CONF) {
            DATA_CONF[modeOption?.keyData]().forEach(item => {
                if (item && Object.keys(item).length !== 0) {
                    if (item?.dateOfStart && Object.keys(item?.dateOfStart).length !== 0 && item?.dateOfStart.value)
                        years.push(getDateFromString(item?.dateOfStart.value)?.getFullYear());
                    if (item?.dateOfEnding && Object.keys(item?.dateOfEnding).length !== 0 && item?.dateOfEnding.value)
                        years.push(getDateFromString(item?.dateOfEnding.value)?.getFullYear());
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
            dateRanges = [],
            daysBetweenTwoDate = [];

        let newItem = {};
        let totalCount = 0;
        let dateStart, dateEnd;

        const KEYS_DATA_CONF = {
            // Данные по договорам
            contracts: item => {
                // id договора
                newItem.contractId = item?.contractId;
                // Заголовок задачи
                newItem.title =
                    (item?.contractNum || 'Номер договора отсутствует') +
                    ` ${String.fromCodePoint(8212)} ` +
                    (item?.address || 'Адрес отсутствует') +
                    ` ${String.fromCodePoint(8212)} ` +
                    (item?.company || 'Заказчик отсутствует');
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
                              const assignedUsersTask = [
                                  ...Object.values(task?.director),
                                  ...Object.values(task?.executor)
                              ];
                              const mmIdDirector = assignedUsersTask[0];
                              const mmIdExecutor = assignedUsersTask[1];
                              let authorizedUserData = {};

                              if (assignedUsersTask.includes(authorizedUserId)) {
                                  authorizedUserData.fullName = 'Фамилия Имя';
                                  authorizedUserData.photo = '/img/user.svg';

                                  if (mmIdDirector === authorizedUserId) authorizedUserData.role = 'Постановщик';
                                  if (mmIdExecutor === authorizedUserId) authorizedUserData.role = 'Исполнитель';
                                  if ((mmIdExecutor === mmIdDirector) === authorizedUserId)
                                      authorizedUserData.role = 'Исполнитель / Постановщик';
                              }

                              return {
                                  contractId: item?.contractId,
                                  title: task?.title || 'Нет данных',
                                  contractNum: `${item?.contractNum}_${ind + 1}`,
                                  navKey: 'task',
                                  done: +task?.done,
                                  dateOfStart: task?.dateOfStart,
                                  dateOfEnding: task?.dateOfEnding,
                                  bgColorTask: item?.stage?.color,
                                  authorizedUser: authorizedUserData
                              };
                          })
                        : [];

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
                newItem.title = item?.employee?.fullName || 'Сотрудник отсутствует';
                // Идентификатор пользователя
                newItem.idEmployee = item?.employee?.id;
                // Ключ навигации
                newItem.navKey = 'user';
                // Задачи
                newItem.tasks = [];

                if (item?.contracts && item?.contracts.length !== 0) {
                    item?.contracts.forEach(contract => {
                        // id договора
                        taskItem.contractId = +contract?.contractId;
                        // Заголовок задачи
                        taskItem.title =
                            (contract?.contractNum || 'Номер договора отсутствует') +
                            ` ${String.fromCodePoint(8212)} ` +
                            (contract?.address || 'Адрес отсутствует') +
                            ` ${String.fromCodePoint(8212)} ` +
                            (contract?.company || 'Заказчик отсутствует');
                        // Ключ навигации
                        taskItem.navKey = 'contract';
                        // Номер договора
                        taskItem.contractNum = contract?.contractNum;
                        // Задний фон
                        taskItem.bgColorTask = contract?.stage?.color;

                        // Даты (Начало и Конец)
                        taskItem.dateOfStart = contract?.dateOfStart?.value;
                        taskItem.dateOfEnding = contract?.dateOfEnding?.value;

                        taskItem.tasks =
                            contract?.tasks && contract?.tasks.length !== 0
                                ? contract?.tasks.map((task, ind) => {
                                      return {
                                          contractId: +contract?.contractId,
                                          title: task?.title || 'Нет данных',
                                          contractNum: `${contract?.contractNum}_${ind + 1}`,
                                          navKey: 'task',
                                          done: +task?.done,
                                          dateOfStart: task?.dateOfStart,
                                          dateOfEnding: task?.dateOfEnding,
                                          bgColorTask: contract?.stage?.color
                                      };
                                  })
                                : [];
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
        filteredData.forEach(item => {
            dateStart = getDateFromString(item?.dateOfStart?.value);
            dateEnd = getDateFromString(item?.dateOfEnding?.value);

            daysBetweenTwoDate = getDaysBetweenTwoDates(dateStart, dateEnd).map(date =>
                getDateInSpecificFormat(date, { format: 'YYYYMMDD', separator: '-' })
            );

            if (daysBetweenTwoDate && daysBetweenTwoDate.length !== 0) dateRanges.push(daysBetweenTwoDate);

            if (item?.tasks && item?.tasks.length !== 0) {
                item?.tasks.map(task => {
                    dateStart = getDateFromString(task?.dateOfStart);
                    dateEnd = getDateFromString(task?.dateOfEnding);

                    daysBetweenTwoDate = getDaysBetweenTwoDates(dateStart, dateEnd).map(date =>
                        getDateInSpecificFormat(date, { format: 'YYYYMMDD', separator: '-' })
                    );

                    if (daysBetweenTwoDate && daysBetweenTwoDate.length !== 0) dateRanges.push(daysBetweenTwoDate);
                });
            }
        });

        // Все задачи
        newData.totalTasks = dateRanges;
        // Задний фон
        newData.bgColorTask = '#E4E4E4';

        filteredData.forEach(item => {
            if (item && Object.keys(item).length !== 0) KEYS_DATA_CONF[modeOption?.keyData](item);
        });

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
