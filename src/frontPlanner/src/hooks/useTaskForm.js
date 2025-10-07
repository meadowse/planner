import { useEffect, useState } from 'react';

function getTaskConfig(initialData, disabledFields) {
    const template = {};

    if (!disabledFields) {
        Object.keys(initialData).map(key => {
            template[key] = {};
        });
    }

    // console.log(`template: ${JSON.stringify(template, null, 4)}`);

    return template;
}

// Подсчет количества ошибок
function performErrorCounting(data) {
    let countErr = 0;
    Object.keys(data).map(key => {
        if (typeof data[key] === 'object') {
            if (Object.keys(data[key]).length !== 0) countErr++;
        }
        if (Array.isArray(data[key])) {
            countErr = countErr - 1;
            data[key].map(item => {
                Object.keys(item).map(subKey => {
                    if (Object.keys(subKey).length !== 0) countErr++;
                });
            });
        }
    });
    return countErr;
}

export const useTaskForm = (initialData, disabledFields) => {
    const [errorsInfo, setErrorsInfo] = useState({});
    // const [deleteInfo, setDeleteInfo] = useState({});

    const [values, setValues] = useState(initialData);
    // console.log(`initialData: ${JSON.stringify(initialData, null, 4)}`);

    // Создаем config для того чтобы не работать напрямую с errorsInfo
    let config = Object.assign({}, getTaskConfig(initialData, disabledFields));
    let deleteConfig = {};

    // Валидация формы
    const validate = (name, value) => {
        console.log(`${name}: ${JSON.stringify(value, null, 4)}`);
        let error = {};
        const VALIDATION_CONF = {
            director: () => {
                if (!value || Object.keys(value).length === 0) {
                    error = { message: 'Выберите постановщика!' };
                    config.director = error;
                } else delete config.director;
            },
            executor: () => {
                if (!value || Object.keys(value).length === 0) {
                    error = { message: 'Выберите исполнителя!' };
                    config.executor = error;
                } else delete config.executor;
            },
            task: () => {
                if (!value || value === '' || value.length === 0) {
                    error = { message: 'Поле обязательно для заполнения!' };
                    config.task = error;
                } else delete config.task;
                setErrorsInfo(config);
            },
            plannedTimeCosts: () => {
                if (!value || value <= 0) {
                    error = { message: 'Выберите план. времязатраты!' };
                    config.plannedTimeCosts = error;
                } else delete config.plannedTimeCosts;
                setErrorsInfo(config);
            }
        };

        if (name in VALIDATION_CONF) VALIDATION_CONF[name]();

        return errorsInfo;
    };

    // Изменение значения
    const onChange = e => {
        validate(e.target.name, e.target.value);
        setValues(prevState => {
            return { ...prevState, [e.target.name]: e.target.value };
        });
    };

    const onChangeByKey = (key, value) => {
        setValues(prevState => {
            return { ...prevState, [key]: value };
        });
    };

    const onClick = (key, value) => {
        validate(key, value);
        // console.log(`useTaskForm onClick vals: ${JSON.stringify(dataForm, null, 4)}`);
        setValues(prevState => {
            return { ...prevState, [key]: value };
        });
    };

    const getModalConfig = refreshData => {
        if (refreshData && Object.keys(refreshData).length !== 0) {
            const { subtasks, timeCosts, coExecutors } = refreshData;

            const hasSubtasks = subtasks && subtasks.length > 0 ? true : false;
            const hasTimeCosts = timeCosts && timeCosts.length > 0 ? true : false;
            const hasCoExecutors = coExecutors && coExecutors.length > 0 ? true : false;

            const configs = [
                {
                    condition: !hasSubtasks && !hasTimeCosts && !hasCoExecutors,
                    config: {
                        type: 'confirm',
                        title: 'Вы действительно хотите удалить эту задачу?'
                    }
                },
                {
                    condition: hasSubtasks,
                    config: {
                        type: 'info',
                        title: 'Не удалось удалить задачу, т.к. присутствуют записи по подзадачам или времязатратам или соисполнителям.'
                    }
                },
                {
                    condition: hasTimeCosts,
                    config: {
                        type: 'info',
                        title: 'Не удалось удалить задачу, т.к. присутствуют записи по подзадачам или времязатратам или соисполнителям.'
                    }
                },
                {
                    condition: hasCoExecutors,
                    config: {
                        type: 'info',
                        title: 'Не удалось удалить задачу, т.к. присутствуют записи по подзадачам или времязатратам или соисполнителям.'
                    }
                }
            ];

            // console.log(`configs arr : ${JSON.stringify(configs, null, 4)}`);

            return configs.find(item => item.condition)?.config;
        }
        return null;
    };

    // Проверяем данные перед отправкой
    const checkData = () => {
        Object.keys(values).map(key => {
            validate(key, values[key]);
        });

        setErrorsInfo(config);

        // console.log(`values = ${JSON.stringify(values, null, 4)}`);
        // console.log(`config errors = ${JSON.stringify(config, null, 4)}\ncountErrs = ${performErrorCounting(config)}`);

        return performErrorCounting(config) === 0 ? true : false;
    };

    return {
        values,
        errorsInfo,
        onChange,
        onChangeByKey,
        onClick,
        getModalConfig,
        checkData
    };
};
