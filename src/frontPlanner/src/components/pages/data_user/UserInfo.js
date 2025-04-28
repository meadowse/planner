import { useState, useEffect, useRef, startTransition } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
                <img className="user__profile-img" src={profileData.photo} alt="" />
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

export default function () {
    // Сохраненные настройки
    const savedSettings = JSON.parse(localStorage.getItem('employee_settings'));

    const { state } = useLocation();
    const { history, backToPrevPath } = useHistoryContext();
    const navigate = useNavigate();

    const refTabBar = useRef(null);

    const [isLoading, setIsLoading] = useState(false);
    const [prevPath] = useState(state?.path);
    const [data, setData] = useState([]);
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

    const TABS_CONF = {
        profile: () => {
            const employee = Object.assign({}, data?.employee);
            return employee && Object.keys(employee).length !== 0 ? (
                <div className="user__profile">
                    <CardProfile
                        profileData={{
                            photo: employee?.photo,
                            fullName: employee?.fullName
                        }}
                    />
                    <CardInfo config={UserService.getEmployeeConfig()} userData={employee} />
                </div>
            ) : null;
        },
        tasks: () => {
            const filteredData = getFilteredData(data?.tabData, state?.idEmployee, userInfo?.tabOption) || [];
            return (
                <ListMode
                    testData={filteredData || []}
                    modeConfig={{
                        keys: userInfo.valsToDisplay,
                        partition: userInfo.tab?.key,
                        dataOperations: userInfo.dataOperations,
                        idContract: null
                    }}
                />
            );
        },
        contracts: () => {
            const filteredData = getFilteredData(data?.tabData, state?.idEmployee, userInfo?.tabOption) || [];
            return (
                <ListMode
                    testData={filteredData || []}
                    modeConfig={{
                        keys: userInfo.valsToDisplay,
                        partition: userInfo.tab?.key,
                        dataOperations: userInfo.dataOperations,
                        idContract: null
                    }}
                />
            );
        }
    };

    async function fetchData(key, idEmployee) {
        try {
            setIsLoading(true);
            const response = await UserService.loadData(key, idEmployee);
            setData(response);
        } catch (err) {
            console.log(`error msg: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    }

    function onClose() {
        startTransition(() => {
            backToPrevPath();
            navigate(-1);
        });
    }

    function onSelectTab(indTab, tabData) {
        const tabOptionsData = UserService.getTabOptions(tabData) || [];
        const tabOptionData = tabOptionsData[0];

        const valsToDisplayData = UserService.getValuesToDisplay(tabData, tabOptionData) || [];
        const dataOperationsData = UserService.getDataOperations() || [];

        if (refTabBar.current) refTabBar.current.style.marginLeft = `${0 * 12.5}%`;

        setUserInfo(() => {
            fetchData(tabData?.key, state?.idEmployee);
            return {
                tabs: userInfo.tabs,
                tab: tabData,
                tabOptions: tabOptionsData,
                tabOption: tabOptionData,
                valsToDisplay: valsToDisplayData,
                dataOperations: dataOperationsData
            };
        });

        if (savedSettings && Object.keys(savedSettings).length !== 0) {
            savedSettings.activeTab = indTab;
            savedSettings.data[indTab] = {
                tab: tabData || {},
                option: {
                    activeOption: 0,
                    ...tabOptionData
                }
            };
            localStorage.setItem('employee_settings', JSON.stringify(savedSettings));
        }
    }

    function onSelectOption(indOption, optionData) {
        const { tabOption, ...restElems } = Object.assign({}, userInfo);

        if (savedSettings && Object.keys(savedSettings).length !== 0) {
            savedSettings.data[savedSettings?.activeTab] = {
                tab: userInfo?.tab || {},
                option: { activeOption: indOption, ...optionData }
            };
            localStorage.setItem('employee_settings', JSON.stringify(savedSettings));
        }

        setUserInfo(() => {
            refTabBar.current.style.marginLeft = `${indOption * 12.5}%`;
            return { tabOption: optionData, ...restElems };
        });
    }

    useEffect(() => {
        const tabsData =
            UserService.getTabs()?.map(item => {
                return { key: item?.keyTab, value: item?.tab };
            }) || [];
        const tabData = savedSettings?.data[savedSettings?.activeTab].tab || tabsData[0];

        const tabOptionsData = UserService.getTabOptions(tabData) || [];
        const tabOptionData = tabOptionsData[0];

        const valsToDisplayData = UserService.getValuesToDisplay(tabData, tabOptionData) || [];
        const dataOperationsData = UserService.getDataOperations() || [];

        if (!savedSettings || Object.keys(savedSettings).length === 0)
            UserService.initStorageSettings(tabsData, tabOptionData);

        setUserInfo(() => {
            fetchData(tabData?.key, state?.idEmployee);
            return {
                tabs: tabsData,
                tab: tabData,
                tabOptions: tabOptionsData,
                tabOption: tabOptionData,
                valsToDisplay: valsToDisplayData,
                dataOperations: dataOperationsData
            };
        });
    }, []);

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
                        // onClick={() => navigate(-1)}
                    />
                </div>
            </div>
            <ul className="user__side-menu">
                {userInfo.tabs.map((tabData, indTab) => (
                    <li
                        className={classNames('user__side-menu-item', {
                            'user__side-menu-item_active': tabData?.key === userInfo.tab?.key
                        })}
                        onClick={() => onSelectTab(indTab, tabData)}
                    >
                        <img className="user__side-menu-img" src={`/img/${tabData?.key}.svg`} alt="Profile" />
                        {tabData.value}
                    </li>
                ))}
            </ul>
            <div className="user__options-content">
                {isLoading ? <Preloader /> : userInfo.tab?.key in TABS_CONF ? TABS_CONF[userInfo.tab?.key]() : null}
            </div>
        </div>
    );
}
