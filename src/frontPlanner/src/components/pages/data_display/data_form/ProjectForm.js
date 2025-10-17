import { startTransition, useEffect, useState } from 'react';
import { useLocation, useLoaderData, useNavigate, Outlet } from 'react-router-dom';
import classNames from 'classnames';
import axios from 'axios';

// Импорт сервисов
import DataFormService from '@services/data_form.service';

// Импорт контекста
import { useHistoryContext } from '@contexts/history.context';

// Импорт стилей
import './project_form.css';

// Интеграция с Mattermost
function MattermostIntegration({ channelId }) {
    return (
        <div className="section__projectform-frame-wrapper">
            <iframe
                title="Mattermost"
                src={`https://mm-mpk.ru/mosproektkompleks/channels/${channelId}`}
                style={{ width: '100%', height: '100%', border: 'none' }}
            />
        </div>
    );
}

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
        <div className="section__projectform-header">
            <div className="section__projectform-header-left">
                <h2 className="section__projectform-header-title">{data?.title ?? 'Нет данных'}</h2>
            </div>
            <div className="section__projectform-header-right">
                {/* <button className="icon-btn__save icon-btn" form="general_form">
                    Сохранить<span>&#10003;</span>
                </button> */}
                <button className="icon-btn__cancel icon-btn" onClick={onCancelAction}>
                    Отменить<span>&#10006;</span>
                </button>
            </div>
        </div>
    );
}

function TabsHeader(props) {
    const { tabs, tab, config, tabClick, navigate } = props;

    // console.log(`TabsHeader config: ${JSON.stringify(config, null, 4)}`);
    // console.log(`Selected tab: ${JSON.stringify(tab, null, 4)}`);

    const NAVIGATION_CONF = {
        default: item => navigate(`${item?.key}/`, { state: config })
    };

    function onTabClick(item) {
        tabClick(item);

        if (item?.key in NAVIGATION_CONF) NAVIGATION_CONF[item?.key](item);
        else NAVIGATION_CONF?.default(item);
    }

    return (
        <ul className="section__projectform-tabs-header">
            {tabs && tabs.length !== 0
                ? tabs.map((item, index) => (
                      <li
                          key={index}
                          className={classNames('section__projectform-tab-btn', {
                              'section__projectform-tab-btn_active': item.key === tab.key
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
    console.log(`config: ${JSON.stringify(config, null, 4)}`);

    const [tab, setTab] = useState(tabs[0] || {});

    useEffect(() => {
        const savedTab = JSON.parse(localStorage.getItem('selectedTab'));
        if (savedTab && Object.keys(savedTab).length !== 0) setTab(savedTab);
    }, []);

    return (
        <div className="section__projectform-tabs">
            <TabsHeader tabs={tabs} tab={tab} config={config} tabClick={setTab} navigate={navigate} />
            <div className="section__projectform-tabs-content">
                <Outlet context={config} />
                <MattermostIntegration channelId={config?.channelId} />
            </div>
        </div>
    );
}

export default function ProjectForm() {
    const uploadedData = useLoaderData();
    const navigate = useNavigate();

    const location = useLocation();
    const [prevPath] = useState(location?.state?.path);

    function getConfigData() {
        const queryParams = new URLSearchParams(location.search);
        const queryData = JSON.parse(decodeURIComponent(queryParams.get('data')));

        if (queryData && Object.keys(queryData).length !== 0) {
        } else {
            return {
                channelId: location?.state?.channelId ?? -1
            };
        }
    }

    return (
        <section className="section__projectform">
            <FormHeader
                data={{
                    // title: uploadedData?.project?.title
                    title: location?.state?.project?.title
                }}
                config={{ prevPath }}
                navigate={navigate}
            />
            <Tabs tabs={[{ key: 'general', title: 'Общие' }]} config={getConfigData()} navigate={navigate} />
        </section>
    );
}
