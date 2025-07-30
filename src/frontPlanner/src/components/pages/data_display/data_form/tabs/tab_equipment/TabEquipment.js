import { startTransition, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { createPortal } from 'react-dom';

// Импорт компонентов
import DropdownMenu from '@generic/elements/dropdown_menu/DropdownMenu';
import IconButton from '@generic/elements/buttons/IcButton';
import BgFillText from '@generic/elements/text/BgFillText';

import UsersPopupWindow from '@generic/elements/popup/UsersPopupWindow';
import CalendarWindow from '@generic/elements/calendar/CalendarWindow';

//
import { useHistoryContext } from '../../../../../../contexts/history.context';

// Импорт доп.функционала
import { getDateInSpecificFormat } from '@helpers/calendar';

// Импорт стилей
import './tab_equipment.css';

// Левый столбец
function LeftColTab() {
    const image = '/img/equipment/georadar.jpg';
    return (
        <div className="tab-equipment__left tab-equipment__column">
            {image ? (
                <img className="tab-equipment__img" src={image} alt="#" />
            ) : (
                <p className="tab-equipment__no-image">No image</p>
            )}
            <div className="tab-equipment__desc">
                <p className="tab-equipment__desc-text">
                    Lorem ipsum dolor sit amet consectetur adipisicing elit. Ullam, animi. Facere, commodi nobis
                    accusamus culpa praesentium provident molestias eligendi perferendis exercitationem dicta, magni eum
                    quia aliquid, facilis eveniet atque sapiente sed! Accusamus est facere aliquam aliquid ipsa, dolor
                    rerum consectetur adipisci illum voluptatem, ipsam, expedita ullam mollitia cumque aperiam sed!
                    Asperiores repellat eius fugiat minima vitae! Fugiat est doloremque consequuntur temporibus tenetur
                    ab quis. Fuga odit nobis quisquam possimus. Quas nihil labore iusto asperiores quae id molestiae
                    quidem, optio reprehenderit voluptate blanditiis dolores consequatur hic earum quia libero autem
                    fugiat fuga dignissimos reiciendis deleniti iste veritatis. Cupiditate incidunt ut sed quibusdam?
                    Eaque facere quia, illo placeat, rerum dolorum facilis libero blanditiis rem vero corporis eos
                    voluptates laboriosam officiis? Dolore libero incidunt quia qui. Eum corrupti necessitatibus optio
                    vero sunt illo excepturi quasi debitis quod eligendi dolore unde veritatis ea blanditiis aut, quo
                    iusto? Quo natus in eaque explicabo accusantium iusto nostrum eos, recusandae nemo molestias rerum
                    veniam ducimus consequuntur vel beatae, ab culpa sequi nobis id! Maiores totam officiis esse fuga
                    perferendis quam quasi quas sit magnam hic error excepturi, dolores sequi id ab. Vel dignissimos
                    necessitatibus, quis ipsam totam cupiditate illum tenetur eligendi accusamus ea, sed omnis nulla
                    voluptate?
                </p>
            </div>
        </div>
    );
}

// Статус
function Status({ additClass, presetValue, disabledElem }) {
    const [status, setStatus] = useState(presetValue ? presetValue : {});

    // Выбор статуса
    function onClickItemStatus(value) {
        setStatus(value);
    }

    return (
        <div className="tab-equipment-row__status tab-equipment-row">
            <h2 className="tab-equipment-row__title">Статус</h2>
            <DropdownMenu
                additClass={additClass}
                icon="arrow_down_sm.svg"
                keyMenu="statuses"
                nameMenu="Выбрать cтатус"
                disabledElem={disabledElem}
                specifiedVal={status}
                onItemClick={onClickItemStatus}
            />
        </div>
    );
}

// Дата
function DateEquipment(props) {
    const { additClass, config, presetValue, disabledElem } = props;
    let dateYYYYMMDD;

    const [calendarState, setCalendarState] = useState(false);
    const [date, setDate] = useState(presetValue ? presetValue : '');

    function onChangeDateOfStart(e) {
        setDate(e.target.value);
    }

    function onSelectDateOfStart(date) {
        dateYYYYMMDD = getDateInSpecificFormat(new Date(date.getFullYear(), date.getMonth(), date.getDate()), {
            format: 'YYYYMMDD',
            separator: '-'
        });
        setDate(dateYYYYMMDD);
    }

    // function onDeleteSelectedDate() {
    //     setDateOfStart(dateDDMMYY);
    //     onClick('dateOfStart', null);
    // }

    return (
        <div className="tab-equipment-row-wrapper" data-error={null}>
            <div className="tab-equipment-row__date tab-equipment-row">
                <h2 className="tab-equipment-row__title">{config?.title}</h2>
                <div className="tab-equipment-row-field__date tab-equipment-row-field">
                    <input
                        className="tab-equipment-row__input"
                        type="text"
                        value={date}
                        disabled
                        onChange={onChangeDateOfStart}
                    />
                    <IconButton
                        nameClass="tab-equipment-row__ic-btn icon-btn"
                        type="button"
                        icon="calendar.svg"
                        disabled={disabledElem}
                        onClick={() => setCalendarState(true)}
                    />
                    {calendarState && (
                        <CalendarWindow
                            additClass="tab-equipment-calendar"
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

// Ответственный
function Responsible(props) {
    const { presetValue, disabledElem, onClick } = props;

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
        <div className="tab-equipment-row-wrapper" data-error={null}>
            <div className="tab-equipment-row__responsible tab-equipment-row">
                <h2 className="tab-equipment-row__title">Ответственный</h2>
                <div className="tab-equipment__responsible tab-equipment-row-item">
                    {responsible && Object.keys(responsible).length !== 0 ? (
                        <div className="tab-equipment-row__user" onClick={onDeleteUser}>
                            <img className="tab-equipment-row__user-img" src="/img/user.svg" alt="#" />
                            <p className="tab-equipment-row__user-fullname">Дмитрий Тарасевич</p>
                        </div>
                    ) : (
                        <BgFillText type="p" text="Добавить" bgColor={'#f1f1f1'} />
                    )}
                    <IconButton
                        nameClass="tab-equipment-row__ic-btn icon-btn"
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

// Местоположение
function Location(props) {
    const { presetValue, disabledElem } = props;
    const [location, setLocation] = useState(presetValue ? presetValue : '');

    function onChangeLocation(e) {
        setLocation(e.target.value);
    }

    function onCopyToClipboard() {
        if (!navigator.clipboard) return;
        navigator.clipboard.writeText(location);
    }

    return (
        <>
            <div className="tab-equipment-row-wrapper" data-error={null}>
                <div className="tab-equipment-row__location tab-equipment-row">
                    <h2 className="tab-equipment-row__title">Объект</h2>
                    <div className="tab-equipment-row__location tab-equipment-row-field">
                        <input
                            className="tab-equipment-row__input"
                            name="location"
                            type="text"
                            value={location}
                            disabled={disabledElem}
                            onChange={e => onChangeLocation(e)}
                        />
                    </div>
                </div>
            </div>
            <div className="hr-line"></div>
        </>
    );
}
// Название
function EquipmentName(props) {
    const { presetValue, disabledElem } = props;
    const [equipmentName, setEquipmentName] = useState(presetValue ? presetValue : '');

    function onChangeEquipmentName(e) {
        setEquipmentName(e.target.value);
    }

    return (
        <div className="tab-equipment-row-wrapper" data-error={null}>
            <div className="tab-equipment-row__name tab-equipment-row">
                <h2 className="tab-equipment-row__title">Название</h2>
                <div className="tab-equipment-row-field__name tab-equipment-row-field">
                    <input
                        className="tab-equipment-row__input"
                        name="equipmentName"
                        type="text"
                        value={equipmentName}
                        disabled={disabledElem}
                        onChange={e => onChangeEquipmentName(e)}
                    />
                </div>
            </div>
        </div>
    );
}

// Модель
function Model(props) {
    const { presetValue, disabledElem } = props;
    const [model, setModel] = useState(presetValue ? presetValue : '');

    function onChangeModel(e) {
        setModel(e.target.value);
    }

    return (
        <div className="tab-equipment-row-wrapper" data-error={null}>
            <div className="tab-equipment-row__model tab-equipment-row">
                <h2 className="tab-equipment-row__title">Модель</h2>
                <div className="tab-equipment-row-field__model tab-equipment-row-field">
                    <input
                        className="tab-equipment-row__input"
                        name="model"
                        type="text"
                        value={model}
                        disabled={disabledElem}
                        onChange={e => onChangeModel(e)}
                    />
                </div>
            </div>
        </div>
    );
}

// Производитель
function Manufacturer(props) {
    const { presetValue, disabledElem } = props;
    const [manufacturer, setManufacturer] = useState(presetValue ? presetValue : '');

    function onChangeManufacturer(e) {
        setManufacturer(e.target.value);
    }

    return (
        <div className="tab-equipment-row-wrapper" data-error={null}>
            <div className="tab-equipment-row__manufacturer tab-equipment-row">
                <h2 className="tab-equipment-row__title">Производитель</h2>
                <div className="tab-equipment-row-field__manufacturer tab-equipment-row-field">
                    <input
                        className="tab-equipment-row__input"
                        name="manufacturer"
                        type="text"
                        value={manufacturer}
                        disabled={disabledElem}
                        onChange={e => onChangeManufacturer(e)}
                    />
                </div>
            </div>
        </div>
    );
}

// Серийный номер
function SerialNumber(props) {
    const { presetValue, disabledElem } = props;
    const [serialNumber, setSerialNumber] = useState(presetValue ? presetValue : '');

    function onChangeSerialNumber(e) {
        setSerialNumber(e.target.value);
    }

    return (
        <div className="tab-equipment-row-wrapper" data-error={null}>
            <div className="tab-equipment-row__serialnum tab-equipment-row">
                <h2 className="tab-equipment-row__title">Серийный номер</h2>
                <div className="tab-equipment-row-field__serialnum tab-equipment-row-field">
                    <input
                        className="tab-equipment-row__input"
                        name="serialnum"
                        type="text"
                        value={serialNumber}
                        disabled={disabledElem}
                        onChange={e => onChangeSerialNumber(e)}
                    />
                </div>
            </div>
        </div>
    );
}

// Стоимость
function Cost(props) {
    const { presetValue, disabledElem } = props;
    const [cost, setCost] = useState(presetValue ? presetValue : '');

    function onChangeCost(e) {
        setCost(e.target.value);
    }

    return (
        <div className="tab-equipment-row-wrapper" data-error={null}>
            <div className="tab-equipment-row__cost tab-equipment-row">
                <h2 className="tab-equipment-row__title">Стоимость</h2>
                <div className="tab-equipment-row-field__cost tab-equipment-row-field">
                    <input
                        className="tab-equipment-row__input"
                        name="serialnum"
                        type="text"
                        value={cost}
                        disabled={disabledElem}
                        onChange={e => onChangeCost(e)}
                    />
                </div>
            </div>
        </div>
    );
}

// Где приобретался
function PurchaseLink(props) {
    const { presetValue, disabledElem } = props;
    const [purchaseLink, setPurchaseLink] = useState(presetValue ? presetValue : '');

    function onChangePurchaseLink(e) {
        setPurchaseLink(e.target.value);
    }

    return (
        <>
            <div className="tab-equipment-row-wrapper" data-error={null}>
                <div className="tab-equipment-row__purchase tab-equipment-row">
                    <h2 className="tab-equipment-row__title">Где приобретался</h2>
                    <div className="tab-equipment-row-field__purchase tab-equipment-row-field">
                        <input
                            className="tab-equipment-row__input"
                            name="serialnum"
                            type="text"
                            value={purchaseLink}
                            disabled={disabledElem}
                            onChange={e => onChangePurchaseLink(e)}
                        />
                    </div>
                </div>
            </div>
            <div className="hr-line"></div>
        </>
    );
}

function MiddleLeftColTab() {
    return (
        <div className="tab-equipment__middle-left tab-equipment__column">
            {/* <h2 className="tab-equipment__header-title">Общие</h2> */}
            <h2 className="tab-equipment__column-title">Общие</h2>
            <div className="tab-equipment__middle-rows">
                <Status additClass="stage" />
                <DateEquipment config={{ title: 'Дата' }} />
                <Responsible />
                <Location />
                <EquipmentName />
                <Model />
                <Manufacturer />
                <SerialNumber />
                <Cost />
                <PurchaseLink />
                <DateEquipment config={{ title: 'Дата последней поверки' }} />
                <DateEquipment config={{ title: 'Дата следующей поверки' }} />
            </div>
        </div>
    );
}

// Блок "Комментарий"
function Comment(props) {
    const { additClass, presetValue, onChange } = props;

    return (
        <div className="tab-equipment-row__comment">
            <h2 className="tab-equipment-row__title">Комментарий</h2>
            <textarea
                className="tab-equipment-row__txt-area"
                placeholder="Место для комментария"
                name={additClass}
                value={presetValue}
                onChange={e => onChange(e)}
            />
        </div>
    );
}

function MiddleRightColTab() {
    return (
        <div className="tab-equipment__middle-right tab-equipment__column">
            <Comment />
        </div>
    );
}

// Столбец по середине
function MiddleColTab() {
    return (
        <div className="tab-equipment__middle tab-equipment__column">
            <MiddleLeftColTab />
            <MiddleRightColTab />
        </div>
    );
}

function PlanEquipment() {
    return (
        <li className="tab-equipment__right-plan">
            <BgFillText className="tab-equipment-row__status" type="p" text="Занят" bgColor="#C5D8EA" />
            <div className="tab-equipment-row">
                <h2 className="tab-equipment-row__title">Дата</h2>
                <p className="tab-equipment-row__planned-date">2025-02-24</p>
            </div>
            <div className="tab-equipment-row">
                <h2 className="tab-equipment-row__title">Ответственный</h2>
                <div className="tab-equipment-row__user">
                    <img className="tab-equipment-row__user-img" src="/img/user.svg" alt="#" />
                    <p className="tab-equipment-row__user-fullname">Дмитрий Тарасевич</p>
                </div>
            </div>
            <div className="tab-equipment-row">
                <h2 className="tab-equipment-row__title">Местоположение</h2>
                <p className="tab-equipment__location">г. Москва, ул. Коломенская, 3</p>
            </div>
            <div className="tab-equipment__hr-line"></div>
        </li>
    );
}

// Правый столбец
function RightColTab() {
    return (
        <div className="tab-equipment__right tab-equipment__column">
            {/* <h2 className="tab-equipment__header-title">Планы</h2> */}
            <h2 className="tab-equipment__column-title">Планы</h2>
            <div className="tab-equipment__right-wrapper">
                <ul className="tab-equipment__right-rows">
                    <PlanEquipment />
                    <PlanEquipment />
                    <PlanEquipment />
                    <PlanEquipment />
                    <PlanEquipment />
                </ul>
            </div>
        </div>
    );
}

export default function TabEquipment() {
    const { data } = useOutletContext();
    const navigate = useNavigate();
    const { history } = useHistoryContext();

    console.log(`TabEquipment datra: ${JSON.stringify(data, null, 4)}`);

    function onCancelAction() {
        startTransition(() => {
            // alert(`prevpath: ${config?.prevPath}`);
            // navigate(`../../${config?.prevPath}`);
            // setTimeout(() => {
            //     backToPrevPath();
            // }, 1000);

            navigate(`../../${history[history.length - 1]}`);
        });
    }

    return (
        <form id="equipment_form" className="tab-equipment section__tab" action="#">
            <LeftColTab data={{ img: data?.equipment?.image, desc: data?.equipment?.description }} />
            <MiddleColTab data={{status: data?.status, }}/>
            <RightColTab />
        </form>
    );
}

// return (
//         <form id="equipment_form" className="tab-equipment section__tab" action="#">
//             <div class="tab-equipment__header">
//                 <h2 className="tab-equipment__header-title">
//                     Георадар <span>Proceq GP 8000</span>
//                 </h2>
//                 <div class="tab-equipment__actions">
//                     <button className="icon-btn__save icon-btn" form="equipment_form">
//                         Сохранить<span>&#10003;</span>
//                     </button>
//                     <button className="icon-btn__cancel icon-btn" onClick={onCancelAction}>
//                         Отменить<span>&#10006;</span>
//                     </button>
//                 </div>
//             </div>
//             <div class="tab-equipment__content">
//                 <LeftColTab />
//                 <MiddleColTab />
//                 <RightColTab />
//             </div>
//         </form>
//     );
