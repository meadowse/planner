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
                <h2 className="section__dataform-title-contract section__dataform-header-title">
                    {data?.contractNum ? data.contractNum : 'Нет данных'}
                </h2>
                <h3 className="section__dataform-title-address section__dataform-header-title">
                    <span>{data?.contractNum ? data.address : 'Нет данных'}</span>
                </h3>
                {/* <img className="section__dataform-header-img" src="/img/edit.svg" alt="Edit" /> */}
            </div>
            <div className="section__dataform-header-right">
                <IconButton
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
                />
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

    return (
        <div className="section__dataform-tabs">
            <TabsHeader tabs={tabs} tab={tab} config={config} tabClick={setTab} navigate={navigate} />
            <Outlet context={config} />
        </div>
    );
}

export default function DataFormNew() {
    const uploadedData = useLoaderData();
    const navigate = useNavigate();
    const { state } = useLocation();
    const [prevPath] = useState(state?.path);

    const configData = {
        idContract: state?.idContract || localStorage.getItem('idContract') || -1,
        partition: state?.partition,
        dataOperation: state?.dataOperation,
        tabForm: state?.tabForm,
        data: uploadedData
    };
    // console.log(`DataFormNew state: ${JSON.stringify(state, null, 4)}`);

    return (
        <section className="section__dataform">
            <FormHeader
                data={{ contractNum: uploadedData?.contractNum, address: uploadedData?.address }}
                config={{ prevPath }}
                navigate={navigate}
            />
            <Tabs tabs={DataFormService.getOptions('tabs')} config={configData} navigate={navigate} />
        </section>
    );
}
