const getTaskData = (data, disabledFields) => {
    const dataConf = {};
    const DEFAULT_VALUES = {
        // Задача
        task: value => {
            return value && Object.keys(value).length !== 0 ? value : '';
        },
        // Постановщик
        director: value => {
            return value && Object.keys(value).length !== 0 ? value : null;
        },
        // Испорлнитель
        executor: value => {
            return value && Object.keys(value).length !== 0 ? value : null;
        },
        // Дедлайн
        deadlineTask: value => {
            return value ? value : '';
        },
        // Завершено
        done: value => {
            return value ? value : 0;
        }
    };

    if (data && Object.keys(data).length !== 0) {
        if (disabledFields && Object.keys(disabledFields).length !== 0) {
            Object.keys(data).map(key =>
                DEFAULT_VALUES[key] && DEFAULT_VALUES[key] !== undefined && !disabledFields[key]
                    ? (dataConf[key] = DEFAULT_VALUES[key](data[key]))
                    : null
            );
        } else if (disabledFields && Object.keys(disabledFields).length === 0) {
            Object.keys(data).map(key =>
                DEFAULT_VALUES[key] && DEFAULT_VALUES[key] !== undefined
                    ? (dataConf[key] = DEFAULT_VALUES[key](data[key]))
                    : null
            );
        }
    } else {
        Object.keys(DEFAULT_VALUES).map(key =>
            DEFAULT_VALUES[key] && DEFAULT_VALUES[key] !== undefined ? (dataConf[key] = DEFAULT_VALUES[key]()) : null
        );
    }

    return dataConf;
};

const AddTaskService = {
    getTaskData
};

export default AddTaskService;
