import { useState, useEffect } from 'react';

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

// Создаем конфиг ошибок
function createConfig(authMode, data) {
    const config = {};
    Object.keys(data).map(key => (config[key] = {}));
    return Object.assign(config, authMode ? { ['authorization']: {} } : { ['registration']: {} });
}

export const useAuthForm = (authMode, initialVal) => {
    const [errors, setErrors] = useState(createConfig(authMode, initialVal));
    const [values, setValues] = useState(initialVal);

    let config = Object.assign({}, errors);
    let dataForm = values;

    // console.log(`values: ${JSON.stringify(values, null, 4)}`);

    const validate = (name, value) => {
        let error = {};
        let regExp = null;

        const VALIDATION_MAP = {
            'fullname': () => {
                regExp = /^[а-яА-ЯёЁa-zA-Z]+ [а-яА-ЯёЁa-zA-Z]+ ?[а-яА-ЯёЁa-zA-Z]+$/;
                if (!value) {
                    error = { message: 'Поле обязательно для заполнения!' };
                    config.fullname = error;
                    setErrors(config);
                } else {
                    delete config.fullname;
                    setErrors(config);
                }
                // else {
                //     if (!regExp.test(value)) {
                //         error = { message: 'Некорректное значение!' };
                //         config.fullname = error;
                //         setErrors(config);
                //     } else {
                //         delete config.fullname;
                //         setErrors(config);
                //     }
                // }
            },
            'email': () => {
                regExp =
                    /^(([^<>()[\]\\.,;:\s!?@\"]+(\.[^<>()[\]\\.,;:\s!?@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                if (!value) {
                    error = { message: 'Поле обязательно для заполнения!' };
                    config.email = error;
                    setErrors(config);
                } else {
                    if (!regExp.test(value)) {
                        error = { message: 'Некорректное значение!' };
                        config.email = error;
                        setErrors(config);
                    } else {
                        delete config.email;
                        setErrors(config);
                    }
                }
            },
            'phone': () => {
                regExp = /^((\+7|7|8)+([0-9]){10})$/;
                if (!value) {
                    error = { message: 'Поле обязательно для заполнения!' };
                    config.phone = error;
                    setErrors(config);
                } else {
                    if (!regExp.test(value)) {
                        error = { message: 'Некорректное значение!' };
                        config.phone = error;
                        setErrors(config);
                    } else {
                        delete config.phone;
                        setErrors(config);
                    }
                }
            },
            'gender': () => {
                if (!value) {
                    error = { message: 'Укажите пол!' };
                    config.gender = error;
                    setErrors(config);
                } else {
                    delete config.gender;
                    setErrors(config);
                }
            },
            'password': () => {
                regExp = /(?=^.{8,}$)((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/;
                if (!value) {
                    error = { message: 'Поле обязательно для заполнения!' };
                    config.password = error;
                    setErrors(config);
                } else {
                    if (!regExp.test(value)) {
                        error = { message: 'Некорректное значение!' };
                        config.password = error;
                        setErrors(config);
                    } else {
                        delete config.password;
                        setErrors(config);
                    }
                }
            },
            'confirmPass': () => {
                regExp = /(?=^.{8,}$)((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/;
                if (!value) {
                    error = { message: 'Поле обязательно для заполнения!' };
                    config.confirmPass = error;
                    setErrors(config);
                } else {
                    if (!regExp.test(value)) {
                        error = { message: 'Некорректное значение!' };
                        config.confirmPass = error;
                        setErrors(config);
                    } else if (value !== values.password) {
                        error = { message: 'Пароль и подтверждение пароля не совпадают!' };
                        config.confirmPass = error;
                        setErrors(config);
                    } else {
                        // console.log(`password: ${values.password}\nconfirmPass: ${value}`);
                        delete config.confirmPass;
                        setErrors(config);
                    }
                }
            }
        };

        if (VALIDATION_MAP.hasOwnProperty(name)) VALIDATION_MAP[name]();

        return errors;
    };

    const onChange = e => {
        validate(e.target.name, e.target.value);
        dataForm = { ...values, [e.target.name]: e.target.value };
        setValues(dataForm);
    };

    const onSelect = e => {
        validate(e.target.name, e.target.value);
        dataForm = { ...values, [e.target.name]: e.target.value };
        setValues(dataForm);
    };

    const checkData = () => {
        Object.keys(values).map(key => validate(key, values[key]));

        setValues(dataForm);
        setErrors(config);

        // console.log(`values = ${JSON.stringify(values, null, 4)}`);
        // console.log(`config errors = ${JSON.stringify(config, null, 4)}\ncountErrs = ${performErrorCounting(config)}`);

        return performErrorCounting(config) === 0 ? true : false;
    };

    // Проверка введенных данных на совпадение с сохраненными данными
    // const checkAuthorization = registeredData => {
    //     let error = {};
    //     if (registeredData && values) {
    //         if (Object.keys(registeredData).length !== 0 && Object.keys(values).length !== 0) {
    //             const savedData = Object.values(registeredData?.data);
    //             if (savedData && savedData.length !== 0) {
    //                 if (!savedData.includes(values.email) || !savedData.includes(values.password)) {
    //                     error = { message: 'Неверный логин или пароль. Проверьте правильность введенных данных.' };
    //                     config.authorization = error;
    //                 } else delete config.authorization;
    //             }
    //         }
    //     }
    //     setErrors(config);
    //     return performErrorCounting(config) === 0 ? true : false;
    // };

    // const checkRegistration = registeredData => {
    //     let error = {};
    //     if (registeredData && values) {
    //         if (Object.keys(registeredData).length !== 0 && Object.keys(values).length !== 0) {
    //             const savedData = Object.values(registeredData?.data);
    //             if (savedData && savedData.length !== 0) {
    //                 if (!savedData.includes(values.email)) delete config.authorization;
    //                 else {
    //                     error = { message: `Пользователь с логином ${values.email} уже существует в системе!` };
    //                     config.registration = error;
    //                 }
    //             }
    //         }
    //     }
    //     setErrors(config);
    //     return performErrorCounting(config) === 0 ? true : false;
    // };

    const checkResponse = (mode, error) => {
        console.log(`error: ${JSON.stringify(error, null, 4)}`);
        if (mode) config.authorization = { message: error };
        if (!mode) config.registration = { message: error };
        setErrors(errors => {
            return { ...errors, ...config };
        });
        return performErrorCounting(config) === 0 ? true : false;
    };

    // useEffect(() => console.log(`errorsInfo: ${JSON.stringify(errorsInfo, null, 4)}`), [errorsInfo]);
    // useEffect(() => console.log(`values: ${JSON.stringify(values, null, 4)}`), [values]);

    return {
        values,
        errors,
        onChange,
        onSelect,
        checkData,
        checkResponse
        // checkRegistration,
        // checkAuthorization
    };
};
