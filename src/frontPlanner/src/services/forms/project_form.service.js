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
        // Задачи по проекту
        tasks: async () => {
            let tasksData = [];

            await axios
                .post(`${window.location.origin}/api/getTasksContracts`, payload)
                .then(response => (tasksData = formData(response?.data)))
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

            return tasksData;
        }
    };

    return tab ? TAB_CONF[tab]() : [];
};

const ProjectFormService = { loadData };

export default ProjectFormService;
