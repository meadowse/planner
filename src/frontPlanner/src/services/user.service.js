import axios from 'axios';
import Cookies from 'js-cookie';

// Импорт доп.функционала
// import { isObject, dataLoader, findNestedObj } from '@helpers/helper';

const loadData = async partition => {
    const PARTITION_CONF = {
        // Информация о сотруднике
        employee: async () => {
            let resolvedData = {};

            await axios
                .post(`${window.location.origin}/api/getDataUser`, { employeeId: Cookies.get('MMUSERID') })
                .then(response => {
                    if (response.status === 200) {
                        if (response.data && response.data.length !== 0) {
                            const userData = {
                                fullName: response?.data[0]?.FIO || 'Нет данных',
                                photo: response?.data[0]?.photo || null,
                                post: response?.data[0]?.job || 'Нет данных',
                                personalPhone: response?.data[0]?.telephone || 'Нет данных',
                                mail: response?.data[0]?.email || 'Нет данных',
                                workPhone: response?.data[0]?.jobTelephone || 'Нет данных',
                                internalPhone: response?.data[0]?.addTelephone || 'Нет данных',
                                telegram: response?.data[0]?.telegram || 'Нет данных',
                                skype: response?.data[0]?.skype || 'Нет данных',
                                division: response?.data[0]?.department || 'Нет данных',
                                birthday: response?.data[0]?.birthday || 'Нет данных'
                            };
                            // return userData;
                            // alert(`userData: ${JSON.stringify(userData, null, 4)}`);
                            // resolvedData = userData;
                            resolvedData = Object.assign({}, userData);
                        }
                    }
                })
                .catch(error => {
                    if (error.response) {
                        console.log('server responded');
                        return {};
                    } else if (error.request) {
                        console.log('network error');
                        return {};
                    } else {
                        console.log(error);
                        return {};
                    }
                });
            return resolvedData;
            // return {};
        },
        // Договоры
        contracts: () => {},
        // Задачи
        tasks: () => {}
    };

    return partition ? PARTITION_CONF[partition]() : [];
};

const UserService = { loadData };

export default UserService;
