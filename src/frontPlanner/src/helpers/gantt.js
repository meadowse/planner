// Импорт конфигураций
import { MONTHS } from '@config/calendar.config';

// Импорт дополнительного функционала
import { getDaysInMonth, getDateFromString } from '@helpers/calendar';

export function getValuesTask(arr, condition) {
    // console.log(`arr = ${JSON.stringify(arr, null, 4)}`);

    let newArr = arr.filter(item => {
        return item !== condition;
    });
    let arrsInd = [],
        rowTasks = [];
    let startInd = 0,
        endInd = 0;

    for (let i = 0; i < newArr.length; i++) {
        startInd = i;
        endInd = i + 1;
        if (newArr[endInd] - newArr[startInd] === 1) {
            rowTasks.push(newArr[startInd], newArr[endInd]);
        } else {
            rowTasks.push(newArr[startInd]);
            arrsInd.push([...new Set(rowTasks)]);
            rowTasks = [];
        }
    }

    // console.log(`arrsInd = ${JSON.stringify(arrsInd, null, 4)}`);

    return arrsInd;
}

export function getDataByMonth(dates, dateState) {
    let monthElem = {
        month: '',
        days: []
    };

    return MONTHS.map((chMonth, indChMonth) => {
        monthElem = {
            month: '',
            days: []
        };

        monthElem.month = chMonth;

        getDaysInMonth(dateState.year, indChMonth).map(() => {
            monthElem.days.push(0);
        });

        if (dates && dates.length !== 0) {
            dates.map(date => {
                date = getDateFromString(date);
                if (date && indChMonth === date?.getMonth() && date?.getFullYear() === dateState?.year) {
                    monthElem.days[date?.getDate() - 1] = date?.getDate();
                }
            });
        }

        return monthElem;
    });
}
