import axios from 'axios';

// Импорт доп.функционала
import { isArray, findNestedObj } from '@helpers/helper';
import { getDateInSpecificFormat } from '@helpers/calendar';

// Импорт конфигураций
import { DATA_CONVERSION_MAP, DATA_FORM_OPERATIONS } from '@config/popups/popup_timecosts.config';

const getDataFormOperation = operation => {
    return findNestedObj(DATA_FORM_OPERATIONS, 'key', operation);
};

const getTimeCostData = (data, disabledFields) => {
    // console.log(`getTask data: ${JSON.stringify(data, null, 4)}`);
    const dataConf = {};
    const DEFAULT_VALUES = {
        // Задача
        task: value => value ?? {},
        // Дата
        dateReport: value => {
            const currDateYYYYMMDD = getDateInSpecificFormat(new Date(), {
                format: 'YYYYMMDD',
                separator: '-'
            });
            return value ?? currDateYYYYMMDD;
        },
        // Сотрудник
        employee: value => value ?? {},
        // Потраченное время
        spent: value => value ?? '',
        // Время в часах
        timeHours: value => value ?? 0.0,
        // Комментарий
        report: value => value ?? ''
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

    // console.log(`getTask dataConf: ${JSON.stringify(dataConf, null, 4)}`);

    return dataConf;
};

// Добавление времязатрат
const addTimeCost = async newData => {
    await axios
        .post(`${window.location.origin}/api/addTimeCost`, newData)
        .then(response => {
            if (response.status === 200) {
                //
            }
        })
        .catch(error => {
            if (error.response) {
                console.log(error.response);
                console.log('server responded');
            } else if (error.request) {
                console.log('network error');
            } else {
                console.log(error);
            }
        });
};

// Редактирование времязатрат
const editTimeCost = async newData => {
    await axios
        .post(`${window.location.origin}/api/editTimeCost`, newData)
        .then(response => {
            if (response.status === 200) {
                //
            }
        })
        .catch(error => {
            if (error.response) {
                console.log(error.response);
                console.log('server responded');
            } else if (error.request) {
                console.log('network error');
            } else {
                console.log(error);
            }
        });
};

// Удаление времязатрат
const deleteTimeCost = async idTimeCost => {
    await axios
        .post(`${window.location.origin}/api/deleteTimeCost`, { Id: idTimeCost })
        .then(response => {
            if (response.status === 200) {
                //
            }
        })
        .catch(error => {
            if (error.response) {
                console.log(error.response);
                console.log('server responded');
            } else if (error.request) {
                console.log('network error');
            } else {
                console.log(error);
            }
        });
};

const PopupTimeCostsService = { getDataFormOperation, getTimeCostData, addTimeCost, editTimeCost, deleteTimeCost };

export default PopupTimeCostsService;
