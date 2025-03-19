import axios from 'axios';

// Импорт конфигураций
import { DATA_CONVERSION_MAP, DATA_FORM_CONF } from '@config/data_form.config';

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

const loadData = (tab, payload) => {
    // console.log(`tab:${tab}\npayload: ${JSON.stringify(payload, null, 4)}`);

    const TAB_CONF = {
        // Общие
        general: async () => {
            let contract = {};
            await axios
                .post(`${window.location.origin}/api/getAgreement`, payload)
                .then(response => {
                    if (response?.status === 200) contract = formData(response?.data)[0];
                })
                .catch(error => {
                    if (error.response) {
                        console.log('server responded');
                    } else if (error.request) {
                        console.log('network error');
                    } else {
                        console.log(error);
                    }
                });
            return contract;
        },
        // Работы
        works: async () => {
            let worksData = [],
                tasksData = [];
            let endpoints = [
                `${window.location.origin}/api/getTypesWork`,
                `${window.location.origin}/api/getTasksContracts`
            ];
            await axios
                .all(endpoints.map(endpoint => axios.post(endpoint, payload)))
                .then(
                    axios.spread((resolvedWorks, resolvedTasks) => {
                        worksData = resolvedWorks?.data;
                        tasksData = formData(resolvedTasks?.data);
                    })
                )
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
