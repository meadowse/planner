import { startTransition, useEffect, useState } from 'react';
import { useLocation, useLoaderData, useNavigate, Outlet } from 'react-router-dom';
import classNames from 'classnames';
import axios from 'axios';

// Импорт компонетов
import Preloader from '../../../auxiliary_pages/loader/Preloader';
import IconButton from '@generic/elements/buttons/IcButton';

// Импорт сервисов
import DataFormService from '@services/data_form.service';

// Импорт стилей
import './data_form.css';

function FormHeader({ data }) {
    const navigate = useNavigate();

    function onSelectAction(value) {}

    function onCancelAction() {
        startTransition(() => {
            // navigate('/');
            navigate(-2);
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
    const { tabs, tab, config, tabClick } = props;
    const navigate = useNavigate();

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
        // NAVIGATION_CONF[item?.key] ? NAVIGATION_CONF[item?.key](item) : NAVIGATION_CONF?.default(item);
        // console.log(`click config: ${JSON.stringify(config, null, 4)}`);
        // navigate(`${item?.key}/${config?.idContract}`, { state: { ...config } });
    }

    // useEffect(() => {
    //     navigate(`${tab?.key}/${config?.idContract}`, { state: { ...config } });
    // }, []);

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
    const { tabs, config } = props;
    // console.log(`config: ${JSON.stringify(config, null, 4)}`);
    const [tab, setTab] = useState(
        config?.tabForm && Object.keys(config?.tabForm).length !== 0 ? config?.tabForm : tabs[0]
    );
    // const [tab, setTab] = useState(null);
    const navigate = useNavigate();

    // useEffect(() => {
    //     console.log(`tab: ${JSON.stringify(tab, null, 4)}`);
    //     // navigate(`${tab?.key}/${config?.idContract}`, { state: { ...config } });
    //     navigate(`${tab?.key}/`, { state: config });
    //     // console.log(`config state: ${JSON.stringify(config, null, 4)}`);
    // }, []);

    return (
        <div className="section__dataform-tabs">
            <TabsHeader tabs={tabs} tab={tab} config={config} tabClick={setTab} />
            <Outlet context={config} />
        </div>
    );
}

export default function DataFormNew() {
    const uploadedData = useLoaderData();
    const { state } = useLocation();

    const configData = {
        idContract: state?.idContract,
        partition: state?.partition,
        dataOperation: state?.dataOperation,
        tabForm: state?.tabForm,
        data: uploadedData
    };
    console.log(`uploadedData: ${JSON.stringify(uploadedData, null, 4)}`);

    return (
        <section className="section__dataform">
            <FormHeader data={{ contractNum: uploadedData?.contractNum, address: uploadedData?.address }} />
            <Tabs tabs={DataFormService.getOptions('tabs')} config={configData} />
        </section>
    );
}
