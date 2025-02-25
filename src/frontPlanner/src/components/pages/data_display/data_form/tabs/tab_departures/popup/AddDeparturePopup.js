import { useState } from 'react';
import classNames from 'classnames';

// Импорт компонетов
import CalendarWindow from '@generic/elements/calendar/CalendarWindow';
import DropdownMenu from '@generic/elements/dropdown_menu/DropdownMenu';

import InputDataPopup from '@generic/elements/popup/InputDataPopup';
import UsersPopupWindow from '@generic/elements/popup/UsersPopupWindow';
import ObjectDeparturePopup from '../../../../display_modes/calendar/popups/ObjectDeparturePopup';

import IconButton from '@generic/elements/buttons/IcButton';
import BgFillText from '@generic/elements/text/BgFillText';

// Импорт стилей
import './add_departure_popup.css';

// Блок "Объект обследования"
function ObjectOfDeparture({ additClass }) {
    const [statePopup, setStatePopup] = useState(false);

    return (
        <li className={classNames('form_item', additClass)}>
            <h2>Объект обследования</h2>
            <div className={classNames('form_item_wrapper', additClass)}>
                <IconButton
                    nameClass={'ic_btn select_obj'}
                    text={'Выбрать объект'}
                    icon={'arrow_down_sm.svg'}
                    onClick={() => setStatePopup(true)}
                />
                {statePopup && (
                    <ObjectDeparturePopup
                        additClass={additClass}
                        statePopup={statePopup}
                        setStatePopup={setStatePopup}
                    />
                )}
            </div>
        </li>
    );
}

// Блок "Предмет обследования"
// function SubjectOfSurvey({ additClass }) {
//     return (
//         <li className={classNames('form_item', additClass)}>
//             <h2>Что обследовать?</h2>
//             <input className={classNames('inpt_field', additClass)} type="text" />
//         </li>
//     );
// }

// Блок "Группа"
function Group({ additClass }) {
    function onClickItemGroup(value) {}

    return (
        <li className={classNames('form_item', additClass)}>
            <h2>Группа</h2>
            <DropdownMenu
                additClass={additClass}
                icon={'arrow_down_sm.svg'}
                nameMenu={'Группа'}
                onItemClick={onClickItemGroup}
            />
        </li>
    );
}

// Ответственный
function Responsible({ additClass }) {
    const [statePopup, setStatePopup] = useState(false);
    const [responsible, setResponsible] = useState(null);

    function onSelectResponsible(user) {
        setResponsible(user);
    }

    return (
        <li className={classNames('form_item', additClass)}>
            <h2>Ответственный</h2>
            <div className={classNames('users', additClass)}>
                {statePopup ? (
                    <UsersPopupWindow
                        additClass={'add_user'}
                        statePopup={statePopup}
                        setStatePopup={setStatePopup}
                        selectUser={onSelectResponsible}
                    />
                ) : null}
                <div className={classNames('users_content', additClass)}>
                    {responsible ? (
                        <ul className={classNames('list_users', additClass)}>
                            <li className={classNames('user', additClass)}>
                                <BgFillText type={'p'} text={responsible.fullName} bgColor={'#f1f1f1'} />
                            </li>
                        </ul>
                    ) : (
                        <BgFillText type={'p'} text={'Добавить'} bgColor={'#f1f1f1'} />
                    )}
                </div>
                <IconButton
                    nameClass={classNames('ic_btn add_', additClass)}
                    icon={'plus_gr.svg'}
                    onClick={() => setStatePopup(true)}
                />
            </div>
        </li>
    );
}

// Блок "Кто выезжает"
function Departing({ additClass }) {
    const [statePopup, setStatePopup] = useState(false);
    const [departing, setDeparting] = useState([]);

    function onSelectParticipant(participant) {
        setDeparting([...departing, participant]);
    }

    return (
        <li className={classNames('form_item', additClass)}>
            <h2>Кто выезжает</h2>
            <div className={classNames('users', additClass)}>
                {statePopup ? (
                    <UsersPopupWindow
                        additClass={'add_user'}
                        statePopup={statePopup}
                        setStatePopup={setStatePopup}
                        selectUser={onSelectParticipant}
                    />
                ) : null}
                <div className={classNames('users_content', additClass)}>
                    {departing && departing.length !== 0 ? (
                        <ul className={classNames('list_users', additClass)}>
                            {departing.map((participant, index) => (
                                <li key={index} className={classNames('user', additClass)}>
                                    <BgFillText type={'p'} text={participant.fullName} bgColor={'#f1f1f1'} />
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <BgFillText type={'p'} text={'Добавить'} bgColor={'#f1f1f1'} />
                    )}
                </div>
                <IconButton
                    nameClass={'ic_btn add_participant'}
                    icon={'plus_gr.svg'}
                    onClick={() => setStatePopup(true)}
                />
            </div>
        </li>
    );
}

// Блок "Автомобиль"
function Car({ additClass }) {
    function onClickItemCar(value) {}

    return (
        <li className={classNames('form_item', additClass)}>
            <h2>Автомобиль</h2>
            <DropdownMenu
                additClass={additClass}
                icon={'arrow_down_sm.svg'}
                nameMenu={'Машина'}
                onItemClick={onClickItemCar}
            />
        </li>
    );
}

// Блок "Дата"
function DateDeparture({ additClass }) {
    const [stateCalendar, setStateCalendar] = useState(false);
    const [departures, setDepartures] = useState([]);

    let dateDayMonthYear = '';

    function setDepartureDate(date) {
        dateDayMonthYear = date.toLocaleDateString('pl', { day: 'numeric', month: 'numeric', year: '2-digit' });
        setDepartures([...departures, dateDayMonthYear]);
    }

    return (
        <li className={classNames('form_item', additClass)}>
            <h2>Дата</h2>
            <div className={classNames('date_container', additClass)}>
                {departures && departures.length !== 0 ? (
                    <ul className="departure_list">
                        {departures.map((item, index) => (
                            <li className="departure_item" key={index}>
                                <p className="departure_date">{item}</p>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="departure_default">
                        <BgFillText type={'p'} text={'Добавить'} bgColor={'#f1f1f1'} />
                    </div>
                )}
                <div className="add_departure">
                    <IconButton
                        nameClass={classNames('ic_btn add_', additClass)}
                        icon={'plus_gr.svg'}
                        onClick={() => setStateCalendar(true)}
                    />
                    {stateCalendar ? (
                        <CalendarWindow setStateCalendar={setStateCalendar} onClickDate={setDepartureDate} />
                    ) : null}
                </div>
            </div>
        </li>
    );
}

// Блок "Контакт для связи"
function Contacts({ additClass }) {
    return (
        <li className={classNames('form_item', additClass)}>
            <h2>Контакт для связи</h2>
            <textarea className={classNames('text_area', additClass)} name="contacts"></textarea>
        </li>
    );
}

// Блок "Программа работ"
function WorkProgram({ additClass }) {
    return (
        <li className={classNames('form_item', additClass)}>
            <h2>Программа работ</h2>
            <div className="block_upload_job">
                <button className="btn_upload_job">Загрузить</button>
                <p className="upload_job"></p>
            </div>
        </li>
    );
}

// Блок "Комментарий"
function Comment({ additClass }) {
    return (
        <li className={classNames('form_item', additClass)}>
            <h2>Комментарий</h2>
            <textarea className={classNames('text_area', additClass)} name="comment" rows="8"></textarea>
        </li>
    );
}

// Блок "Оборудование"
function Equipment({ additClass }) {
    return (
        <li className={classNames('form_item', additClass)}>
            <h2>Оборудование</h2>
            <button className="btn_add_equipment">Добавить оборудование</button>
        </li>
    );
}

export default function AddDeparturePopup(props) {
    const { title, additClass, stateInputPopup, setStateInputPopup, changeLink } = props;
    return (
        <InputDataPopup
            title={title}
            additClass={additClass}
            overlay={true}
            statePopup={stateInputPopup}
            setStatePopup={setStateInputPopup}
            changeLink={changeLink}
        >
            <div className={classNames('popup_content', additClass)}>
                <ul className={classNames(`${additClass}_popup_form`, 'left')}>
                    <ObjectOfDeparture additClass={'obj_of_departure'} />
                    <Group additClass={'group'} />
                    <Responsible additClass={'responsible'} />
                    <Departing additClass={'departing'} />
                    <Car additClass={'cars'} />
                    <DateDeparture additClass={'date_departure'} />
                    <Contacts additClass={'contacts'} />
                    <WorkProgram additClass={'work_program'} />
                    <Comment additClass={'comment'} />
                </ul>
                <div className={classNames(`${additClass}_popup_form`, 'right')}>
                    <Equipment additClass={'equipment'} />
                </div>
            </div>
        </InputDataPopup>
    );
}
