// Импорт доп.функционала
import { dataLoader, findNestedObj } from '@helpers/helper';

// Импорт конфигураций
import {
    DATA_CONVERSION_MAP,
    DEPARTMENT_DATA_CONF,
    EQUIPMENT_DATA_CONF,
    COMPANY_DATA_CONF
} from '@config/department.config';

//
import EMPLOYEES from '@data/usersData.json';

const formData = (data, partition, key) => {
    const PARTITION_CONF = {
        // Производственный департамент
        department: () => {
            return data && data.length !== 0
                ? data?.map(item => {
                      const newItem = {};
                      Object.keys(item).map(key => {
                          newItem[key] = DATA_CONVERSION_MAP[key] ? DATA_CONVERSION_MAP[key](item[key]) : item[key];
                      });
                      return newItem;
                  })
                : [];
        },
        // Оборудование
        equipment: () => {
            return data && data.length !== 0
                ? data?.map(item => {
                      const newItem = {};
                      Object.keys(item).map(key => {
                          newItem[key] = DATA_CONVERSION_MAP[key] ? DATA_CONVERSION_MAP[key](item[key]) : item[key];
                      });
                      return newItem;
                  })
                : [];
        },
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
        }
    };
    return partition ? PARTITION_CONF[partition]() : [];
};

const loadData = async partition => {
    const PARTITION_CONF = {
        // Производственный департамент
        department: async () => {
            // return formData(await dataLoader(`${window.location.origin}/contracts.json`), partition, null);
            // return formData(await dataLoader('http://10.199.254.28:3000/api/'), partition, null);
            return formData(await dataLoader(`${window.location.origin}/api/`), partition, null);
        },
        // Оборудование
        equipment: async () => {
            return formData(await dataLoader(`${window.location.origin}/equipment.json`), partition, null);
        },
        // Компания
        company: async () => {
            return {
                structure: await dataLoader(`${window.location.origin}/structure_company.json`),
                employees: formData(await dataLoader(`${window.location.origin}/api/employee/`), partition, 'employees')
                // employees: formData(EMPLOYEES, partition, 'employees')
            };
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
const getValuesToDisplay = (partition, mode) => {
    if (mode && Object.keys(mode).length !== 0) {
        const displayModes = getDisplayModes(partition);
        if (displayModes && displayModes.length !== 0)
            return findNestedObj(displayModes, 'keyMode', mode?.key)?.keys || [];
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
