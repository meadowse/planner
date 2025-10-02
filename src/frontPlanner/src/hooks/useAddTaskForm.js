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

export const useTaskForm = (initialData, disabledFields) => {
    const [errorsInfo, setErrorsInfo] = useState({});
    const [values, setValues] = useState(initialData);
    // console.log(`initialData: ${JSON.stringify(initialData, null, 4)}`);

    let config = Object.assign({}, getTaskConfig(initialData, disabledFields));
    // let dataForm = Object.assign({}, values);

    // Валидация формы
    const validate = (name, value) => {
        let error = {};

        const VALIDATION_CONF = {
            task: () => {
                if (!value) {
                    error = { message: 'Поле обязательно для заполнения!' };
                    config.condition = error;
                    setErrorsInfo(config);
                } else {
                    delete config.condition;
                    setErrorsInfo(config);
                }
            },
            plannedTimeCosts: () => {
                if (!value) {
                    error = { message: 'Выберите план. времязатраты!' };
                    config.condition = error;
                    setErrorsInfo(config);
                } else if (+value === 0) {
                    error = { message: 'Значение в поле план. времязатраты должно быть > 0!' };
                    config.condition = error;
                    setErrorsInfo(config);
                } else {
                    delete config.condition;
                    setErrorsInfo(config);
                }
            }
        };
    };

    // Изменение значения
    const onChange = e => {
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
        // console.log(`useTaskForm onClick vals: ${JSON.stringify(dataForm, null, 4)}`);
        setValues(prevState => {
            return { ...prevState, [key]: value };
        });
    };

    return {
        values,
        onChange,
        onChangeByKey,
        onClick
    };
};
