import { useState } from 'react';
import classNames from 'classnames';

// Импорт компонетов
import BgFillText from '@generic/elements/text/BgFillText';
import IconButton from '@generic/elements/buttons/IcButton';
import DropdownMenu from '@generic/elements/dropdown_menu/DropdownMenu';

import Popup from '@generic/elements/popup/Popup';
import CalendarWindow from '@generic/elements/calendar/CalendarWindow';
import UsersPopupWindow from '@generic/elements/popup/UsersPopupWindow';

// Импорт доп.функционала
import { getDateInFormatDDMMYY } from '@helpers/calendar';

// Импорт стилей
import './works_filters_popup.css';

// Отдел
function Department(props) {
    const { additClass, sections, section } = props;

    const dataSource = sections.map(item => ({ ['title']: item.title }));

    function onClickItemDepartment(value) {}

    return (
        <li className="popup__filters-item">
            <h2>Отдел</h2>
            <div className={`popup__filters-item-${additClass}`}>
                <DropdownMenu
                    additClass={additClass}
                    icon="arrow_down_sm.svg"
                    nameMenu="Отдел"
                    specifiedVal={section}
                    dataSource={dataSource}
                    onItemClick={onClickItemDepartment}
                />
            </div>
        </li>
    );
}

// Группа
function Group(props) {
    const { additClass, subSections, subSection } = props;

    const dataSource = subSections.map(item => ({ ['title']: item.title }));

    function onClickItemDepartment(value) {}

    return (
        <li className="popup__filters-item">
            <h2>Группа</h2>
            <div className={`popup__filters-item-${additClass}`}>
                <DropdownMenu
                    additClass={additClass}
                    icon="arrow_down_sm.svg"
                    nameMenu="Группа"
                    dataSource={dataSource}
                    onItemClick={onClickItemDepartment}
                />
            </div>
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
        <li className="popup__filters-item">
            <h2>Ответственный</h2>
            <div className={`popup__filters-item-${additClass}`}>
                {statePopup ? (
                    <UsersPopupWindow
                        additClass="add-user"
                        statePopup={statePopup}
                        setStatePopup={setStatePopup}
                        selectUser={onSelectResponsible}
                    />
                ) : null}
                <div className={classNames('users_content', additClass)}>
                    {responsible && Object.keys(responsible).length !== 0 ? (
                        <ul className={classNames('list_users', additClass)}>
                            <li className={classNames('user', additClass)}>
                                <BgFillText type="p" text={responsible.fullName} bgColor="#f1f1f1" />
                            </li>
                        </ul>
                    ) : (
                        <BgFillText type="p" text="Добавить" bgColor="#f1f1f1" />
                    )}
                </div>
                <IconButton
                    nameClass={`icon-btn__add-${additClass} icon-btn`}
                    icon={'plus_gr.svg'}
                    onClick={() => setStatePopup(true)}
                />
            </div>
        </li>
    );
}

// Срок до
function Deadline({ additClass }) {
    const [deadline, setDeadline] = useState('_ . _ . _');
    const [calendarState, setCalendarState] = useState(false);

    let dateDDMMYY = '';

    function onSetdeadline(date) {
        dateDDMMYY = getDateInFormatDDMMYY(date.getFullYear(), date.getMonth(), date.getDate());
        setDeadline(dateDDMMYY);
    }

    return (
        <li className="popup__filters-item">
            <h2>Срок до</h2>
            <div className={`popup__filters-item-${additClass}`}>
                <p className={`popup__filters-item-${additClass}-begin`} onClick={() => setCalendarState(true)}>
                    {deadline}
                </p>
                {calendarState ? (
                    <CalendarWindow
                        additClass={additClass}
                        stateCalendar={calendarState}
                        setStateCalendar={setCalendarState}
                        onClickDate={onSetdeadline}
                    />
                ) : null}
            </div>
        </li>
    );
}

export default function WorksFiltersPopup(props) {
    const { additClass, options, statePopup, setStatePopup } = props;

    const [section, setSection] = useState(options?.sections[0]);
    const [subSections, setSubSections] = useState(options?.subsections);
    const [subSection, setSubSection] = useState(options?.subsections[0]);

    return (
        <Popup additClass={additClass} statePopup={statePopup} setStatePopup={setStatePopup}>
            <ul className="popup__filters">
                <Department additClass="department" sections={options?.sections} section={section} />
                <Group additClass="group" subSections={subSections} subSection={subSection} />
                <Responsible additClass="responsible" />
                <Deadline additClass="deadline" />
            </ul>
        </Popup>
    );
}
