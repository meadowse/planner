import axios from 'axios';
import Cookies from 'js-cookie';

// Импорт доп.функционала
import { isObject, findNestedObj } from '@helpers/helper';

// Импорт конфигураций
import { DATA_CONVERSION_MAP } from '@config/department.config';
import { EMPLOYEE_CONF, EMPLOYEE_DATA_CONF } from '@config/user.config';

const formData = data => {
    return data && data.length !== 0
        ? data?.map(item => {
              const newItem = {};
              Object.keys(item).map(key => {
                  newItem[key] = DATA_CONVERSION_MAP[key] ? DATA_CONVERSION_MAP[key](item[key]) : item[key];
              });
              return newItem;
          })
        : [];
};

const initStorageSettings = (tabs, tabOption) => {
    const newSettings = { activeTab: 0, data: [] };

    tabs.forEach(item => newSettings.data.push({ tab: item, option: { activeOption: 0, ...tabOption } }));

    localStorage.setItem('employee_settings', JSON.stringify(newSettings));
};

const loadData = async (partition, idEmployee) => {
    // console.log(`Userinfo loadData\npartition: ${partition}\nidEmployee: ${idEmployee}`);
    const PARTITION_CONF = {
        // Информация о пользователе
        profile: async () => {
            const resolvedData = {};
            await axios
                .post(`${window.location.origin}/api/getDataUser`, { employeeId: idEmployee })
                .then(response => {
                    if (response.status === 200) {
                        if (response.data && response.data.length !== 0) {
                            const employee = response.data[0];
                            // Информация о сотруднике
                            const userData = {
                                fullName: employee?.FIO || 'Нет данных',
                                photo: idEmployee ? `https://mm-mpk.ru/api/v4/users/${idEmployee}/image` : null,
                                post: employee?.job || 'Нет данных',
                                personalPhone: employee?.telephone || 'Нет данных',
                                mail: employee?.email || 'Нет данных',
                                workPhone: employee?.jobTelephone || 'Нет данных',
                                internalPhone: employee?.addTelephone || 'Нет данных',
                                telegram: employee?.telegram || 'Нет данных',
                                skype: employee?.skype || 'Нет данных',
                                division: employee?.department || 'Нет данных',
                                birthday: employee?.birthday || 'Нет данных',
                                office: employee?.office || 'Нет данных',
                                director: {
                                    mmId: employee?.idMMDirector || -1,
                                    fullName: employee?.fioDirector || 'Нет данных'
                                }
                            };
                            resolvedData.employee = Object.assign({}, userData);
                        }
                    }
                })
                .catch(error => {
                    if (error.response) {
                        console.log('server responded');
                        resolvedData.employee = {};
                    } else if (error.request) {
                        console.log('network error');
                        resolvedData.employee = {};
                    } else {
                        console.log(error);
                        resolvedData.employee = {};
                    }
                });
            return resolvedData;
        },
        // Задачи
        tasks: async () => {
            const resolvedData = {};

            await axios
                .post(`${window.location.origin}/api/getTasksEmployee`, { employeeId: idEmployee })
                .then(response => {
                    if (response.status === 200) {
                        if (response.data && response.data.length !== 0) {
                            resolvedData.tabData = formData(response.data, partition, null).sort(
                                (a, b) => b?.id - a?.id
                            );
                        }
                    }
                })
                .catch(error => {
                    if (error.response) {
                        console.log('server responded');
                        resolvedData.tabData = [];
                    } else if (error.request) {
                        console.log('network error');
                        resolvedData.tabData = [];
                    } else {
                        console.log(error);
                        resolvedData.tabData = [];
                    }
                });

            return resolvedData;
        },
        // Договоры
        contracts: async () => {
            const resolvedData = {};

            await axios
                .post(`${window.location.origin}/api/getContractsEmployee`, { employeeId: idEmployee })
                .then(response => {
                    if (response.status === 200) {
                        if (response.data && response.data.length !== 0) {
                            resolvedData.tabData =
                                formData(response.data, partition, null).sort((a, b) => b?.id - a?.id) || [];
                        }
                    }
                })
                .catch(error => {
                    if (error.response) {
                        console.log('server responded');
                        resolvedData.tabData = [];
                    } else if (error.request) {
                        console.log('network error');
                        resolvedData.tabData = [];
                    } else {
                        console.log(error);
                        resolvedData.tabData = [];
                    }
                });

            return resolvedData;
        },
        // Получение данных сотрудника для отправкии сообщения в ММ
        writemm: async () => {
            const resolvedData = {};
            await axios
                .post(`${window.location.origin}/api/getDataUser`, { employeeId: idEmployee })
                .then(response => {
                    if (response.status === 200) {
                        if (response.data && response.data.length !== 0) {
                            const employee = response.data[0];
                            // Информация о сотруднике
                            const userData = {
                                login: employee?.login || 'Нет данных'
                            };
                            resolvedData.employee = Object.assign({}, userData);
                        }
                    }
                })
                .catch(error => {
                    if (error.response) {
                        console.log('server responded');
                        resolvedData.employee = {};
                    } else if (error.request) {
                        console.log('network error');
                        resolvedData.employee = {};
                    } else {
                        console.log(error);
                        resolvedData.employee = {};
                    }
                });
            return resolvedData;
        }
    };

    return partition ? PARTITION_CONF[partition]() : [];
};

// Получение конфигурации пользователя
const getEmployeeConfig = () => {
    return EMPLOYEE_CONF;
};

// Получение разделов пользователя
const getTabs = () => {
    const tabs = EMPLOYEE_DATA_CONF?.tabs;
    return tabs && tabs.length !== 0 ? tabs : [];
};

// Получение опций раздела пользователя
const getTabOptions = tab => {
    if (tab && Object.keys(tab).length !== 0) {
        const tabs = getTabs();
        if (tabs && tabs.length !== 0) return findNestedObj(tabs, 'keyTab', tab?.key)?.tabOptions || [];
    }
    return [];
};

// Получение определенной опции режима отображения
const getTabOption = tab => {
    if (tab && Object.keys(tab).length !== 0) {
        const tabOptions = getTabOptions(tab);
        if (tabOptions && tabOptions.length !== 0) return tabOptions[0];
    }
    return {};
};

// Получение данных для отображения
const getValuesToDisplay = (tab, option) => {
    // console.log(`employee getValuesToDisplay option: ${JSON.stringify(option, null, 4)}`);
    const tabs = getTabs();
    if (tabs && tabs.length !== 0) {
        const keys = findNestedObj(tabs, 'keyTab', tab?.key)?.keys;
        if (isObject(keys) && Object.keys(keys).length !== 0) return keys[option?.key];
        return keys;
    }
    return [];
};

// Получение операций с данными
const getDataOperations = () => {
    const dataOperations = EMPLOYEE_DATA_CONF?.dataOperations;
    return dataOperations && dataOperations.length !== 0 ? dataOperations : [];
};

const UserService = {
    initStorageSettings,
    loadData,
    getEmployeeConfig,
    getTabs,
    getTabOptions,
    getTabOption,
    getValuesToDisplay,
    getDataOperations
};

export default UserService;
