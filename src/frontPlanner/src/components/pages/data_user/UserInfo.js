import { useRef } from 'react';
import { useNavigate, useLoaderData } from 'react-router-dom';

// Импорт компонентов
import IconButton from '@generic/elements/buttons/IcButton';

// Импорт кастомных хуков
// import { useDataLoader } from '@hooks/useDataLoader';

// Импорт конфигураций
import { MONTHS } from '@config/calendar.config';

// Импорт доп.функционала
import { getDateFromString } from '@helpers/calendar';

// Импорт стилей
import './user_info.css';

function CardProfile({ profileData }) {
    return (
        <div className="user__profile-top">
            <figure className="user__profile-photo">
                <img className="user__profile-img" src={profileData.photo} alt="" />
            </figure>
            <h2 className="user__fullname">{profileData.fullName}</h2>
        </div>
    );
}

function CardInfoItem(props) {
    const { key, title, value } = props;
    const refValue = useRef();

    const VALUE_CONF = {
        birthday: value => {
            const date = getDateFromString(value);
            return `${date.getDate()}${String.fromCodePoint(8194)}${MONTHS[date.getMonth()]}${String.fromCodePoint(
                8194
            )}${date.getFullYear()}`;
        }
    };

    return (
        <li className="user__data-item">
            <h2 className="user__item-title">{title}</h2>
            <p className="user__item-value" ref={refValue} onMouseLeave={() => refValue?.current.scrollTo(0, 0)}>
                <span>{VALUE_CONF[key] ? VALUE_CONF[key](value) : value}</span>
            </p>
        </li>
    );
}

function CardInfo({ config, userData }) {
    return (
        <div className="user__profile-bottom">
            {userData && Object.keys(userData).length !== 0 ? (
                <ul className="user__personal-data">
                    {Object.keys(config).map(key => (
                        <CardInfoItem key={key} title={config[key]} value={userData[key]} />
                    ))}
                </ul>
            ) : null}
        </div>
    );
}

export default function UserInfo() {
    const { employeeData } = useLoaderData();
    const navigate = useNavigate();

    const tabs = [
        {
            title: 'Задачи',
            path: 'tasks'
        },
        {
            title: 'Договоры',
            path: 'contracts'
        }
    ];

    const cardConfig = {
        post: 'Должность',
        personalPhone: 'Личный телефон',
        mail: 'Почта',
        workPhone: 'Рабочий телефон',
        internalPhone: 'Внутренний телефон',
        telegram: 'Telegram',
        skype: 'Skype',
        division: 'Подразделение',
        birthday: 'День рождения'
    };

    function onClose() {
        navigate(-1);
    }

    // console.log(`employeeData: ${JSON.stringify(employeeData, null, 4)}`);

    return (
        <div className="user__info">
            <div className="user__profile">
                <CardProfile profileData={{ photo: employeeData?.photo, fullName: employeeData?.fullName }} />
                <CardInfo config={cardConfig} userData={employeeData} />
            </div>
            <div className="user__tabs">
                <ul className="user__list-tabs">
                    {tabs.map(tab => (
                        <li className="user__tab-item">{tab.title}</li>
                    ))}
                </ul>
                <div className="user__tabs-top">
                    <div className="user__tabs-line"></div>
                    <IconButton
                        nameClass="icon-btn__close-img icon-btn"
                        type="button"
                        text="Закрыть"
                        icon="cancel_bl.svg"
                        onClick={onClose}
                    />
                </div>
                <div className="user__tabs-bottom"></div>
            </div>
        </div>
    );
}
