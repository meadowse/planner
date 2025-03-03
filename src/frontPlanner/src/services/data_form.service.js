import axios from 'axios';

// Импорт доп.функционала
import { dataLoader } from '@helpers/helper';

// Импорт конфигураций
import { DATA_CONVERSION_MAP, DATA_FORM_CONF } from '../config/data_form.config';

const formData = (data, tab) => {
    const TAB_CONF = {
        general: () => {},
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
    };
    return tab ? TAB_CONF[tab]() : [];
};

const loadData = (tab, payload) => {
    console.log(`tab:${tab}\npayload: ${JSON.stringify(payload, null, 4)}`);

    const TAB_CONF = {
        // Работы
        works: async () => {
            let worksData = [],
                tasksData = [];

            await axios
                .post(`${window.location.origin}/api/getTypesWork`, payload)
                .then(response => {
                    if (response?.status === 200) {
                        if (response?.data && response?.data.length !== 0) worksData = response?.data;
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

            await axios
                .post(`${window.location.origin}/api/getTasksContracts`, payload)
                .then(response => {
                    if (response?.status === 200) {
                        if (response?.data && response?.data.length !== 0) tasksData = formData(response?.data, tab);
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

            return {
                works: worksData || [],
                tasks: tasksData || []
            };
        }
    };

    return tab ? TAB_CONF[tab]() : [];
};

const getOptions = key => {
    return DATA_FORM_CONF[key];
};

const DataFormService = { loadData, getOptions };

export default DataFormService;

// const WORKS_DATA = [
//     {
//         dateDone: '2024-12-09',
//         deadline: 6,
//         done: 1,
//         number: 1,
//         typeWork:
//             'Досудебное обследование Объекта, на соответствие градостроительным, строительным, противопожарным, санитарным нормам и правилам с подготовкой дефектной ведомости'
//     }
// ];

// const TASKS_DATA = [
//     {
//         id: 11,
//         idTypeWork: 22,
//         idDirector: 33,
//         idExecutor: 44,
//         task: 'Задача1',
//         dateDone: '2025-02-25',
//         director: {
//             fullName: 'Фамилия Имя'
//         },
//         executor: {
//             fullName: 'Фамилия Имя'
//         }
//     }
// ];
