import { useEffect } from 'react';

// Импорт доп.функционала
import { getDateFromString } from '@helpers/calendar.js';
import { isString, isDate, isObject, isArray } from '@helpers/helper';

// Сортировка данных
const sortData = (data, key, sortBy, order, setOrder, setData) => {
    let sortedData = [...data];

    const SORT_ORDER_BY = {
        'ASC': (a, b) => {
            if (isString(a) && isString(b)) {
                if (isDate(a) && isDate(b)) {
                    let dates = [getDateFromString(a), getDateFromString(b)];
                    if (!isNaN(dates[0]) && !isNaN(dates[1])) return dates[0] - dates[1];
                    else return a - b;
                } else return a.localeCompare(b);
                // else return a - b;
            }
            if (isObject(a) && isObject(b)) {
                if (isDate(a[sortBy]) && isDate(b[sortBy])) {
                    let dates = [getDateFromString(a[sortBy]), getDateFromString(b[sortBy])];
                    if (!isNaN(dates[0]) && !isNaN(dates[1])) return dates[0] - dates[1];
                    else return a - b;
                } else return a[sortBy].localeCompare(b[sortBy]);
            }
            if (isArray(a) && isArray(b)) return a[0][sortBy].localeCompare(b[0][sortBy]);
        },
        'DESC': (a, b) => {
            if (isString(a) && isString(b)) {
                if (isDate(a) && isDate(b)) {
                    let dates = [getDateFromString(a), getDateFromString(b)];
                    if (!isNaN(dates[0]) && !isNaN(dates[1])) return dates[1] - dates[0];
                    else return b - a;
                } else return b.localeCompare(a);
                // else return b - a;
            }
            if (isObject(a) && isObject(b)) {
                if (isDate(a[sortBy]) && isDate(b[sortBy])) {
                    let dates = [getDateFromString(a[sortBy]), getDateFromString(b[sortBy])];
                    if (!isNaN(dates[0]) && !isNaN(dates[1])) return dates[1] - dates[0];
                    else return b - a;
                } else return b[sortBy].localeCompare(a[sortBy]);
            }
            if (isArray(a) && isArray(b)) return b[0][sortBy].localeCompare(a[0][sortBy]);
        }
    };

    sortedData.sort((a, b) => {
        if (!a[key] || a[key] === undefined) return 1;
        else if (!b[key] || b[key] === undefined) return -1;
        else if (a[key] === b[key]) return 0;
        else return SORT_ORDER_BY[order](a[key], b[key]);
    });
    setData(sortedData);
    setOrder(order === 'ASC' ? 'DESC' : 'ASC');
};

export const useListMode = (data, setData) => {
    useEffect(() => {
        setData([...data]);
    }, [data]);

    return { sortData };
};
