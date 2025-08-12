export const WEEK_DAYS = {
    Monday: 'Понедельник',
    Tuesday: 'Вторник',
    Wednesday: 'Среда',
    Thursday: 'Четверг',
    Friday: 'Пятница',
    Saturday: 'Суббота',
    Sunday: 'Воскресенье'
};
export const SHORT_WEEK_DAYS = {
    Monday: 'Пн',
    Tuesday: 'Вт',
    Wednesday: 'Ср',
    Thursday: 'Чт',
    Friday: 'Пт',
    Saturday: 'Сб',
    Sunday: 'Вс'
};
export const MONTHS = [
    'Январь',
    'Февраль',
    'Март',
    'Апрель',
    'Май',
    'Июнь',
    'Июль',
    'Август',
    'Сентябрь',
    'Октябрь',
    'Ноябрь',
    'Декабрь'
];
export const TEST_MONTHS = ['Январь', 'Февраль', 'Март'];
export const YEARS = [2022, 2023, 2024, 2025, 2026];

export const DATE_FORMAT_CONFIG = {
    'DDMMYYYY': (date, separator) => {
        if (date) {
            let year = date?.getFullYear();
            let month = date?.getMonth() + 1;
            let day = date?.getDate();

            return `${day <= 9 ? `0${day}` : day}${separator}${month <= 9 ? `0${month}` : month}${separator}${year}`;
        }
    },
    'YYYYMMDD': (date, separator) => {
        if (date) {
            let year = date?.getFullYear();
            let month = date?.getMonth() + 1;
            let day = date?.getDate();

            return `${year}${separator}${month <= 9 ? `0${month}` : month}${separator}${day <= 9 ? `0${day}` : day}`;
        }
    }
};
