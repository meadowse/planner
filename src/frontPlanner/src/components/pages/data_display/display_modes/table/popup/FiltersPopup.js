import { useState } from 'react';
import classNames from 'classnames';

// Импорт компонетов
import BgFillText from '@generic/elements/text/BgFillText';
import IconButton from '@generic/elements/buttons/IcButton';
import Popup from '@generic/elements/popup/Popup';
import UsersPopupWindow from '@generic/elements/popup/UsersPopupWindow';

// Импорт стилей
import './filters_popup.css';

// Дата выезда
function DateDepartureFilter({ additClass }) {
    return (
        <li className={classNames('filter_item', additClass)}>
            <h2>Дата выезда</h2>
            <div className={classNames('filter_item_wrapper', additClass)}>
                <input className={classNames('inpt_data', 'first_date')} type="text" placeholder="с" />
                &mdash;
                <input className={classNames('inpt_data', 'end_date')} type="text" placeholder="по" />
            </div>
        </li>
    );
}

// Кто выезжает
function DepartingFilter({ additClass }) {
    const [statePopup, setStatePopup] = useState(false);
    const [departing, setDeparting] = useState([]);

    function onSelectParticipant(participant) {
        setDeparting([...departing, participant]);
    }

    return (
        <li className={classNames('filter_item', additClass)}>
            <h2>Кто выезжает</h2>
            <div className={classNames('filter_item_wrapper', additClass)}>
                {statePopup && (
                    <UsersPopupWindow
                        additClass={'add_user'}
                        statePopup={statePopup}
                        setStatePopup={setStatePopup}
                        selectUser={onSelectParticipant}
                    />
                )}
                {departing.length !== 0 && (
                    <ul className={classNames('list_users', additClass)}>
                        {departing.map((participant, index) => (
                            <li key={index} className={classNames('user', additClass)}>
                                <BgFillText type={'p'} text={participant.fullName} bgColor={'#f1f1f1'} />
                            </li>
                        ))}
                    </ul>
                )}
                {departing.length === 0 && <BgFillText type={'p'} text={'Добавить'} bgColor={'#f1f1f1'} />}
                <IconButton
                    nameClass={'ic_btn add_participant'}
                    icon={'plus_gr.svg'}
                    onClick={() => setStatePopup(true)}
                />
            </div>
        </li>
    );
}

// Группа
function GroupFilter({ additClass }) {
    const [stateDropdown, setStateDropdown] = useState(false);
    const [group, setGroup] = useState(null);

    return (
        <li className={classNames('filter_item', additClass)}>
            <h2>Группа</h2>
            <div className={classNames('filter_item_wrapper', additClass)}>
                {stateDropdown && <p></p>}
                <div className="group_content">
                    {group && (
                        <ul className="list_groups">
                            <li className={'group _list_item'}>
                                <BgFillText type={'p'} text={group.fullName} bgColor={'#f1f1f1'} />
                            </li>
                        </ul>
                    )}
                    {!group && <BgFillText type={'p'} text={'Добавить'} bgColor={'#f1f1f1'} />}
                </div>
                <IconButton
                    nameClass={'ic_btn add_group'}
                    icon={'plus_gr.svg'}
                    onClick={() => setStateDropdown(true)}
                />
            </div>
        </li>
    );
}

// Стадия
function StageFilter({ additClass }) {
    return (
        <li className={classNames('filter_item', additClass)}>
            <h2>Стадия</h2>
            <div className={classNames('filter_item_wrapper', additClass)}>
                <ul className="stages_list">
                    <li className="stages_list_item">Не запланирован</li>
                    <li className="stages_list_item">Подтвержден</li>
                    <li className="stages_list_item">Завершено</li>
                </ul>
            </div>
        </li>
    );
}

// Автомобиль
function CarFilter({ additClass }) {
    return (
        <li className={classNames('filter_item', additClass)}>
            <h2>Автомобиль</h2>
            <div className={classNames('filter_item_wrapper', additClass)}>
                <ul className="cars_list">
                    <li className="cars_list_item">м525му</li>
                    <li className="cars_list_item">м070мх</li>
                    <li className="cars_list_item">с702ав</li>
                </ul>
            </div>
        </li>
    );
}

export default function FiltersPopup(props) {
    const { additClass, statePopup, setStatePopup } = props;

    return (
        <Popup additClass={additClass} statePopup={statePopup} setStatePopup={setStatePopup}>
            <div className={classNames('popup_content', additClass)}>
                <ul className="list_filters">
                    <DateDepartureFilter additClass={'date_departure'} />
                    <DepartingFilter additClass={'departing'} />
                    <GroupFilter additClass={'group'} />
                    <StageFilter additClass={'stage'} />
                    <CarFilter additClass={'car'} />
                </ul>
            </div>
        </Popup>
    );
}
