import { useEffect, useState } from 'react';

function getTimeCostsConfig(initialData, disabledFields) {
    const template = {};

    if (!disabledFields) {
        Object.keys(initialData).map(key => {
            template[key] = {};
        });
    }

    console.log(`template: ${JSON.stringify(template, null, 4)}`);

    return template;
}

export const useTimeCosts = (initialData, disabledFields) => {
    const [values, setValues] = useState(initialData);
    // console.log(`initialData: ${JSON.stringify(initialData, null, 4)}`);

    let config = Object.assign({}, getTimeCostsConfig(initialData, disabledFields));

    // Валидация формы
    const validate = () => {};

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
