import axios from 'axios';

// Импорт доп.функционала
import { dataLoader } from '@helpers/helper';

// Импорт конфигураций
import { DATA_CONVERSION_MAP, DATA_FORM_CONF } from '../config/data_form.config';

const formData = (data, tab) => {
    const TAB_CONF = {
        general: () => { },
        works: () => {
            return data && data.length !== 0
                ? data?.map(item => {
                    const newItem = {};
                    Object.keys(item).map(key => {
                        newItem[key] = DATA_CONVERSION_MAP[key] ? DATA_CONVERSION_MAP[key](item[key]) : item[key];
                    });
                    return newItem;
                })
                : [];
        }
    }
    return tab ? TAB_CONF[tab]() : [];
}

const loadData = (tab, payload) => {
    const WORKS_DATA = [
        {
            dateDone: "2024-12-09",
            deadline: 6,
            done: 1,
            number: 1,
            typeWork: "Досудебное обследование Объекта, на соответствие градостроительным, строительным, противопожарным, санитарным нормам и правилам с подготовкой дефектной ведомости"
        }
    ]

    const TASKS_DATA = [
        {
            id: 11,
            idTypeWork: 22,
            idDirector: 33,
            idExecutor: 44,
            task: "Задача1",
            dateDone: "2025-02-25",
            director: {
                fullName: "Фамилия Имя"
            },
            executor: {
                fullName: "Фамилия Имя"
            }
        }
    ]

    const TAB_CONF = {
        // Работы
        works: () => {
            return {
                // works: await axios.post(`${window.location.origin}/api/getTypesWork`, payload),
                // tasks: await axios.post(`${window.location.origin}/api/get`, payload),
                works: WORKS_DATA,
                tasks: formData(TASKS_DATA, tab)
            }
        }
    };

    return tab ? TAB_CONF[tab]() : [];
};

const getOptions = key => {
    return DATA_FORM_CONF[key];
};

const DataFormService = { loadData, getOptions };

export default DataFormService;
