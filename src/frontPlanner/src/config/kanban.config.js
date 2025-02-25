// Импорт конфигураций
import { WEEK_DAYS } from '@config/calendar.config';

// Импорт доп.функционала
import { objectSearch } from '@helpers/helper';
import { getWeek, getDateInSpecificFormat } from '@helpers/calendar';

// Конфигурация
export const DRAG_AND_DROP_CONF_MAP = {
    stage: (header, oldItem) => {
        oldItem.stage.title = header.title;
        oldItem.stage.color = header.color;
        return oldItem;
    },
    status: (header, oldItem) => {
        oldItem.status.title = header.title;
        oldItem.status.color = header.color;
        return oldItem;
    },
    group: (header, oldItem) => {
        oldItem.group = header.title;
        return oldItem;
    },
    days: (header, oldItem) => {
        oldItem.durationWork = header.title;
        oldItem.departure = header.title;
        return oldItem;
    },
    user: (header, oldItem) => {
        oldItem.responsible.fullName = header.title;
        return oldItem;
    },
    cars: (header, oldItem) => {
        oldItem.car.stamp = header.title;
        return oldItem;
    }
};

// Конфигурация для фильтрации данных
export const FILTERS_CONF_MAP = {
    date: (itemHeader, data) => {
        let indWeek = -1;
        let date = '',
            dayOfWeek = '';
        let week = getWeek(new Date());

        console.log(`itemHeader: ${JSON.stringify(itemHeader, null, 4)}`);

        for (let i = 0; i < week.length; i++) {
            dayOfWeek = week[i].toLocaleString('en-US', { weekday: 'long' });
            indWeek = i;
            if (WEEK_DAYS[dayOfWeek] === itemHeader.title) break;
        }

        date = getDateInSpecificFormat(
            new Date(week[indWeek].getFullYear(), week[indWeek].getMonth(), week[indWeek].getDate()),
            { format: 'YYYYMMDD', separator: '-' }
        );

        return data.filter(item => item?.dateOfEnding?.value === date);
    },
    cars: (itemHeader, data) => {
        return data.filter(item => objectSearch(item, itemHeader?.numCar));
    },
    user: (itemHeader, data) => {
        return data.filter(item => item?.responsible && objectSearch(item?.responsible, itemHeader?.title));
    },
    getData: (itemHeader, data) => {
        return data.filter(item => objectSearch(item, itemHeader?.title));
    }
};
