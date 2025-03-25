import { getDaysBetweenTwoDates, getDateFromString, getDateInSpecificFormat } from '@helpers/calendar';
import { isObject, isArray, getUniqueData, simplifyData } from '@helpers/helper';

export const useGanttMode = args => {
    const { data, selectedItemInd, modeOption } = args;

    const getHeadlinesGantt = () => {
        console.log(`modeOption: ${JSON.stringify(modeOption, null, 4)}`);
        if (data && data.length !== 0) {
            const headlinesGantt = [];
            // Формирование заголовков по которым будут отфильтрованы данные для диаграммы Ганта
            const tempData = getUniqueData(data, modeOption)?.map(item => {
                if (modeOption && Object.keys(modeOption).length !== 0) {
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
        const simplifiedData = simplifyData(data);
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

        return indexes.map(item => data[item]);
    };

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
                newItem.contractId = +item?.contractId;
                // Заголовок задачи
                newItem.title =
                    (item?.contractNum || 'Номер договора отсутствует') +
                    ` ${String.fromCodePoint(8212)} ` +
                    (item?.address || 'Адрес отсутствует') +
                    ` ${String.fromCodePoint(8212)} ` +
                    (item?.company || 'Заказчик отсутствует');
                // Номер договора
                newItem.contractNum = item?.contractNum;

                // Формирование дат (Начало и Конец)
                if (getDateFromString(item?.dateOfStart?.value) > getDateFromString(item?.dateOfEnding?.value)) {
                    newItem.dateOfStart = item?.dateOfEnding?.value;
                    newItem.dateOfEnding = item?.dateOfStart?.value;
                } else {
                    newItem.dateOfStart = item?.dateOfStart?.value;
                    newItem.dateOfEnding = item?.dateOfEnding?.value;
                }

                // Задний фон
                newItem.bgColorTask = item?.stage?.color;
                //
                newItem.navKey = 'contract';
                // Формирование задач
                newItem.tasks =
                    item?.tasks && item?.tasks.length !== 0
                        ? item?.tasks.map((task, ind) => {
                              return {
                                  contractId: +item?.contractId,
                                  title: task?.title || 'Нет данных',
                                  contractNum: `${item?.contractNum}_${ind + 1}`,
                                  navKey: 'task',
                                  done: +task?.done,
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

                totalCount += newItem.tasks.length;
                tasks.push(newItem);
                newItem = {};
            },
            // Данные по отделам
            sections: item => {
                let taskItem = {};

                // id договора
                // newItem.contractId = item?.contractId;
                // Заголовок задачи
                newItem.title = item?.employee?.fullName || 'Сотрудник отсутствует';
                // Ключ навигации
                newItem.navKey = 'user';
                // Задачи
                newItem.tasks = [];

                if (item?.contracts && item?.contracts.length !== 0) {
                    item?.contracts.forEach(contract => {
                        // id договора
                        taskItem.contractId = contract?.contractId;
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

                        if (
                            getDateFromString(contract?.dateOfStart?.value) >
                            getDateFromString(contract?.dateOfEnding?.value)
                        ) {
                            taskItem.dateOfStart = contract?.dateOfEnding?.value;
                            taskItem.dateOfEnding = contract?.dateOfStart?.value;
                        } else {
                            taskItem.dateOfStart = contract?.dateOfStart?.value;
                            taskItem.dateOfEnding = contract?.dateOfEnding?.value;
                        }

                        taskItem.tasks =
                            contract?.tasks && contract?.tasks.length !== 0
                                ? contract?.tasks.map((task, ind) => {
                                      return {
                                          contractId: contract?.contractId,
                                          title: task?.title || 'Нет данных',
                                          contractNum: `${contract?.contractNum}_${ind + 1}`,
                                          navKey: 'task',
                                          dateOfStart:
                                              getDateFromString(task?.dateOfStart) >
                                              getDateFromString(task?.dateOfEnding)
                                                  ? task?.dateOfEnding
                                                  : task?.dateOfStart,
                                          dateOfEnding:
                                              getDateFromString(task?.dateOfEnding) >
                                              getDateFromString(task?.dateOfStart)
                                                  ? task?.dateOfEnding
                                                  : task?.dateOfStart,
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
        ganttConfig: getHeadlinesGantt(),
        formData
    };
};
