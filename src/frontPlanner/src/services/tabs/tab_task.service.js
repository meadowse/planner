// Импорт доп.функционала
import { findNestedObj } from '@helpers/helper';
import { getDateInSpecificFormat } from '@helpers/calendar';

// Импорт конфигураций
import { DATA_FORM_OPERATIONS } from '@config/tabs/tab_work.config';

const getDataFormOperation = operation => {
    return findNestedObj(DATA_FORM_OPERATIONS, 'key', operation);
};

const getTaskData = (data, disabledFields) => {
    const dataConf = {};
    const DEFAULT_VALUES = {
        // Вид работы
        typeWork: value => {
            return value && Object.keys(value).length !== 0 ? value : null;
        },
        // Задача
        task: value => {
            return value && Object.keys(value).length !== 0 ? value : '';
        },
        // Постановщик
        director: value => {
            return value && Object.keys(value).length !== 0 ? value : null;
        },
        // Исполнитель
        executor: value => {
            return value && Object.keys(value).length !== 0 ? value : null;
        },
        // Дата начала
        dateStart: value => {
            const currDateYYYYMMDD = getDateInSpecificFormat(new Date(), {
                format: 'YYYYMMDD',
                separator: '-'
            });
            return value ? value : currDateYYYYMMDD;
        },
        // Дедлайн
        deadlineTask: value => {
            // return value ? value : '';
            return value && Object.keys(value).length !== 0 ? value : null;
        },
        // Завершено
        done: value => {
            return value ? value : 0;
        },
        // Комментарий
        comment: value => {
            return value ? value : '';
        }
    };

    if (data && Object.keys(data).length !== 0) {
        if (disabledFields) {
            if (Object.keys(disabledFields).length !== 0) {
                Object.keys(data).map(key =>
                    DEFAULT_VALUES[key] && DEFAULT_VALUES[key] !== undefined && !disabledFields[key]
                        ? (dataConf[key] = DEFAULT_VALUES[key](data[key]))
                        : null
                );
            } else {
                Object.keys(data).map(key =>
                    DEFAULT_VALUES[key] && DEFAULT_VALUES[key] !== undefined
                        ? (dataConf[key] = DEFAULT_VALUES[key](data[key]))
                        : null
                );
            }
        }
    } else {
        if (disabledFields) {
            if (Object.keys(disabledFields).length !== 0) {
                Object.keys(DEFAULT_VALUES).map(key =>
                    DEFAULT_VALUES[key] && DEFAULT_VALUES[key] !== undefined && !disabledFields[key]
                        ? (dataConf[key] = DEFAULT_VALUES[key]())
                        : null
                );
            } else {
                Object.keys(DEFAULT_VALUES).map(key =>
                    DEFAULT_VALUES[key] && DEFAULT_VALUES[key] !== undefined
                        ? (dataConf[key] = DEFAULT_VALUES[key]())
                        : null
                );
            }
        }
    }

    return dataConf;
};

const TaskService = {
    getDataFormOperation,
    getTaskData
};

export default TaskService;
