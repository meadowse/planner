import { useEffect, useState } from 'react';

function getContactConfig() {
    return {
        fullName: {},
        post: {},
        phone: {},
        email: {}
    };
}

function getGeneralConfig(initialData, disabledFields) {
    const template = {};
    const TEMPLATE_CONF = {
        contacts: () => {
            return [];
        },
        default: () => {
            return {};
        }
    };

    if (!disabledFields) {
        Object.keys(initialData).map(key => {
            if (TEMPLATE_CONF[key]) template[key] = TEMPLATE_CONF[key]();
            else template[key] = TEMPLATE_CONF.default();
        });
    }

    // console.log(`template: ${JSON.stringify(template, null, 4)}`);

    return template;
}

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

export const useGeneralForm = (initialData, disabledFields) => {
    // const [errorsInfo, setErrorsInfo] = useState(getGeneralConfig(initialData, disabledFields));
    const [errorsInfo, setErrorsInfo] = useState({});
    const [values, setValues] = useState(initialData);

    console.log(`initialData: ${JSON.stringify(initialData, null, 4)}`);

    let config = Object.assign({}, getGeneralConfig(initialData, disabledFields));
    let configContact = Object.assign({}, getContactConfig());
    let dataForm = Object.assign({}, values);

    const validate = (index, name, value) => {
        let error = {};
        let regExp = null;

        const VALIDATION_MAP = {
            condition: () => {
                if (!value) {
                    error = { message: 'Выберите статус из списка!' };
                    config.condition = error;
                } else delete config.condition;
                setErrorsInfo(config);
            },
            manager: () => {
                if (!value || Object.keys(value).length === 0) {
                    error = { message: 'Выберите менеджера!' };
                    config.manager = error;
                } else delete config.manager;
                setErrorsInfo(config);
            },
            responsible: () => {
                if (!value || Object.keys(value).length === 0) {
                    error = { message: 'Выберите ответственного!' };
                    config.responsible = error;
                } else delete config.responsible;
                setErrorsInfo(config);
            },
            participants: () => {
                if (value.length === 0) {
                    error = { message: 'Выберите участника!' };
                    config.participants = error;
                } else delete config.participants;
                setErrorsInfo(config);
            },
            company: () => {
                regExp = /[`!@#$%^&*()_=\[\]{};:\\|,.<>\/?~]/;
                if (!value) {
                    error = { message: 'Поле обязательно для заполнения!' };
                    config.company = error;
                } else if (regExp.test(value)) {
                    error = { message: 'Некорректное значение!' };
                    config.company = error;
                } else delete config.company;
                setErrorsInfo(config);
            },
            address: () => {
                regExp = /[`!@#$%^&*()_+=\[\]{};':"\\|<>\?~]/;
                if (!value) {
                    error = { message: 'Поле обязательно для заполнения!' };
                    config.address = error;
                } else if (regExp.test(value)) {
                    error = { message: 'Некорректное значение!' };
                    config.address = error;
                } else delete config.address;

                setErrorsInfo(config);
            },
            pathToFolder: () => {
                if (!value) {
                    error = { message: 'Поле обязательно для заполнения!' };
                    config.pathToFolder = error;
                } else delete config.pathToFolder;
                setErrorsInfo(config);
            },
            dateCreation: () => {
                if (!value) {
                    error = { message: 'Поле обязательно для заполнения!' };
                    config.dateCreation = error;
                } else delete config.dateCreation;
                setErrorsInfo(config);
            },
            dateOfStart: () => {
                if (!value) {
                    error = { message: 'Выберите дату начала!' };
                    config.dateOfStart = error;
                } else delete config.dateOfStart;

                setErrorsInfo(config);
            },
            dateOfEnding: () => {
                if (!value) {
                    error = { message: 'Выберите дату конца!' };
                    config.dateOfEnding = error;
                } else delete config.dateOfEnding;

                setErrorsInfo(config);
            },
            contractNum: () => {
                regExp = /[`!@#$%^&*()_+=\[\]{};':"\\|<>\?~]/;
                if (!value) {
                    error = { message: 'Поле обязательно для заполнения!' };
                    config.contractNum = error;
                } else if (regExp.test(value)) {
                    error = { message: 'Некорректное значение!' };
                    config.contractNum = error;
                } else delete config.contractNum;

                setErrorsInfo(config);
            },
            // contacts: () => {
            //     if (value !== null && value.length === 0) {
            //         error = { message: 'Выберите контакт!' };
            //         config.contacts = [error];
            //     }
            //     setErrorsInfo(config);
            // },
            // fullName: () => {
            //     if (!value) {
            //         error = { message: 'Поле обязательно для заполнения!' };
            //         configContact.fullName = error;
            //         config.contacts[index] = configContact;
            //     } else if (value) {
            //         regExp = /^(?=.{1,40}$)[а-яёА-ЯЁ]+(?:[-' ][а-яёА-ЯЁ]+)*$/;
            //         if (!regExp.test(value)) {
            //             error = { message: 'Некорректное значение!' };
            //             configContact.fullName = error;
            //             config.contacts[index] = configContact;
            //         } else delete configContact.fullName;
            //     }
            //     setErrorsInfo(config);
            // },
            // post: () => {
            //     if (!value) {
            //         error = { message: 'Поле обязательно для заполнения!' };
            //         configContact.post = error;
            //         config.contacts[index] = configContact;
            //     } else {
            //         delete configContact.post;
            //         config.contacts[index] = configContact;
            //     }
            //     setErrorsInfo(config);
            // },
            // phone: () => {
            //     if (!value) {
            //         error = { message: 'Поле обязательно для заполнения!' };
            //         configContact.phone = error;
            //         config.contacts[index] = configContact;
            //     } else {
            //         regExp = /\+7\(\d{3}\)\d{3}-\d{2}-\d{2}/;
            //         if (regExp.test(value)) {
            //             error = { message: 'Некорректное значение!' };
            //             configContact.phone = error;
            //             config.contacts[index] = configContact;
            //         } else {
            //             delete configContact.phone;
            //             config.contacts[index] = configContact;
            //         }
            //     }
            //     setErrorsInfo(config);
            // },
            // email: () => {
            //     regExp =
            //         /^(([^<>()[\]\\.,;:\s!?@\"]+(\.[^<>()[\]\\.,;:\s!?@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            //     if (!value) {
            //         error = { message: 'Поле обязательно для заполнения!' };
            //         configContact.email = error;
            //         config.contacts[index] = configContact;
            //     } else if (value) {
            //         if (!regExp.test(value)) {
            //             // console.log('Некорректное значение!');
            //             error = { message: 'Некорректное значение!' };
            //             configContact.email = error;
            //             config.contacts[index] = configContact;
            //         } else {
            //             delete configContact.email;
            //             config.contacts[index] = configContact;
            //         }
            //     }
            //     setErrorsInfo(config);
            // },
            services: () => {
                if (!value || Object.keys(value).length === 0) {
                    error = { message: 'Выберите сервис из списка!' };
                    config.services = error;
                } else delete config.services;
                setErrorsInfo(config);
            }
        };

        if (VALIDATION_MAP.hasOwnProperty(name)) VALIDATION_MAP[name]();

        return errorsInfo;
    };

    const onClick = (name, value) => {
        validate(null, name, value);
        dataForm = { ...values, [name]: value };
        setValues(dataForm);
    };

    const onChange = e => {
        validate(null, e.target.name, e.target.value);
        dataForm = { ...values, [e.target.name]: e.target.value };
        setValues(dataForm);
    };

    const onСhangeByIndex = (e, key, ind) => {
        dataForm[key][ind][e.target.name] = e.target.value;
        validate(ind, e.target.name, e.target.value);
        setValues(dataForm);
    };

    const checkData = () => {
        setValues(dataForm);

        Object.keys(values).map(key => {
            if (values[key] !== null && Array.isArray(values[key]) && key === 'contacts') {
                let newValues = Array.from(values[key]);
                // console.log(`newValues = ${JSON.stringify(newValues, null, 4)}`);
                newValues.map((val, ind) => {
                    Object.keys(val).map(keyVal => {
                        validate(ind, keyVal, val[keyVal]);
                    });
                    configContact = Object.assign({}, getContactConfig());
                });
            }
            validate(null, key, values[key]);
        });

        setErrorsInfo(config);

        console.log(`values = ${JSON.stringify(values, null, 4)}`);
        // console.log(`config errors = ${JSON.stringify(config, null, 4)}\ncountErrs = ${performErrorCounting(config)}`);

        return performErrorCounting(config) === 0 ? true : false;
    };

    useEffect(() => console.log(`errorsInfo: ${JSON.stringify(errorsInfo, null, 4)}`), [errorsInfo]);

    return {
        values,
        onClick,
        onChange,
        onСhangeByIndex,
        checkData,
        errorsInfo
    };
};
