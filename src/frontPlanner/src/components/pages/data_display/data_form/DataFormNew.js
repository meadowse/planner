import { startTransition, useEffect, useState } from 'react';
import { useLocation, useLoaderData, useNavigate, Outlet } from 'react-router-dom';
import classNames from 'classnames';
import axios from 'axios';

// Импорт компонетов
import Preloader from '../../../auxiliary_pages/loader/Preloader';
import IconButton from '@generic/elements/buttons/IcButton';

// Импорт сервисов
import DataFormService from '@services/data_form.service';

import { useHistoryContext } from '../../../../contexts/history.context';

// Импорт стилей
import './data_form.css';

function FormHeader(props) {
    const { data, config, navigate } = props;
    const { history, backToPrevPath } = useHistoryContext();

    function onCancelAction() {
        startTransition(() => {
            // alert(`prevpath: ${config?.prevPath}`);
            // navigate(`../../${config?.prevPath}`);
            setTimeout(() => {
                backToPrevPath();
            }, 1000);

            navigate(`../../${history[history.length - 1]}`);
        });
    }

    return (
        <div className="section__dataform-header">
            <div className="section__dataform-header-left">
                <h2
                    // className="section__dataform-title-contract section__dataform-header-title">
                    className="section__dataform-header-title"
                >
                    {data?.title ?? 'Нет данных'}
                </h2>
                <h3
                    // className="section__dataform-title-address section__dataform-header-title">
                    className="section__dataform-header-subtitle"
                >
                    <span>{data?.subTitle ?? 'Нет данных'}</span>
                </h3>
                {/* <img className="section__dataform-header-img" src="/img/edit.svg" alt="Edit" /> */}
            </div>
            <div className="section__dataform-header-right">
                <button className="icon-btn__save icon-btn" form="general_form">
                    Сохранить<span>&#10003;</span>
                </button>
                <button className="icon-btn__cancel icon-btn" onClick={onCancelAction}>
                    Отменить<span>&#10006;</span>
                </button>
                {/* <IconButton
                    nameClass="icon-btn__save icon-btn"
                    idForm="general_form"
                    type="submit"
                    text="Сохранить"
                    icon="check_mark.svg"
                />
                <IconButton
                    nameClass="icon-btn__cancel icon-btn"
                    type="button"
                    text="Отменить"
                    icon="cancel_bl.svg"
                    onClick={onCancelAction}
                /> */}
            </div>
        </div>
    );
}

function TabsHeader(props) {
    const { tabs, tab, config, tabClick, navigate } = props;

    // console.log(`TabsHeader config: ${JSON.stringify(config, null, 4)}`);
    // console.log(`Selected tab: ${JSON.stringify(tab, null, 4)}`);

    const NAVIGATION_CONF = {
        works: item => navigate(`${item?.key}/${config?.idContract}`, { state: config }),
        default: item => navigate(`${item?.key}/`, { state: config })
    };

    function onTabClick(item) {
        localStorage.setItem('selectedTab', JSON.stringify(item));
        tabClick(item);
        // console.log(`config: ${JSON.stringify(config, null, 4)}`);
        if (item?.key in NAVIGATION_CONF) NAVIGATION_CONF[item?.key](item);
        else NAVIGATION_CONF?.default(item);
    }

    return (
        <ul className="section__dataform-tabs-header">
            {tabs && tabs.length !== 0
                ? tabs.map((item, index) => (
                      <li
                          key={index}
                          className={classNames('section__dataform-tab-btn', {
                              'section__dataform-tab-btn_active': item.key === tab.key
                          })}
                          onClick={() => onTabClick(item)}
                      >
                          {item.title}
                      </li>
                  ))
                : null}
        </ul>
    );
}

function Tabs(props) {
    const { tabs, config, navigate } = props;
    // console.log(`config: ${JSON.stringify(config, null, 4)}`);

    const [tab, setTab] = useState(tabs[0] || {});

    useEffect(() => {
        const savedTab = JSON.parse(localStorage.getItem('selectedTab'));
        if (savedTab && Object.keys(savedTab).length !== 0) setTab(savedTab);
    }, []);

    // const PARTITION_CONF = {
    //     equipment: () => {},
    //     default: () => <TabsHeader tabs={tabs} tab={tab} config={config} tabClick={setTab} navigate={navigate} />
    // };

    return (
        <div className="section__dataform-tabs">
            <TabsHeader tabs={tabs} tab={tab} config={config} tabClick={setTab} navigate={navigate} />
            <Outlet context={config} />
            {/* {PARTITION_CONF[config?.partition] ? PARTITION_CONF[config?.partition]() : PARTITION_CONF?.default()} */}
        </div>
    );
}

export default function DataFormNew() {
    const uploadedData = useLoaderData();
    const navigate = useNavigate();
    // const { state } = useLocation();
    const location = useLocation();
    // const [prevPath] = useState(state?.path);
    const [prevPath] = useState(location?.state?.path);

    // console.log(`DataFormNew state args: ${JSON.stringify(state, null, 4)}`);
    // console.log(`DataFormNew configData: ${JSON.stringify(configData, null, 4)}`);

    console.log(`DataFormNew state: ${JSON.stringify(location?.state, null, 4)}`);
    // console.log(`DataFormNew uploadedData: ${JSON.stringify(uploadedData, null, 4)}`);

    function getConfigData() {
        const queryParams = new URLSearchParams(location.search);
        const queryData = JSON.parse(decodeURIComponent(queryParams.get('data')));

        if (queryData && Object.keys(queryData).length !== 0) {
            return {
                idContract: queryData?.idContract || localStorage.getItem('idContract') || -1,
                partition: queryData?.partition,
                dataOperation: queryData?.dataOperation,
                tabForm: queryData?.tabForm,
                data: uploadedData
            };
        } else {
            return {
                idContract: location?.state?.idContract || localStorage.getItem('idContract') || -1,
                partition: location?.state?.partition,
                dataOperation: location?.state?.dataOperation,
                tabForm: location?.state?.tabForm,
                data: uploadedData
            };
        }
    }

    //

    return (
        <section className="section__dataform">
            <FormHeader
                // data={{ contractNum: uploadedData?.contractNum, address: uploadedData?.address }}
                data={{
                    title: uploadedData?.address || uploadedData?.equipment?.title,
                    subTitle: uploadedData?.contractNum || uploadedData?.equipment?.model
                }}
                config={{ prevPath }}
                navigate={navigate}
            />
            {/* {PARTITION_CONF[state?.partition] ? PARTITION_CONF[state?.partition]() : PARTITION_CONF?.default()} */}
            <Tabs tabs={DataFormService.getOptions('tabs')} config={getConfigData()} navigate={navigate} />
        </section>
    );
}

// const configData = {
//     idContract: state?.idContract || localStorage.getItem('idContract') || -1,
//     partition: state?.partition,
//     dataOperation: state?.dataOperation,
//     tabForm: state?.tabForm,
//     data: uploadedData
// };
