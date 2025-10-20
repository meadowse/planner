import { useEffect, useState } from 'react';

// Импорт доп.функционала
import { getDateFromString } from '@helpers/calendar.js';
import { isString, isDate, isObject, isArray } from '@helpers/helper';

const KEYS_FOR_STORAGE = {
    department: keyMode => `department${keyMode ? `-${keyMode}` : ''}`,
    equipment: keyMode => `equipment${keyMode ? `-${keyMode}` : ''}`,
    company: keyMode => `company${keyMode ? `-${keyMode}` : ''}`,
    personal: keyMode => `personal${keyMode ? `-${keyMode}` : ''}`,
    innerprojects: keyMode => `innerprojects${keyMode ? `-${keyMode}` : ''}`,
    user: keyMode => `user${keyMode ? `-${keyMode}` : ''}`,
    dataform: keyMode => `dataform${keyMode ? `-${keyMode}` : ''}`,
    projectform: keyMode => `projectform${keyMode ? `-${keyMode}` : ''}`
};

export const useSortingTable = (modeConfig, data, setData) => {
    const { partition, mode } = modeConfig;
    const savedSorting = JSON.parse(localStorage.getItem('listmode-sorting')) ?? {};

    // const [order, setOrder] = useState('ASC');
    const [sortingState, setSortingState] = useState({});

    // Сортировка данных
    const sortData = sortingConf => {
        let sortedData = data && data.length > 0 ? [...data] : [];
        const { column: key, sortBy, order } = sortingConf;

        const SORT_ORDER_BY = {
            'ASC': (a, b) => {
                if (isString(a) && isString(b)) {
                    if (isDate(a) && isDate(b)) {
                        let dates = [getDateFromString(a), getDateFromString(b)];
                        if (!isNaN(dates[0]) && !isNaN(dates[1])) return dates[0] - dates[1];
                        else return a - b;
                    } else return a?.localeCompare(b);
                }
                if (isObject(a) && isObject(b)) {
                    if (isDate(a[sortBy]) && isDate(b[sortBy])) {
                        let dates = [getDateFromString(a[sortBy]), getDateFromString(b[sortBy])];
                        if (!isNaN(dates[0]) && !isNaN(dates[1])) return dates[0] - dates[1];
                        else return a - b;
                    } else return a[sortBy]?.localeCompare(b[sortBy]);
                }
                if (isArray(a) && isArray(b)) return a[0][sortBy]?.localeCompare(b[0][sortBy]);
            },
            'DESC': (a, b) => {
                if (isString(a) && isString(b)) {
                    if (isDate(a) && isDate(b)) {
                        let dates = [getDateFromString(a), getDateFromString(b)];
                        if (!isNaN(dates[0]) && !isNaN(dates[1])) return dates[1] - dates[0];
                        else return b - a;
                    } else return b?.localeCompare(a);
                }
                if (isObject(a) && isObject(b)) {
                    if (isDate(a[sortBy]) && isDate(b[sortBy])) {
                        let dates = [getDateFromString(a[sortBy]), getDateFromString(b[sortBy])];
                        if (!isNaN(dates[0]) && !isNaN(dates[1])) return dates[1] - dates[0];
                        else return b - a;
                    } else return b[sortBy]?.localeCompare(a[sortBy]);
                }
                if (isArray(a) && isArray(b)) return b[0][sortBy]?.localeCompare(a[0][sortBy]);
            }
        };

        sortedData.sort((a, b) => {
            if (!a[key] || a[key] === undefined) return 1;
            else if (!b[key] || b[key] === undefined) return -1;
            else if (a[key] === b[key]) return 0;
            else return SORT_ORDER_BY[order](a[key], b[key]);
        });

        setData(sortedData);
        // setOrder(order === 'ASC' ? 'DESC' : 'ASC');
    };

    const onChangeSorting = data => {
        if (partition in KEYS_FOR_STORAGE) {
            const keyStorage = KEYS_FOR_STORAGE[partition](mode?.key);
            savedSorting[keyStorage] = { ...data };

            setSortingState(savedSorting[keyStorage]);
            sortData(savedSorting[keyStorage]);

            localStorage.setItem('listmode-sorting', JSON.stringify(savedSorting));
        }
    };

    useEffect(() => {
        // console.log(`useListMode modeConfig changed: ${JSON.stringify(modeConfig, null, 4)}`);
        if (partition in KEYS_FOR_STORAGE) {
            const keyStorage = KEYS_FOR_STORAGE[partition](mode?.key);

            // console.log(`useEffect savedSorting[keyStorage]: ${JSON.stringify(savedSorting[keyStorage], null, 4)}`);

            if (!savedSorting[keyStorage] || Object.keys(savedSorting[keyStorage]).length === 0) {
                savedSorting[keyStorage] = { column: null, sortBy: null, order: null };
                localStorage.setItem('listmode-sorting', JSON.stringify(savedSorting));
            }

            setSortingState(savedSorting[keyStorage]);
            sortData(savedSorting[keyStorage]);
        }

        // console.log(`useListMode keyStorage: ${keyStorage}`);
    }, [modeConfig, data]);

    return { sortingState, onChangeSorting };
};
