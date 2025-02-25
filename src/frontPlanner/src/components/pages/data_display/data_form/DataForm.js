import { startTransition, useState } from 'react';
import { useLoaderData, useLocation, useNavigate } from 'react-router-dom';
import classNames from 'classnames';

// Импорт компонетов
import IconButton from '@generic/elements/buttons/IcButton';
import DropdownMenu from '@generic/elements/dropdown_menu/DropdownMenu';

import TabGeneral from './tabs/tab_general/TabGeneral';
import TabWork from './tabs/tab_work/TabWork';
import TabDepartures from './tabs/tab_departures/TabDepartures';
import TabContractors from './tabs/tab_contractors/TabContractors';
import TabDocuments from './tabs/tab_documents/TabDocuments';
import TabEquipment from './tabs/tab_equipment/TabEquipment';

// Импорт сервисов
import DataFormService from '@services/data_form.service';

// Импорт стилей
import './data_form.css';

function FormHeader({ title }) {
    const navigate = useNavigate();

    function onSelectAction(value) {}

    function onCancelAction() {
        startTransition(() => {
            navigate('/');
        });
    }

    return (
        <div className="section__dataform-header">
            <div className="section__dataform-header-left">
                <h2 className="section__dataform-header-title">
                    <span>{title ? title : 'Нет данных'}</span>
                </h2>
                <img className="section__dataform-header-img" src="/img/edit.svg" alt="Edit" />
            </div>
            <div className="section__dataform-header-right">
                {/* <DropdownMenu
                    additClass="action"
                    icon="arrow_down_sm.svg"
                    keyMenu="actions"
                    nameMenu="Действие"
                    onItemClick={onSelectAction}
                /> */}
                <IconButton
                    nameClass="icon-btn__save icon-btn"
                    type="submit"
                    idForm="general_form"
                    text="Сохранить"
                    icon="check_mark.svg"
                />
                <IconButton
                    nameClass="icon-btn__cancel icon-btn"
                    text="Отменить"
                    icon="cancel_bl.svg"
                    onClick={onCancelAction}
                />
            </div>
        </div>
    );
}

function TabsHeader(props) {
    const { tabs, tab, tabClick } = props;

    function onTabClick(item) {
        localStorage.setItem('selectedTab', JSON.stringify(item));
        tabClick(item);
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

function TabsContent(props) {
    const { idCard, partition, tab, data, options, dataOperation } = props;

    console.log(`tab: ${JSON.stringify(tab, null, 4)}`);
    // console.log(`idCard: ${idCard}\nsubsectionData: ${JSON.stringify(subsectionData, null, 4)}`);
    console.log(`cardData: ${JSON.stringify(data, null, 4)}`);

    const TABS = {
        'general': <TabGeneral idCard={idCard} data={data} dataOperation={dataOperation} />,
        'work': <TabWork options={options} />,
        // 'departures': <TabDepartures subsection={findNestedObj(data, 'title', 'Выезды')} />,
        'contractors': <TabContractors />,
        'documents': <TabDocuments />,
        'equipment': <TabEquipment />
    };

    return <div className="section__dataform-tabs-content">{partition ? TABS[partition] : TABS[tab.key]}</div>;
}

function Tabs(props) {
    const { id, partition, tabs, data, options, dataOperation } = props;
    const [tab, setTab] = useState(JSON.parse(localStorage.getItem('selectedTab')) || tabs[0]);

    console.log(`partition: ${partition}`);

    const PARTITION_CONF = {
        department: () => {
            return (
                <>
                    <TabsHeader tabs={tabs} tab={tab} tabClick={setTab} />
                    <TabsContent idCard={id} tab={tab} data={data} options={options} dataOperation={dataOperation} />
                </>
            );
        },
        equipment: () => {
            return (
                <TabsContent
                    idCard={id}
                    partition={partition}
                    tab={tab}
                    data={data}
                    options={options}
                    dataOperation={dataOperation}
                />
            );
        }
    };

    return <div className="section__dataform-tabs">{partition ? PARTITION_CONF[partition]() : null}</div>;
}

export default function DataForm() {
    const { state } = useLocation();
    const options = useLoaderData();
    // console.log(`Loader options: ${JSON.stringify(options, null, 4)}`);
    // const { idCard } = state && Object.keys(state).length !== 0 ? state : { idCard: null };

    console.log(`state: ${JSON.stringify(state, null, 4)}`);

    return (
        <section className="section__dataform">
            <FormHeader title={state?.data?.address} />
            <Tabs
                id={-1}
                partition={state?.partition}
                tabs={DataFormService.getOptions('tabs')}
                data={state?.data}
                options={options}
                dataOperation={state?.dataOperation}
            />
        </section>
    );
}
