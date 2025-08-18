import { useState, useEffect, useRef, startTransition, Suspense } from 'react';
import {
    Routes,
    Route,
    useNavigate,
    useParams,
    useLocation,
    useLoaderData,
    Await,
    resolvePath
} from 'react-router-dom';
import Cookies from 'js-cookie';
import classNames from 'classnames';

// Импорт компонентов
import IconButton from '@generic/elements/buttons/IcButton';
import Preloader from '@components/auxiliary_pages/loader/Preloader';
import ListMode from '../data_display/display_modes/table/ListMode';

// Импорт вспомогательных функций
import { getFilteredData } from '@helpers/helper';

// Импорт сервисов
import UserService from '@services/user.service';

//
import { useHistoryContext } from '../../../contexts/history.context';

// Импорт стилей
import './user_info.css';

function CardProfile({ profileData }) {
    return (
        <div className="user__profile-top">
            <figure className="user__profile-photo">
                {profileData.photo ? <img className="user__profile-img" src={profileData.photo} alt="" /> : null}
            </figure>
            <h2 className="user__fullname">{profileData.fullName}</h2>
        </div>
    );
}

function CardInfoItem({ title, value }) {
    const refValue = useRef();

    return (
        <li className="user__data-item">
            <h2 className="user__item-title">{title}</h2>
            <p className="user__item-value" ref={refValue} onMouseLeave={() => refValue?.current.scrollTo(0, 0)}>
                <span>{value}</span>
            </p>
        </li>
    );
}

function CardInfo({ config, userData }) {
    return (
        <ul className="user__personal-data">
            {Object.keys(config).map(key => (
                <CardInfoItem title={config[key]} value={userData[key]} />
            ))}
        </ul>
    );
}

export default function UserInfoNew() {
    const lastSegmentPath = `${window.location.href.match(/([^\/]*)\/*$/)[1]}`;
    const theme = localStorage.getItem('appTheme');

    const { idEmployee } = useParams();
    const data = useLoaderData();
    const { state } = useLocation();

    const { history, backToPrevPath } = useHistoryContext();
    const navigate = useNavigate();

    const refTabBar = useRef(null);

    // const [isLoading, setIsLoading] = useState(false);
    // const [data, setData] = useState([]);
    const [userInfo, setUserInfo] = useState({
        // Разделы пользователя
        tabs: [],
        // Раздел пользователя
        tab: {},
        // Опции раздела
        tabOptions: [],
        // Опция раздела
        tabOption: {},
        // Данные для отображения
        valsToDisplay: [],
        // Операции которые можно совершать с данными
        dataOperations: []
    });

    // console.log(`UserInfo uploadedData: ${JSON.stringify(data, null, 4)}`);

    function onClose() {
        startTransition(() => {
            setTimeout(() => {
                backToPrevPath();
            }, 1000);

            navigate(history[history.length - 1]);
        });
    }

    function onSelectTab(indTab, tabData) {
        const tabOptionsData = UserService.getTabOptions(tabData) || [];
        const tabOptionData = tabOptionsData[0];

        const valsToDisplayData = UserService.getValuesToDisplay(tabData, tabOptionData) || [];
        const dataOperationsData = UserService.getDataOperations() || [];

        if (refTabBar.current) refTabBar.current.style.marginLeft = `${0 * 12.5}%`;

        setUserInfo({
            tabs: userInfo.tabs,
            tab: tabData,
            tabOptions: tabOptionsData,
            tabOption: tabOptionData,
            valsToDisplay: valsToDisplayData,
            dataOperations: dataOperationsData
        });

        startTransition(() => {
            navigate(`/user/${idEmployee}/${tabData?.key}/${tabData?.key}`, {
                state: { idEmployee: state?.idEmployee, path: `${window.location.pathname}` }
            });
            // navigate(`${tabData?.key}/${lastSegmentPath}`, {
            //     state: { idEmployee: state?.idEmployee, path: `${window.location.pathname}` }
            // });
            // navigate(`${tabData?.key}/`, {
            //     state: { idEmployee: state?.idEmployee, path: `${window.location.pathname}` }
            // });
        });
    }

    function onSelectOption(indOption, optionData) {
        const { tabOption, valsToDisplay, ...restElems } = Object.assign({}, userInfo);
        const valsToDisplayData = UserService.getValuesToDisplay(userInfo?.tab, optionData) || [];

        setUserInfo(() => {
            refTabBar.current.style.marginLeft = `${indOption * 12.5}%`;

            return { tabOption: optionData, valsToDisplay: valsToDisplayData, ...restElems };
        });
    }

    function onExitAccount() {
        Cookies.remove('MMAUTHTOKEN');
        Cookies.remove('MMUSERID');

        navigate('/auth');
    }

    useEffect(() => {
        const tabsData =
            UserService.getTabs()?.map(item => {
                return { key: item?.keyTab, value: item?.tab };
            }) || [];
        // const tabData = savedSettings?.data[savedSettings?.activeTab].tab || tabsData[0];
        const tabData = { key: lastSegmentPath };

        const tabOptionsData = UserService.getTabOptions(tabData) || [];
        const tabOptionData = tabOptionsData[0];

        const valsToDisplayData = UserService.getValuesToDisplay(tabData, tabOptionData) || [];
        const dataOperationsData = UserService.getDataOperations() || [];

        console.log(`User info: ${JSON.stringify(userInfo, null, 4)}`);

        if (refTabBar.current) refTabBar.current.style.marginLeft = `${0 * 12.5}%`;

        setUserInfo({
            tabs: tabsData,
            tab: tabData,
            tabOptions: tabOptionsData,
            tabOption: tabOptionData,
            valsToDisplay: valsToDisplayData,
            dataOperations: dataOperationsData
        });
    }, [data?.uploadedData]); //[history, lastSegmentPath]

    return (
        <div className="user__info">
            <div className="user__empty-cell">&emsp;</div>
            <div className="user__options-top">
                <div className="user__options-top-left">
                    <ul className="user__list-options">
                        {userInfo.tabOptions && userInfo.tabOptions.length !== 0
                            ? userInfo.tabOptions.map((option, indTab) => (
                                  <li className="user__option-item" onClick={() => onSelectOption(indTab, option)}>
                                      {option.value}
                                  </li>
                              ))
                            : null}
                    </ul>
                    {userInfo.tabOptions && userInfo.tabOptions.length !== 0 ? (
                        <div className="user__options-slider">
                            <div className="user__options-slider-bar" ref={refTabBar}></div>
                        </div>
                    ) : null}
                </div>
                <div className="user__options-top-right">
                    <IconButton
                        nameClass="icon-btn__close-img icon-btn"
                        type="button"
                        text="Закрыть"
                        icon="cancel_bl.svg"
                        onClick={onClose}
                    />
                </div>
            </div>
            <div className="user__side-menu-content">
                <ul className="user__side-menu">
                    {userInfo.tabs.map((tabData, indTab) => (
                        <li
                            className={classNames('user__side-menu-item', {
                                'user__side-menu-item_active': tabData?.key === userInfo.tab?.key
                            })}
                            onClick={() => onSelectTab(indTab, tabData)}
                        >
                            <img
                                className="user__side-menu-img"
                                src={
                                    theme === 'dark'
                                        ? `/img/side_menu/employee_${tabData?.key}_wh.svg`
                                        : `/img/side_menu/employee_${tabData?.key}.svg`
                                }
                                alt="Profile"
                            />
                            {tabData.value}
                        </li>
                    ))}
                </ul>
                <button className="btn-exit-account" onClick={onExitAccount}>
                    <img src="/img/exit.svg" alt="Exit" />
                    Выход
                </button>
            </div>
            <div className="user__options-content">
                <Routes>
                    <Route
                        path="profile"
                        element={
                            <Suspense fallback={<Preloader />}>
                                <Await resolve={data?.uploadedData}>
                                    {resolvedData => {
                                        const employee = Object.assign({}, resolvedData?.employee);
                                        return employee && Object.keys(employee).length !== 0 ? (
                                            <div className="user__profile">
                                                <CardProfile
                                                    profileData={{
                                                        photo: employee?.photo,
                                                        fullName: employee?.fullName
                                                    }}
                                                />
                                                <CardInfo
                                                    config={UserService.getEmployeeConfig()}
                                                    userData={employee}
                                                />
                                            </div>
                                        ) : null;
                                    }}
                                </Await>
                            </Suspense>
                        }
                    />
                    <Route
                        path="tasks"
                        element={
                            <Suspense fallback={<Preloader />}>
                                <Await resolve={data?.uploadedData}>
                                    {resolvedData => {
                                        const filteredData =
                                            getFilteredData(resolvedData?.tabData, idEmployee, userInfo?.tabOption) ||
                                            [];

                                        return (
                                            <ListMode
                                                testData={filteredData || []}
                                                modeConfig={{
                                                    keys: userInfo.valsToDisplay,
                                                    // partition: userInfo.tab?.key,
                                                    partition: 'user',
                                                    mode: {
                                                        key: 'listTasks'
                                                    },
                                                    option: userInfo?.tabOption,
                                                    dataOperations: userInfo.dataOperations,
                                                    idContract: null
                                                }}
                                            />
                                        );
                                    }}
                                </Await>
                            </Suspense>
                        }
                    />
                    <Route
                        path="contracts"
                        element={
                            <Suspense fallback={<Preloader />}>
                                <Await resolve={data?.uploadedData}>
                                    {resolvedData => {
                                        const filteredData =
                                            getFilteredData(resolvedData?.tabData, idEmployee, userInfo?.tabOption) ||
                                            [];

                                        return (
                                            <ListMode
                                                testData={filteredData || []}
                                                modeConfig={{
                                                    keys: userInfo.valsToDisplay,
                                                    // partition: userInfo.tab?.key,
                                                    partition: 'user',
                                                    mode: {
                                                        key: 'listContracts'
                                                    },
                                                    option: userInfo?.tabOption,
                                                    dataOperations: userInfo.dataOperations,
                                                    idContract: null
                                                }}
                                            />
                                        );
                                    }}
                                </Await>
                            </Suspense>
                        }
                    />
                </Routes>
            </div>
        </div>
    );
}
