import { useEffect, useState } from 'react';

function getTaskConfig(initialData, disabledFields) {
    // console.log(
    //     `getTaskConfig initialData: ${JSON.stringify(initialData, null, 4)}\ndisabledFields: ${JSON.stringify(
    //         disabledFields,
    //         null,
    //         4
    //     )}`
    // );
    const template = {};

    if (!disabledFields) {
        Object.keys(initialData).map(key => {
            template[key] = {};
        });
    }

    console.log(`template: ${JSON.stringify(template, null, 4)}`);

    return template;
}

export const useTaskForm = (initialData, disabledFields) => {
    const [values, setValues] = useState(initialData);
    // console.log(`initialData: ${JSON.stringify(initialData, null, 4)}`);

    let config = Object.assign({}, getTaskConfig(initialData, disabledFields));
    // let dataForm = Object.assign({}, values);

    // Валидация формы
    const validate = () => {};

    // Изменение значения
    const onChange = e => {
        setValues(prevState => {
            return { ...prevState, [e.target.name]: e.target.value };
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
        onClick
    };
};
