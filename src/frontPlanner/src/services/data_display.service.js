import axios from 'axios';
import Cookies from 'js-cookie';

// Импорт доп.функционала
import { isObject, dataLoader, findNestedObj } from '@helpers/helper';

// Импорт конфигураций
import {
    DATA_CONVERSION_MAP,
    DEPARTMENT_DATA_CONF,
    EQUIPMENT_DATA_CONF,
    COMPANY_DATA_CONF,
    TASKS_DATA_CONF
} from '@config/department.config';

// Импорт данных
import EMPLOYEES from '@data/usersData.json';

const formData = (data, partition, key) => {
    const PARTITION_CONF = {
        // Компания
        company: () => {
            const COMPANY_CONF = {
                // Структура компании
                structure: () => {},
                // Сотрудники компании
                employees: () => {
                    let newItem, newData;
                    newData = data.map(item => {
                        if (item && Object.keys(item).length !== 0) {
                            newItem = {};
                            newItem['id'] = item?.id;
                            newItem['responsible'] = {
                                fullName: item?.fullName,
                                post: item?.post,
                                photo: '/img/user.svg'
                            };
                            newItem['subsection'] = item?.subsection;
                            newItem['phone'] = item?.phone;
                            newItem['email'] = item?.email;
                        }
                        return newItem;
                    });
                    // console.log(`newData: ${JSON.stringify(newData, null, 4)}`);
                    return newData;
                }
            };
            return key ? COMPANY_CONF[key]() : [];
        },
        default: () => {
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
    return PARTITION_CONF[partition] ? PARTITION_CONF[partition]() : PARTITION_CONF.default();
};

const loadData = async partition => {
    const PARTITION_CONF = {
        // Производственный департамент
        department: async () => {
            const endpoints = [
                `${window.location.origin}/api/`,
                `${window.location.origin}/api/getAllDepartmentsStaffAndTasks`
            ];
            const resolvedData = {};
            await axios
                .all(endpoints?.map(endpoint => dataLoader(endpoint)))
                .then(
                    axios.spread((contractsData, sectionsData) => {
                        if (contractsData && contractsData.length !== 0)
                            resolvedData.contracts = formData(contractsData, partition, null)?.sort(
                                (a, b) => b?.id - a?.id
                            );
                        if (sectionsData && sectionsData.length !== 0) {
                            resolvedData.sections = sectionsData?.map(item => {
                                if (item && Object.keys(item).length !== 0) {
                                    return {
                                        section: item?.section,
                                        employee: item?.employee,
                                        contracts: formData(item?.contracts, partition, null)?.sort(
                                            (a, b) => +b?.id - +a?.id
                                        )
                                    };
                                }
                            });
                        }
                    })
                )
                .catch(error => {
                    if (error.response) {
                        console.log('server responded');
                    } else if (error.request) {
                        console.log('network error');
                    } else {
                        console.log(error);
                    }
                });
            // console.log(`resolvedData: ${JSON.stringify(resolvedData, null, 4)}`);
            // return formData(await dataLoader(`${window.location.origin}/contracts.json`), partition, null);
            // return formData(await dataLoader('http://10.199.254.28:3000/api/'), partition, null);
            return resolvedData;
        },
        // Оборудование
        equipment: async () => {
            return formData(await dataLoader(`${window.location.origin}/equipment.json`), partition, null);
        },
        // Компания
        company: async () => {
            const endpoints = [
                `${window.location.origin}/structure_company.json`,
                `${window.location.origin}/api/employee/`
            ];
            const resolvedData = {};

            await axios
                .all(endpoints.map(endpoint => dataLoader(endpoint)))
                .then(
                    axios.spread((structureData, employeesData) => {
                        if (structureData && structureData.length !== 0) resolvedData.structure = structureData;
                        if (employeesData && employeesData.length !== 0)
                            resolvedData.employees = formData(employeesData, partition, 'employees');
                    })
                )
                .catch(error => {
                    if (error.response) {
                        console.log('server responded');
                    } else if (error.request) {
                        console.log('network error');
                    } else {
                        console.log(error);
                    }
                });

            return resolvedData;
        },
        // Задачи
        tasks: async () => {
            const resolvedData = {};
            const endPoints = [`${window.location.origin}/api/getTasksEmployee`];

            await axios
                .all(endPoints.map(endpoint => axios.post(endpoint, { employeeId: 'qdtqwr4uhif68kagmofq48j58c' })))
                .then(
                    axios.spread((tasks, contracts) => {
                        resolvedData.tasks = formData(tasks?.data, partition, null).sort((a, b) => b?.id - a?.id) || [];
                        resolvedData.contracts = contracts || [];
                        // if (tasks?.data && tasks?.data.length !== 0) resolvedData.tasks = tasks?.data;
                        // if (contracts && contracts.length !== 0) resolvedData.contracts = contracts;
                    })
                )
                .catch(error => {
                    if (error.response) {
                        console.log('server responded');
                        resolvedData.tasks = [];
                        // resolvedData.contracts = [];
                    } else if (error.request) {
                        console.log('network error');
                        resolvedData.tasks = [];
                        // resolvedData.contracts = [];
                    } else {
                        console.log(error);
                        resolvedData.tasks = [];
                        // resolvedData.contracts = [];
                    }
                });
            return resolvedData;
        }
    };

    return partition ? PARTITION_CONF[partition]() : [];
};

// Получение режимов отображения
const getDisplayModes = partition => {
    const PARTITION_CONF = {
        // Производственный департамент
        department: () => {
            const displayModes = DEPARTMENT_DATA_CONF?.displayModes;
            return displayModes && displayModes.length !== 0 ? displayModes : [];
        },
        // Оборудование
        equipment: () => {
            const displayModes = EQUIPMENT_DATA_CONF?.displayModes;
            return displayModes && displayModes.length !== 0 ? displayModes : [];
        },
        // Компания
        company: () => {
            const displayModes = COMPANY_DATA_CONF?.displayModes;
            return displayModes && displayModes.length !== 0 ? displayModes : [];
        },
        // Задачи
        tasks: () => {
            const displayModes = TASKS_DATA_CONF?.displayModes;
            return displayModes && displayModes.length !== 0 ? displayModes : [];
        }
    };
    return partition ? PARTITION_CONF[partition]() : [];
};

// Получение опций режима отображения
const getModeOptions = (partition, mode) => {
    if (mode && Object.keys(mode).length !== 0) {
        const displayModes = getDisplayModes(partition);
        if (displayModes && displayModes.length !== 0)
            return findNestedObj(displayModes, 'keyMode', mode?.key)?.modeOptions || [];
    }

    return [];
};

// Получение определенной опции режима отображения
const getModeOption = (partition, mode) => {
    if (mode && Object.keys(mode).length !== 0) {
        const modeOptions = getModeOptions(partition, mode);
        if (modeOptions && modeOptions.length !== 0) return modeOptions[0];
    }
    return {};
};

// Получение данных для отображения
const getValuesToDisplay = (partition, mode, option) => {
    if (mode && Object.keys(mode).length !== 0) {
        const displayModes = getDisplayModes(partition);
        if (displayModes && displayModes.length !== 0) {
            const keys = findNestedObj(displayModes, 'keyMode', mode?.key)?.keys;
            if (isObject(keys) && Object.keys(keys).length !== 0) return keys[option?.key];
            return keys;
        }
    }
    return [];
};

// Получение операций с данными
const getDataOperations = partition => {
    const PARTITION_CONF = {
        // Производственный департамент
        department: () => {
            const dataOperations = DEPARTMENT_DATA_CONF?.dataOperations;
            return dataOperations && dataOperations.length !== 0 ? dataOperations : [];
        },
        // Оборудование
        equipment: () => {
            const dataOperations = EQUIPMENT_DATA_CONF?.dataOperations;
            return dataOperations && dataOperations.length !== 0 ? dataOperations : [];
        },
        // Компания
        company: () => {
            const dataOperations = COMPANY_DATA_CONF?.dataOperations;
            return dataOperations && dataOperations.length !== 0 ? dataOperations : [];
        },
        // Задачи
        tasks: () => {
            const dataOperations = TASKS_DATA_CONF?.dataOperations;
            return dataOperations && dataOperations.length !== 0 ? dataOperations : [];
        }
    };
    return partition ? PARTITION_CONF[partition]() : [];
};

// const PARTITION_CONF = {
//     // Производственный департамент
//     department: () => {
//     },
//     // Оборудование
//     equipment: () => {},
//     // Компания
//     company: () => {}
// };

const DataDisplayService = {
    loadData,
    getDisplayModes,
    getModeOptions,
    getModeOption,
    getValuesToDisplay,
    getDataOperations
};

export default DataDisplayService;
