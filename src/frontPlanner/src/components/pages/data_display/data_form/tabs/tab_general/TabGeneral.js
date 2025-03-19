import { useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { createPortal } from 'react-dom';
import axios from 'axios';
import classNames from 'classnames';
import Cookies from 'js-cookie';

// Импорт компонетов
import IconButton from '@generic/elements/buttons/IcButton';
import BgFillText from '@generic/elements/text/BgFillText';

import DropdownMenu from '@generic/elements/dropdown_menu/DropdownMenu';
import ColorPaletteMenu from '@generic/elements/dropdown_menu/ColorPaletteMenu';

import UsersPopupWindow from '@generic/elements/popup/UsersPopupWindow';
import CalendarWindow from '@generic/elements/calendar/CalendarWindow';

// Импорт доп.функционала
import { getUniqueData } from '@helpers/helper';
import { getDateInSpecificFormat } from '@helpers/calendar';

// Импорт сервисов
import TabGeneralService from '@services/tabs/tab_general.service';

// Импорт кастомных хуков
import { useGeneralForm } from '@hooks/useGeneralForm';

// Импорт стилей
import './tab_general.css';

// Стадия
function Stage(props) {
    const { additClass, presetValue, disabledElem, stageError, onClick } = props;
    const [stage, setStage] = useState(presetValue ? presetValue : {});

    console.log(`Stage presetValue: ${JSON.stringify(presetValue, null, 4)}`);

    // Выбор статуса
    function onClickItemStage(value) {
        console.log(`stage: ${JSON.stringify(value, null, 4)}`);
        setStage(value);
        onClick('condition', value);
    }

    return (
        <div className="tab-general__stage">
            <DropdownMenu
                additClass={additClass}
                icon="arrow_down_sm.svg"
                keyMenu="stages"
                nameMenu="Статус"
                disabledElem={disabledElem}
                specifiedVal={stage}
                onItemClick={onClickItemStage}
            />
            <div data-error={stageError ? stageError.message : null}></div>
        </div>
    );
}

// Цвет карточки
function ColorCard(props) {
    const { additClass, disabledElem, onClick, onSelectColor } = props;

    // Установка цвета карточки
    function setColorCard(value) {
        onClick(additClass, value);
        onSelectColor(value);
    }

    return (
        <ColorPaletteMenu
            additClass={additClass}
            icon="arrow_down_sm.svg"
            keyMenu="colors"
            nameMenu="Цвет"
            disabledElem={disabledElem}
            onItemClick={setColorCard}
        />
    );
}

// Блок "Изображение объекта"
function ImageBuilding({ presetValue, disabledElem }) {
    const [image, setImage] = useState(presetValue.imgBuilding ? presetValue.imgBuilding : null);
    // console.log(`image: ${JSON.stringify(presetValue, null, 4)}`);

    // Загрузка изображения
    function onDownloadImage(event) {
        if (event.target.files && event.target.files[0]) {
            let file = event.target.files[0];
            let formData = new FormData();

            formData.append('image', file);
            formData.append('title', presetValue?.contractNum);
            axios({
                url: `${window.location.origin}/api/addPhoto`,
                method: 'POST',
                headers: {},
                data: formData
            })
                .then(response => {
                    if (response.status === 200) setImage(URL.createObjectURL(file));
                }) // Handle the response from backend here
                .catch(err => {}); // Catch errors if any
        }
    }

    // Удаление изображения
    function onDeleteImage() {
        if (image) setImage(null);
    }

    return (
        <div className="tab-general__image">
            {image ? (
                <img className="tab-general__img" src={image} alt="Building" />
            ) : (
                <p className="tab-general__image-message">No image</p>
            )}
            <div className="tab-general__image-actions">
                <input
                    id="choose_image"
                    className="tab__general-select-image"
                    type="file"
                    accept="image/*"
                    disabled={disabledElem}
                    onChange={onDownloadImage}
                />
                <label className="tab-general__label-image" htmlFor="choose_image">
                    Загрузить
                    <img className="tab-general__download" src="/img/download.svg" alt="Download" />
                </label>
                <IconButton
                    nameClass="icon-btn__delete-img icon-btn"
                    type="button"
                    text="Удалить"
                    icon="cancel_bl.svg"
                    disabled={disabledElem}
                    onClick={onDeleteImage}
                />
            </div>
        </div>
    );
}

// Блок "Шапка левого столбца"
function HeaderLeftCol(props) {
    const { additClass, presetValue, dataOperation, error, onClick, onSelectColor } = props;

    return (
        <div className="tab-general-row__top tab-general-row">
            <Stage
                additClass="stage"
                presetValue={presetValue.condition}
                disabledElem={dataOperation?.disabledFields?.condition}
                stageError={error}
                onClick={onClick}
            />
            <div className="tab-general__building tab-general-row-item">
                <ImageBuilding
                    additClass="building"
                    presetValue={{ contractNum: presetValue.contractNum, imgBuilding: presetValue.imgBuilding }}
                    disabledElem={dataOperation?.disabledFields?.imgBuilding}
                />
                <ColorCard
                    additClass="color"
                    onClick={onClick}
                    onSelectColor={onSelectColor}
                    disabledElem={dataOperation?.disabledFields?.color}
                />
            </div>
        </div>
    );
}

// Блок "Менеджер"
function Manager(props) {
    const { additClass, presetValue, managerError, disabledElem, onClick } = props;

    const [statePopup, setStatePopup] = useState(false);
    const [manager, setManager] = useState(presetValue ? presetValue : {});

    function onSelectManager(user) {
        setManager(user);
        onClick('manager', user);
    }

    function onDeleteUser() {
        setManager(null);
        onClick(additClass, null);
    }

    return (
        <div className="tab-general-row-wrapper" data-error={managerError ? managerError.message : null}>
            <div className="tab-general-row__manager tab-general-row">
                <h2 className="tab-general-row__title">Менеджер</h2>
                <div className="tab-general__manager tab-general-row-item">
                    <ul className="tab-general-row__item-managers">
                        {manager && Object.keys(manager)?.length !== 0 ? (
                            <li className="tab-general-row__item-manager tab-general-row-item__user" onClick={null}>
                                {manager?.fullName}
                                <IconButton
                                    nameClass="tab-general-row__ic-btn icon-btn"
                                    type="button"
                                    icon="cancel_bl.svg"
                                    disabled={disabledElem}
                                    onClick={onDeleteUser}
                                />
                            </li>
                        ) : (
                            <li>
                                <BgFillText type="p" text="Добавить" bgColor="#f1f1f1" />
                            </li>
                        )}
                    </ul>
                    <IconButton
                        nameClass="tab-general-row__ic-btn icon-btn"
                        type="button"
                        icon="plus_gr.svg"
                        disabled={disabledElem}
                        onClick={() => setStatePopup(true)}
                    />
                    {statePopup
                        ? createPortal(
                              <UsersPopupWindow
                                  additClass="add_user"
                                  overlay={true}
                                  statePopup={statePopup}
                                  setStatePopup={setStatePopup}
                                  selectUser={onSelectManager}
                              />,
                              document.getElementById('portal')
                          )
                        : null}
                </div>
            </div>
        </div>
    );
}

// Блок "Ответственный"
function Responsible(props) {
    const { additClass, presetValue, responsibleError, disabledElem, onClick } = props;

    const [statePopup, setStatePopup] = useState(false);
    const [responsible, setResponsible] = useState(presetValue ? presetValue : {});

    function onSelectManager(user) {
        setResponsible(user);
        onClick('responsible', user);
    }

    function onDeleteUser() {
        setResponsible(null);
        onClick('responsible', null);
    }

    return (
        <div className="tab-general-row-wrapper" data-error={responsibleError ? responsibleError.message : null}>
            <div className="tab-general-row__manager tab-general-row">
                <h2 className="tab-general-row__title">Ответственный</h2>
                <div className="tab-general__manager tab-general-row-item">
                    <ul className="tab-general-row__item-managers">
                        {responsible && Object.keys(responsible)?.length !== 0 ? (
                            <li className="tab-general-row__item-manager tab-general-row-item__user" onClick={null}>
                                {responsible?.fullName}
                                <IconButton
                                    nameClass="tab-general-row__ic-btn icon-btn"
                                    type="button"
                                    icon="cancel_bl.svg"
                                    disabled={disabledElem}
                                    onClick={onDeleteUser}
                                />
                            </li>
                        ) : (
                            <li>
                                <BgFillText type="p" text="Добавить" bgColor={'#f1f1f1'} />
                            </li>
                        )}
                    </ul>
                    <IconButton
                        nameClass="tab-general-row__ic-btn icon-btn"
                        type="button"
                        icon="plus_gr.svg"
                        disabled={disabledElem}
                        onClick={() => setStatePopup(true)}
                    />
                    {statePopup
                        ? createPortal(
                              <UsersPopupWindow
                                  additClass="add_user"
                                  overlay={true}
                                  statePopup={statePopup}
                                  setStatePopup={setStatePopup}
                                  selectUser={onSelectManager}
                              />,
                              document.getElementById('portal')
                          )
                        : null}
                </div>
            </div>
        </div>
    );
}

// Блок "Участники"
function Participants(props) {
    const { additClass, presetValue, participantsError, disabledElem, onClick } = props;

    const [statePopup, setStatePopup] = useState(false);
    const [participants, setParticipants] = useState(presetValue && presetValue.length !== 0 ? presetValue : []);

    const listParticipants = [...participants];
    let participant;

    function onSelectParticipant(participantVal) {
        let { id, ...other } = participantVal;
        participant = { participantId: id, ...other };

        listParticipants.push(participant);
        setParticipants(getUniqueData([...participants, participant], { key: 'participantId', uniqueness: null }));
        onClick(additClass, [...participants, participant]);
    }

    function onDeleteUser(index) {
        listParticipants.splice(index, 1);
        setParticipants([...listParticipants]);
        onClick(additClass, [...listParticipants]);
    }

    return (
        <div className="tab-general-row-wrapper" data-error={participantsError ? participantsError.message : null}>
            <div className="tab-general-row__participants tab-general-row">
                <h2 className="tab-general-row__title">Участники</h2>
                <div className="tab-general__participants tab-general-row-item">
                    <ul className="tab-general-row-item__participants">
                        {participants && participants.length !== 0 ? (
                            participants.map((participant, index) => (
                                <li
                                    key={index}
                                    className="tab-general-row-item__participant tab-general-row-item__user"
                                    onClick={null}
                                >
                                    {participant?.fullName}
                                    <IconButton
                                        nameClass="tab-general-row__ic-btn icon-btn"
                                        type="button"
                                        icon="cancel_bl.svg"
                                        disabled={disabledElem}
                                        onClick={() => onDeleteUser(index)}
                                    />
                                </li>
                            ))
                        ) : (
                            <li>
                                <BgFillText type="p" text="Добавить" bgColor="#f1f1f1" />
                            </li>
                        )}
                        <li>
                            <IconButton
                                nameClass="tab-general-row__ic-btn icon-btn"
                                type="button"
                                icon="plus_gr.svg"
                                disabled={disabledElem}
                                onClick={() => setStatePopup(true)}
                            />
                        </li>
                    </ul>
                    {statePopup
                        ? createPortal(
                              <UsersPopupWindow
                                  additClass="add_user"
                                  overlay={true}
                                  statePopup={statePopup}
                                  setStatePopup={setStatePopup}
                                  selectUser={onSelectParticipant}
                              />,
                              document.getElementById('portal')
                          )
                        : null}
                </div>
            </div>
        </div>
    );
}

// Блок "Компания"
function Company(props) {
    const { additClass, presetValue, companyError, disabledElem, onChange } = props;
    const [company, setCompany] = useState(presetValue ? presetValue : '');

    function onChangeCompany(e) {
        // company = event.target.value;
        setCompany(e.target.value);
        onChange(e);
    }

    return (
        <div className="tab-general-row-wrapper" data-error={companyError ? companyError.message : null}>
            <div className="tab-general-row__company tab-general-row">
                <h2 className="tab-general-row__title">Компания</h2>
                <div className="tab-general__company tab-general-row-field">
                    <input
                        className="tab-general-row__input"
                        name="company"
                        type="text"
                        value={company}
                        disabled={disabledElem}
                        onChange={e => onChangeCompany(e)}
                    />
                </div>
            </div>
        </div>
    );
}

// Блок "Адрес объекта"
function AddressObject(props) {
    const { presetValue, addressObjError, disabledElem, onChange } = props;
    const [addressObject, setAddressObject] = useState(presetValue ? presetValue : '');

    function onChangeAddress(e) {
        setAddressObject(e.target.value);
        onChange(e);
    }

    function onCopyToClipboard() {
        if (!navigator.clipboard) return;
        navigator.clipboard.writeText(addressObject);
    }

    return (
        <div className="tab-general-row-wrapper" data-error={addressObjError ? addressObjError.message : null}>
            <div className="tab-general-row__address tab-general-row">
                <h2 className="tab-general-row__title">Адрес объекта</h2>
                <div className="tab-general__address tab-general-row-field">
                    <input
                        className="tab-general-row__input"
                        name="address"
                        type="text"
                        value={addressObject}
                        disabled={disabledElem}
                        onChange={e => onChangeAddress(e)}
                    />
                    <IconButton
                        nameClass="tab-general-row__ic-btn icon-btn"
                        type="button"
                        icon="copy.svg"
                        onClick={onCopyToClipboard}
                    />
                </div>
            </div>
        </div>
    );
}

// Блок "Путь к папке"
function PathFolder(props) {
    const { presetValue, pathFolderError, disabledElem, onChange } = props;
    const [pathToFolder, setPathToFolder] = useState(presetValue ? presetValue : '');

    function onChangePathFolder(e) {
        setPathToFolder(e.target.value);
        onChange(e);
    }

    function onCopyToClipboard() {
        if (!navigator.clipboard) return;
        navigator.clipboard.writeText(pathToFolder);
    }

    return (
        <div className="tab-general-row-wrapper" data-error={pathFolderError ? pathFolderError.message : null}>
            <div className="tab-general-row__path tab-general-row">
                <h2 className="tab-general-row__title">Путь к папке</h2>
                <div className="tab-general__path tab-general-row-field">
                    <input
                        className="tab-general-row__input"
                        name="pathToFolder"
                        type="text"
                        value={pathToFolder}
                        disabled={disabledElem}
                        onChange={e => onChangePathFolder(e)}
                    />
                    <IconButton
                        nameClass="tab-general-row__ic-btn icon-btn"
                        type="button"
                        icon="copy.svg"
                        onClick={onCopyToClipboard}
                    />
                </div>
            </div>
        </div>
    );
}

// Блок "Поставлена"
function DateOfStart(props) {
    const { presetValue, dateCreationError, disabledElem, onClick } = props;
    let dateYYYYMMDD;

    const [calendarState, setCalendarState] = useState(false);
    const [dateOfStart, setDateOfStart] = useState(presetValue ? presetValue : '');

    function onChangeDateOfStart(e) {
        setDateOfStart(e.target.value);
        onClick('dateCreation', e.target.value);
    }

    function onSelectDateOfStart(date) {
        dateYYYYMMDD = getDateInSpecificFormat(new Date(date.getFullYear(), date.getMonth(), date.getDate()), {
            format: 'YYYYMMDD',
            separator: '-'
        });
        setDateOfStart(dateYYYYMMDD);
        onClick('dateCreation', dateYYYYMMDD);
    }

    // function onDeleteSelectedDate() {
    //     setDateOfStart(dateDDMMYY);
    //     onClick('dateOfStart', null);
    // }

    return (
        <div className="tab-general-row-wrapper" data-error={dateCreationError ? dateCreationError.message : null}>
            <div className="tab-general-row__creation tab-general-row">
                <h2 className="tab-general-row__title">Поставлена</h2>
                <div className="tab-general__creation tab-general-row-field">
                    <input
                        className="tab-general-row__input"
                        type="text"
                        value={dateOfStart}
                        disabled={disabledElem}
                        onChange={onChangeDateOfStart}
                    />
                    <IconButton
                        nameClass="tab-general-row__ic-btn icon-btn"
                        type="button"
                        icon="calendar.svg"
                        disabled={disabledElem}
                        onClick={() => setCalendarState(true)}
                    />
                    {calendarState && (
                        <CalendarWindow
                            additClass="tab-general-calendar"
                            stateCalendar={calendarState}
                            setStateCalendar={setCalendarState}
                            onClickDate={onSelectDateOfStart}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

// Блок "Номер договора"
function ContractNum(props) {
    const { presetValue, contractNumError, disabledElem, onChange } = props;
    const [contractNum, setContractNum] = useState(presetValue ? presetValue : '');

    function onChangeContract(e) {
        setContractNum(e.target.value);
        onChange(e);
    }

    return (
        <div className="tab-general-row-wrapper" data-error={contractNumError ? contractNumError.message : null}>
            <div className="tab-general-row__contract tab-general-row">
                <h2 className="tab-general-row__title">Номер договора</h2>
                <div className="tab-general__contract tab-general-row-field">
                    <input
                        className="tab-general-row__input"
                        name="contractNum"
                        type="text"
                        value={contractNum}
                        disabled={disabledElem}
                        onChange={e => onChangeContract(e)}
                    />
                </div>
            </div>
        </div>
    );
}

// Контакт
function Contact(props) {
    const { contact, indContact, contactsInfo, contactError, disabledElem, onDeleteContact, onChangeByInd } = props;

    const [contactState, setContactState] = useState(false);
    const [contactData, setContactData] = useState({ fullName: '', post: '', phone: '', email: '' });

    function onCopyToClipboard(value) {
        if (!navigator.clipboard) return;
        navigator.clipboard.writeText(value);
    }

    return (
        <ul className="tab-general-row-list__contact tab-general-row-list">
            {contactsInfo.map((item, ind) => (
                <li
                    className="tab-general-row-wrapper"
                    data-error={
                        contactError ? contactError && contactError[item.key] && contactError[item.key].message : null
                    }
                >
                    <div key={ind} className="tab-general-row">
                        <h2
                            className={classNames('tab-general-row__title', {
                                'tab-general-row__title_fio': item.value === 'ФИО'
                            })}
                        >
                            {item.value}
                            {item.value === 'ФИО' ? (
                                <IconButton
                                    nameClass="tab-general-row__ic-btn icon-btn"
                                    type="button"
                                    icon={contactState ? 'star_or.svg' : 'star_gr.svg'}
                                    disabled={disabledElem}
                                    onClick={() => setContactState(true)}
                                />
                            ) : null}
                        </h2>
                        <div className="tab-general-row-field">
                            <input
                                className="tab-general-row__input"
                                type="text"
                                name={item.key}
                                value={contact[item.key]}
                                disabled={disabledElem}
                                onChange={e =>
                                    TabGeneralService.changeContactData(
                                        item.key,
                                        e,
                                        indContact,
                                        contactData,
                                        setContactData,
                                        onChangeByInd
                                    )
                                }
                            />
                            {item.copyStatus && (
                                <IconButton
                                    nameClass="tab-general-row__ic-btn icon-btn"
                                    type="button"
                                    icon="copy.svg"
                                    disabled={disabledElem}
                                    onClick={() => onCopyToClipboard(contactData[item.key])}
                                />
                            )}
                        </div>
                    </div>
                </li>
            ))}
            <li key={String('btnDelContact') + indContact} className="tab-general-row__delete-contact tab-general-row">
                <span></span>
                <IconButton
                    nameClass="tab-general-row__ic-btn icon-btn"
                    type="button"
                    text="Удалить контакт"
                    icon="cancel.svg"
                    disabled={disabledElem}
                    onClick={() => {
                        onDeleteContact(indContact);
                    }}
                />
            </li>
        </ul>
    );
}

// Контакты
function Contacts(props) {
    const { additClass, presetValue, contactsError, disabledElem, onClick, onChangeByInd } = props;
    // console.log(`contacts: ${JSON.stringify(presetValue, null, 4)}`);

    const [contacts, setContacts] = useState(presetValue && presetValue.length !== 0 ? presetValue : []);
    // const [contactsData, setContactsData] = useState([]);
    const [indexContact, setIndexContact] = useState(-1);

    const contactData = { fullName: '', post: '', phone: '', email: '' };

    // Добавление контакта
    function onAddContact() {
        setIndexContact(indexContact => indexContact + 1);
        setContacts(prevState => [...prevState, contactData]);
        onClick(additClass, [...contacts, contactData]);
    }

    // Удаление контакта
    function onDeleteContact(index) {
        // console.log(`index del contact = ${index}`);
        let arrData = contacts.filter((_, indData) => {
            return indData !== index;
        });
        setContacts([...arrData]);
        onClick(additClass, arrData);
    }

    return (
        <>
            {contacts && contacts.length !== 0
                ? contacts.map((item, index) => {
                      return (
                          <Contact
                              key={item}
                              contact={item}
                              indContact={index}
                              contactsInfo={TabGeneralService.getOptions('contacts')}
                              contactError={contactsError && contactsError?.length !== 0 ? contactsError[index] : null}
                              disabledElem={disabledElem}
                              onDeleteContact={onDeleteContact}
                              onChangeByInd={onChangeByInd}
                          />
                      );
                  })
                : null}
            <div
                className="tab-general-row-wrapper"
                data-error={
                    contactsError && contactsError.length !== 0 && contactsError[0] ? contactsError[0].message : null
                }
            >
                <div className="tab-general-row__contacts tab-general-row">
                    <span></span>
                    <IconButton
                        // nameClass={classNames(`icon-btn__add-contact`, 'icon-btn')}
                        nameClass="ic-btn__add-contact tab-general-row__ic-btn icon-btn"
                        type="button"
                        text="Добавить контакт"
                        icon="plus_gr.svg"
                        disabled={disabledElem}
                        onClick={onAddContact}
                    />
                </div>
            </div>
        </>
    );
}

// Левый столбец
function LeftColTab(props) {
    const { presetValues, dataOperation, errors, onClick, onChange, onChangeByInd } = props;
    const [colorCard, setColorCard] = useState('#69AABE');

    // console.log(`presetValues: ${JSON.stringify(presetValues, null, 4)}`);

    return (
        <div className="tab-general__left tab-general__column">
            {/* <div className="color_card" style={{ backgroundColor: colorCard }}></div> */}
            <span className="tab-general__color" style={{ backgroundColor: colorCard }}></span>
            <div className="tab-general__left-rows tab-general-rows">
                <HeaderLeftCol
                    additClass="header_left_col"
                    presetValue={{
                        contractNum: presetValues?.contractNum,
                        condition: presetValues?.stage,
                        imgBuilding: presetValues?.imgBuilding
                    }}
                    dataOperation={dataOperation}
                    error={errors.condition}
                    onClick={onClick}
                    onSelectColor={setColorCard}
                />
                <Manager
                    additClass="manager"
                    presetValue={presetValues?.manager}
                    managerError={errors?.manager}
                    disabledElem={dataOperation?.disabledFields?.manager}
                    onClick={onClick}
                />
                <Responsible
                    additClass="responsible"
                    presetValue={presetValues?.responsible}
                    responsibleError={errors?.responsible}
                    disabledElem={dataOperation?.disabledFields?.responsible}
                    onClick={onClick}
                />
                <Participants
                    additClass="participants"
                    presetValue={presetValues?.participants}
                    participantsError={errors?.participants}
                    disabledElem={dataOperation?.disabledFields?.participants}
                    onClick={onClick}
                />
                <Company
                    additClass="company"
                    presetValue={presetValues?.company}
                    companyError={errors?.company}
                    disabledElem={dataOperation?.disabledFields?.company}
                    onChange={onChange}
                />
                <AddressObject
                    additClass="address_object"
                    presetValue={presetValues?.address}
                    addressObjError={errors?.address}
                    disabledElem={dataOperation?.disabledFields?.address}
                    onChange={onChange}
                />
                <PathFolder
                    additClass="path_folder"
                    presetValue={presetValues?.pathToFolder}
                    pathFolderError={errors?.pathToFolder}
                    disabledElem={dataOperation?.disabledFields?.pathToFolder}
                    onChange={onChange}
                />
                <DateOfStart
                    additClass="date_creation"
                    presetValue={presetValues?.dateOfStart?.value}
                    // dateOfStartError={errors?.dateOfStart}
                    dateCreationError={errors?.dateCreation}
                    disabledElem={dataOperation?.disabledFields?.dateOfStart}
                    onClick={onClick}
                />
                <ContractNum
                    additClass="contract_num"
                    presetValue={presetValues?.contractNum}
                    contractNumError={errors?.contractNum}
                    disabledElem={dataOperation?.disabledFields?.contractNum}
                    onChange={onChange}
                />
                <Deadlines
                    additClass="deadlines"
                    presetValue={{
                        beginDeadline: presetValues?.dateOfStart?.value,
                        endDeadline: presetValues?.dateOfEnding?.value
                    }}
                    deadlinesError={{ dateOfStartError: errors?.dateOfStart, dateOfEndingError: errors?.dateOfEnding }}
                    dataOperation={dataOperation}
                    onClick={onClick}
                />
                <Service
                    additClass="services"
                    presetValue={presetValues?.services[0]}
                    serviceError={errors?.services}
                    disabledElem={dataOperation?.disabledFields?.services}
                    onClick={onClick}
                />
                <Comment additClass="comment" presetValue={presetValues?.comment} onChange={onChange} />
                <Contacts
                    additClass="contacts"
                    presetValue={presetValues?.contacts}
                    contactsError={errors?.contacts}
                    disabledElem={dataOperation?.disabledFields?.contacts}
                    onClick={onClick}
                    onChangeByInd={onChangeByInd}
                />
            </div>
        </div>
    );
}

function Deadline(props) {
    const { title, keyValidation, presetValue, disabledElem, deadlineError, onClick } = props;
    let dateYYYYMMDD;

    const [calendarState, setCalendarState] = useState(false);
    const [date, setDate] = useState(
        presetValue && Object.keys(presetValue).length !== 0 && presetValue?.value ? presetValue?.value : null
    );

    function onSelectDate(date) {
        dateYYYYMMDD = getDateInSpecificFormat(new Date(date.getFullYear(), date.getMonth(), date.getDate()), {
            format: 'YYYYMMDD',
            separator: '-'
        });
        setDate(dateYYYYMMDD);
        onClick(keyValidation, dateYYYYMMDD);
    }

    return (
        <li className="tab-general-row__list-item">
            <h3 className="tab-general-row__subtitle">{title}</h3>
            <div
                className="tab-general-row__wrapper tab-general-row-date"
                data-error={deadlineError && Object.keys(deadlineError).length !== 0 ? deadlineError.message : null}
            >
                <input
                    className="tab-general-row__deadline"
                    type="text"
                    value={date || '__ . __ . __'}
                    disabled={disabledElem}
                />
                <IconButton
                    nameClass="tab-general-row__ic-btn icon-btn"
                    type="button"
                    icon="calendar.svg"
                    disabled={disabledElem}
                    onClick={() => setCalendarState(true)}
                />
                {calendarState ? (
                    <CalendarWindow
                        additClass="tab-general-calendar"
                        stateCalendar={calendarState}
                        setStateCalendar={setCalendarState}
                        onClickDate={onSelectDate}
                    />
                ) : null}
            </div>
        </li>
    );
}

// Блок "Сроки"
function Deadlines(props) {
    const { presetValue, deadlinesError, dataOperation, onClick } = props;

    return (
        <div
            className="tab-general-row-wrapper__deadlines tab-general-row-wrapper"
            // data-error={deadlinesError ? deadlinesError.message : null}
        >
            <div className="tab-general-row__deadlines tab-general-row">
                <h2 className="tab-general-row__title">Сроки общие</h2>
                <ul className="tab-general-row__list">
                    <Deadline
                        title="с"
                        keyValidation="dateOfStart"
                        presetValue={presetValue}
                        disabledElem={dataOperation?.disabledFields?.dateOfStart}
                        deadlineError={deadlinesError?.dateOfStartError}
                        onClick={onClick}
                    />
                    <Deadline
                        title="по"
                        keyValidation="dateOfEnding"
                        presetValue={presetValue}
                        disabledElem={dataOperation?.disabledFields?.dateOfEnding}
                        deadlineError={deadlinesError?.dateOfEndingError}
                        onClick={onClick}
                    />
                </ul>
            </div>
        </div>
    );
}

// Блок "Услуга"
function Service(props) {
    const { additClass, presetValue, serviceError, disabledElem, onClick } = props;
    const [services, setServices] = useState(presetValue ? presetValue[0] : {});

    console.log(`presetValue: ${JSON.stringify(presetValue, null, 4)}`);

    function onAddService(value) {
        setServices(value);
        onClick('services', value);
    }

    // function onAddService(value) {
    //     setServices([...services, value]);
    //     onClick('services', [...services, value]);
    // }

    function onDeleteService(e, index) {
        e.preventDefault();
        const tempServices = [...services];
        tempServices.splice(index, 1);
        setServices(tempServices);
    }

    return (
        <div className="tab-general-row__service tab-general-row">
            <h2 className="tab-general-row__title">Услуга</h2>
            <div className="tab-general-row__wrapper">
                <DropdownMenu
                    additClass={additClass}
                    icon="arrow_down_sm.svg"
                    keyMenu="services"
                    nameMenu="Выбрать услугу"
                    option={true}
                    disabledElem={disabledElem}
                    specifiedVal={presetValue}
                    onItemClick={onAddService}
                />
            </div>
        </div>
    );
}

// Блок "Комментарий"
function Comment(props) {
    const { additClass, presetValue, onChange } = props;

    return (
        <div className="tab-general-row__comment tab-general-row">
            <h2 className="tab-general-row__title">Комментарий</h2>
            <textarea
                className="tab-general-row__txt-area"
                name={additClass}
                value={presetValue}
                onChange={e => onChange(e)}
            />
        </div>
    );
}

function MattermostIntegration({ channelId }) {
    return (
        <div className="tab-general__mattermost tab-general__column">
            <iframe
                title="Mattermost"
                src={`https://mm-mpk.ru/mosproektkompleks/channels/${channelId}`}
                style={{ width: '100%', height: '100%', border: 'none' }}
            ></iframe>
        </div>
    );
}

export default function TabGeneral() {
    const { data, dataOperation } = useOutletContext();
    let resultData;

    const { values, onClick, onChange, onСhangeByIndex, checkData, errorsInfo } = useGeneralForm(
        TabGeneralService.getGeneralData(data, dataOperation?.disabledFields),
        dataOperation?.disabledFields
    );
    const navigate = useNavigate();

    console.log(
        `TabGeneral data: ${JSON.stringify(data, null, 4)}\ndataOperation: ${JSON.stringify(dataOperation, null, 4)}`
    );

    // getGeneralDataNew(cardData, dataOperation?.disabledFields);

    function onOnSubmitData(e) {
        e.preventDefault();
        if (checkData()) {
            if (data && Object.keys(data).length !== 0) {
                // Логика для обновления данных
                resultData = { contractId: data?.id, ...values };
                if (resultData && Object.keys(resultData).length !== 0) {
                    axios.post(`${window.location.origin}/api/corParticipants`, resultData).then(response => {
                        if (response && response?.status === 200) navigate('../../department');
                    });
                }
            } else {
                // Логика для создания новых данных
                alert(`data for submit: ${JSON.stringify(values, null, 4)}`);
            }
            navigate('../../department');
        }
    }

    return (
        <form id="general_form" className="tab-general section__tab" onSubmit={e => onOnSubmitData(e)}>
            <LeftColTab
                additClass="left"
                presetValues={data}
                dataOperation={dataOperation}
                errors={errorsInfo}
                onClick={onClick}
                onChange={onChange}
                onChangeByInd={onСhangeByIndex}
            />
            <MattermostIntegration channelId={data?.channelId} />
        </form>
    );
}
