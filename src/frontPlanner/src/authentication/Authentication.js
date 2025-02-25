import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames';

// Импорт доп.функционала
import AuthService from '@services/auth.service';
import TokenService from '@services/token.service';
import { authContext } from '../contexts/auth.context';
import { useAuthForm } from '@hooks/useAuthForm';

// Импорт стилей
import './authentication.css';

// Форма регистрации
function SignUpForm(props) {
    // const { mode, navigate, setData } = props;
    // const { mode, navigate, setAuthToken } = props;
    const { mode, navigate, setAuthState } = props;
    const data = { fullname: '', email: '', phone: '', gender: '', password: '', confirmPass: '' };

    // const { login, setAuthenticationStatus } = useAuth();
    const [formData, setFormData] = useState(data);
    // const { values, errors, onChange, onSelect, checkData, checkRegistration } = useAuthForm(mode, formData);
    const { values, errors, onChange, onSelect, checkData, checkResponse } = useAuthForm(mode, formData);

    function onChangeInptField(e) {
        data[e.target.name] = e.target.value;
        onChange(e);
        setFormData(data);
    }

    function onOptionChangeHandler(e) {
        data[e.target.name] = e.target.value;
        onSelect(e);
        setFormData(data);
    }
    // 1 версия
    // function onSubmit(e) {
    //     e.preventDefault();
    //     if (checkData()) {
    //         const registrationPayload = {
    //             userId: 1,
    //             fullname: values.fullname,
    //             email: 'eve.holt@reqres.in',
    //             phone: values.phone,
    //             gender: values.gender,
    //             password: values.password,
    //             confirmPass: values.confirmPass
    //         };
    //         axios.post('https://reqres.in/api/register', registrationPayload).then(response => {
    //             if (response.status === 200) {
    //                 setToken(response.data.token);
    //                 console.log(`token: ${response.data.token}`);
    //                 // setData({ mode: mode, data: values });
    //                 navigate('../department');
    //             }
    //         });
    //     }
    // }

    // 2 версия
    async function onSubmit(e) {
        e.preventDefault();
        // const registrationPayload = {
        //     name: values.fullname,
        //     email: values.email,
        //     password: values.password,
        //     password_confirmation: values.confirmPass
        // };
        const registrationPayload = {
            username: values.fullname,
            email: values.email,
            password: values.password
        };
        if (checkData()) {
            AuthService.register(registrationPayload).then(response => {
                if (response.status === 201) {
                    console.log(`Register data: ${JSON.stringify(response, null, 4)}`);
                    setAuthState(prevState => ({
                        accessToken: '12345',
                        refreshToken: prevState.refreshToken
                    }));
                    navigate('../department');
                }
            });
        }
    }

    useEffect(() => console.log(`Registration errors: ${JSON.stringify(errors, null, 4)}`), [errors]);

    return (
        <form
            className="auth-page-form"
            data-error={errors.registration ? errors.registration.message : ''}
            action="#"
            onSubmit={onSubmit}
        >
            <div className="auth-form-inpt-wrapper" data-error={errors.fullname ? errors.fullname.message : ''}>
                <div className="auth-form-inpt">
                    <img className="auth-form-inpt__icon" src="./img/avatar.svg" alt="" />
                    <input
                        className="auth-form-inpt__field"
                        type="text"
                        name="fullname"
                        placeholder="Фамилия Имя"
                        onChange={e => onChangeInptField(e)}
                    />
                </div>
            </div>
            <div className="auth-form-inpt-wrapper" data-error={errors.email ? errors.email.message : ''}>
                <div className="auth-form-inpt">
                    <img className="auth-form-inpt__icon" src="./img/mail.svg" alt="" />
                    <input
                        className="auth-form-inpt__field"
                        type="text"
                        name="email"
                        placeholder="Почта"
                        onChange={e => onChangeInptField(e)}
                    />
                </div>
            </div>
            <div className="auth-form-inpt-wrapper" data-error={errors.phone ? errors.phone.message : ''}>
                <div className="auth-form-inpt">
                    <img className="auth-form-inpt__icon" src="./img/phone.svg" alt="" />
                    <input
                        className="auth-form-inpt__field"
                        type="text"
                        name="phone"
                        placeholder="Мобильный телефон"
                        onChange={e => onChangeInptField(e)}
                    />
                </div>
            </div>
            <div className="auth-form-inpt-wrapper" data-error={errors.gender ? errors.gender.message : ''}>
                <div className="auth-form-inpt">
                    <img className="auth-form-inpt__icon" src="./img/gender.svg" alt="" />
                    <select
                        name="gender"
                        className="auth-form-inpt-gender__list"
                        onChange={e => onOptionChangeHandler(e)}
                    >
                        <option value="" selected>
                            Выбрать пол
                        </option>
                        <option value="Мужской">Мужской</option>
                        <option value="Женский">Женский</option>
                    </select>
                </div>
            </div>
            <div className="auth-form-inpt-wrapper" data-error={errors.password ? errors.password.message : ''}>
                <div className="auth-form-inpt">
                    <img className="auth-form-inpt__icon" src="./img/password.svg" alt="" />
                    <input
                        className="auth-form-inpt__field"
                        type="password"
                        name="password"
                        placeholder="Пароль"
                        autoComplete="new-password"
                        onChange={e => onChangeInptField(e)}
                    />
                </div>
            </div>
            <div className="auth-form-inpt-wrapper" data-error={errors.confirmPass ? errors.confirmPass.message : ''}>
                <div className="auth-form-inpt">
                    <img className="auth-form-inpt__icon" src="./img/confirm_password.svg" alt="" />
                    <input
                        className="auth-form-inpt__field"
                        type="password"
                        name="confirmPass"
                        placeholder="Подтвердите пароль"
                        autoComplete="new-password"
                        onChange={e => onChangeInptField(e)}
                    />
                </div>
            </div>
            <input className="auth-page-form__btn-sign-up btn-auth-action" type="submit" value="Создать аккаунт" />
        </form>
    );
}

// Форма Авторизации
function SignInForm(props) {
    // const { mode, navigate } = props;
    // const { mode, navigate, setAuthToken } = props;
    const { mode, navigate, setAuthState } = props;
    const data = { email: '', password: '' };
    // const data = { fullname: '', password: '' };

    const [formData, setFormData] = useState(data);
    // const { values, errors, onChange, checkData, checkAuthorization } = useAuthForm(mode, formData);
    const { values, errors, onChange } = useAuthForm(mode, formData);

    function onChangeInptField(e) {
        data[e.target.name] = e.target.value;
        onChange(e);
        setFormData(data);
    }

    // 1 версия
    // function onSubmit(e) {
    //     e.preventDefault();
    //     const loginPayload = {
    //         email: values.email,
    //         password: values.password
    //     };
    //     if (checkData()) {
    //         AuthService.login(loginPayload)
    //             .then(response => {
    //                 if (response.status === 200) {
    //                     const { token, refreshToken } = response.data;
    //                     console.log(`Auth token: ${token}\n RefreshToken: ${refreshToken}`);
    //                     setAuthToken(token);
    //                     navigate('../department');
    //                 }
    //             })
    //             .catch(e => {
    //                 if (e.response.data.errors !== undefined) {
    //                     checkResponse(mode, e.response.data.errors);
    //                 }
    //                 if (e.response.data.error !== undefined) {
    //                     checkResponse(mode, e.response.data.error);
    //                 }
    //             });
    //     }
    // }

    // 3 версия
    async function onSubmit(e) {
        e.preventDefault();
        const loginPayload = {
            email: values.email,
            password: values.password
        };
        AuthService.login(loginPayload)
            .then(response => {
                if (response.status === 200) {
                    console.log(`response: ${JSON.stringify(response, null, 4)}`);
                    setAuthState({
                        accessToken: TokenService.getAccessToken()
                    });
                    navigate('../department');
                }
            })
            .catch(e => {
                // console.log(`e.response: ${JSON.stringify(e.response, null, 4)}`)
                // if (e.response.data.non_field_errors !== undefined) checkResponse(mode, e.response.data.message);
            });
    }

    useEffect(() => console.log(`Authorization errors: ${JSON.stringify(errors, null, 4)}`), [errors]);

    return (
        <form
            action="#"
            className="auth-page-form"
            data-errors={errors.authorization ? errors.authorization.message : ''}
            onSubmit={onSubmit}
        >
            <div className="auth-form-inpt-wrapper" data-error={errors.email ? errors.email.message : ''}>
                <div className="auth-form-inpt">
                    <img className="auth-form-inpt__icon" src="./img/mail.svg" alt="" />
                    <input
                        className="auth-form-inpt__field"
                        type="text"
                        name="email"
                        placeholder="Почта"
                        onChange={e => onChangeInptField(e)}
                    />
                </div>
            </div>
            {/* <div className="inpt-item" data-error={errors.fullname ? errors.fullname.message : ''}>
                <div className="inpt-item-wrapper">
                    <img className="inpt__icon" src="./img/avatar.svg" alt="" />
                    <input
                        className={classNames('inpt-item__field', 'fullname')}
                        type="text"
                        name="fullname"
                        placeholder="Фамилия Имя"
                        onChange={e => onChangeInptField(e)}
                    />
                </div>
            </div> */}
            <div className="auth-form-inpt-wrapper" data-error={errors.password ? errors.password.message : ''}>
                <div className="auth-form-inpt">
                    <img className="auth-form-inpt__icon" src="./img/password.svg" alt="" />
                    <input
                        className="auth-form-inpt__field"
                        type="password"
                        name="password"
                        placeholder="Пароль"
                        autoComplete="new-password"
                        onChange={e => onChangeInptField(e)}
                    />
                </div>
            </div>
            <input className="auth-page-form__btn-sign-in btn-auth-action" type="submit" value="Войти" />
        </form>
    );
}

export default function Authentication() {
    // 0 - регистрация, 1 - авторизация
    const [authMode, setAuthMode] = useState(1);
    const navigate = useNavigate();
    const { setAuthState } = useContext(authContext);
    // const { setAuthData } = useContext(authContext);
    // const { setToken } = useContext(authContext);

    // TODO: Обработать следующие ситуации
    // При регистрации:
    // 1. Ситуация, когда email уже используется.
    // При авторизации
    // 1. Ситуция, когда логин пользователя не найден в системе.

    const AUTH_MODES = {
        0: () => <SignUpForm mode={authMode} navigate={navigate} setAuthState={setAuthState} />,
        1: () => <SignInForm mode={authMode} navigate={navigate} setAuthState={setAuthState} />
    };

    function onSelectAuthMode(mode) {
        setAuthMode(mode);
    }

    return (
        <div className="auth-page">
            <div className="auth-page-col__left auth-page-col">
                <a href="#" className="auth-page__logo">
                    <h2 className="auth-page__logo-title">
                        <span>MPK</span>
                        <span>Planner</span>
                    </h2>
                    <img className="auth-page__logo-img" src="/img/mpk_logo.svg" alt="Logo" />
                </a>
            </div>
            <div className="auth-page-col__right auth-page-col">
                <div className="auth-page-col__panel">
                    <div className="auth-page-col__panel-header">
                        <button
                            className={classNames('auth-page-col__btn-registration', 'auth-page-col-btn', {
                                'auth-page-col-btn_active': authMode === 0
                            })}
                            onClick={() => onSelectAuthMode(0)}
                        >
                            Регистрация
                        </button>
                        <button
                            className={classNames('auth-page-col__btn-login', 'auth-page-col-btn', {
                                'auth-page-col-btn_active': authMode === 1
                            })}
                            onClick={() => onSelectAuthMode(1)}
                        >
                            Войти
                        </button>
                    </div>
                    {AUTH_MODES[authMode]()}
                </div>
            </div>
        </div>
    );
}
