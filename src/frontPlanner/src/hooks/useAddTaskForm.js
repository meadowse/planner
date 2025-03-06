import { useState } from 'react';

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
    const [values, setValues] = useState(initialData);
    console.log(`initialData: ${JSON.stringify(initialData, null, 4)}`);

    let config = Object.assign({}, getTaskConfig(initialData, disabledFields));
    let dataForm = Object.assign({}, values);

    const validate = () => {};

    const onChange = e => {
        dataForm = { ...values, [e.target.name]: e.target.value };
        setValues(dataForm);
    };

    const onClick = (key, value) => {
        dataForm = { ...values, [key]: value };
        // console.info(value);
        setValues(dataForm);
    };

    return {
        values,
        onChange,
        onClick
    };
};
