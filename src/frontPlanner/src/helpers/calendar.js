// Импорт конфигураций
import { MONTHS, DATE_FORMAT_CONFIG } from '@config/calendar.config';

export function getLastDayOfMonth(date) {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

export function getDateInFormatDDMMYY(year, month, day) {
    return new Date(year, month, day).toLocaleDateString('pl', { day: 'numeric', month: 'numeric', year: '2-digit' });
}

export function getAddedDay(date, days) {
    const newDate = new Date(date);
    newDate.setDate(date.getDate() + days);
    return newDate;
}

export function getDayInYear(date) {
    if (date) {
        let start = new Date(date.getFullYear(), 0, 0);
        let diff = date - start + (start.getTimezoneOffset() - date.getTimezoneOffset()) * 60 * 1000;
        let oneDay = 1000 * 60 * 60 * 24;
        return Math.floor(diff / oneDay);
    }
}

export function getDaysYear(dateState) {
    const year = [];

    MONTHS.map((_, indMonth) => {
        getDaysInMonth(dateState.year, indMonth).map(date => {
            year.push(date);
        });
    });
    return year;
}

export function dayDiff(startDate, endDate) {
    const difference = endDate.getTime() - startDate.getTime();
    const days = Math.ceil(difference / (1000 * 3600 * 24)) + 1;
    // console.log(`days: ${JSON.stringify(days, null, 4)}`);
    return days;
}

export function getDaysBetweenTwoDates(beginDate, endDate) {
    // console.log(`beginDate: ${beginDate}\nendDate:${endDate}`);
    if (!beginDate && endDate) return [endDate];
    else if (!endDate && beginDate) return [beginDate];
    else if (!beginDate && !endDate) return [];
    else {
        const res = [];

        while (beginDate <= endDate) {
            res.push(new Date(beginDate));
            beginDate.setUTCDate(beginDate.getUTCDate() + 1);
        }

        // console.log(`days: ${JSON.stringify(res.length, null, 4)}`);

        return res;
    }
}

// Функция для получения данных в определенном формате
export function getDateInSpecificFormat(date, options) {
    return DATE_FORMAT_CONFIG[options?.format](date, options?.separator);
}

export function getDateFromString(date) {
    const regExp1 = /^(19|20)\d\d[-/.](0[1-9]|1[012])[-/.](0[1-9]|[12][0-9]|3[01])$/; // Format 1: "YYYY-/.MM-/.DD"
    const regExp2 = /^(0[1-9]|[12][0-9]|3[01])[-/.](0[1-9]|1[012])[-/.](19|20)\d\d$/; // Format 2 : "DD-/.MM-/.YYYY"
    const regExp3 = /^(0[1-9]|1[012])[-/.](0[1-9]|[12][0-9]|3[01])[-/.]([19|20]\d\d)$/; // Format 3 : "MM-/.DD-/.YYYY"

    let parts = [];

    switch (true) {
        case regExp1.test(date):
            parts = date.split(/[-/.]/);
            return new Date(Number(parts[0]), Number(parts[1] - 1), Number(parts[2]));
        case regExp2.test(date):
            parts = date.split(/[-/.]/);
            return new Date(Number(parts[2]), Number(parts[1] - 1), Number(parts[0]));
        case regExp3.test(date):
            parts = date.split(/[-/.]/);
            return new Date(Number(parts[1]), Number(parts[0] - 1), Number(parts[2]));
        default:
            return null;
    }
}

// Функция для получения дней месяца
export function getDaysInMonth(year, month) {
    let date = new Date(year, month, 1);
    let days = [];
    while (date.getMonth() === month) {
        days.push(new Date(date));
        date.setDate(date.getDate() + 1);
    }
    // console.log(`DaysInMonth: ${JSON.stringify(days, null, 4)}`);
    return days;
}

// Функция для получения текущей недели
export function getWeek(fromDate) {
    let monday = new Date(
        fromDate.setDate(fromDate.getDate() - fromDate.getDay() + (fromDate.getDay() === 0 ? -6 : 1))
    );
    let date = new Date(monday);
    let res = [monday];

    while (date.setDate(date.getDate() + 1) && date.getDay() !== 1) {
        res.push(new Date(date));
    }

    // console.log(`res = ${JSON.stringify(res, null, 4)}`);
    return res;
}

// Функция для получения дней месяца
// исходя из выбранной даты (Год - Месяц)
export const getMonthDays = date => {
    let firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    let weekdayOfFirstDay = firstDayOfMonth.getDay();

    let currentDays = [];

    for (let day = 0; day < 35; day++) {
        if (day === 0 && weekdayOfFirstDay === 0) {
            firstDayOfMonth.setDate(firstDayOfMonth.getDate() - 7);
        } else if (day === 0) {
            firstDayOfMonth.setDate(firstDayOfMonth.getDate() + (day - weekdayOfFirstDay) + 1);
        } else {
            firstDayOfMonth.setDate(firstDayOfMonth.getDate() + 1);
        }

        let calendarDay = {
            currentMonth: firstDayOfMonth.getMonth() === date.getMonth(),
            date: new Date(firstDayOfMonth),
            day: firstDayOfMonth.getDay(),
            dayOfWeek: firstDayOfMonth.toLocaleString('en-US', { weekday: 'long' }),
            number: firstDayOfMonth.getDate(),
            month: firstDayOfMonth.getMonth(),
            year: firstDayOfMonth.getFullYear(),
            selected: firstDayOfMonth.toDateString() === date.toDateString()
        };

        currentDays.push(calendarDay);
    }
    return currentDays;
};
