import { useEffect, useState, startTransition } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import DatePicker, { registerLocale } from 'react-datepicker';
import { parse, format } from 'date-fns';
import { ru } from 'date-fns/locale';
import Cookies from 'js-cookie';
import classNames from 'classnames';

// Импорт компонетов
import BgFillText from '@generic/elements/text/BgFillText';
import IconButton from '@generic/elements/buttons/IcButton';
import DropdownMenu from '@generic/elements/dropdown_menu/DropdownMenu';

import CalendarWindow from '@generic/elements/calendar/CalendarWindow';
import UsersPopupWindow from '@generic/elements/popup/UsersPopupWindow';
import InputDataPopup from '@generic/elements/popup/InputDataPopup';

// Импорт кастомных хуков
import { useTimeCosts } from '@hooks/useTimeCosts';

// Импорт сервисов
import PopupTimeCostsService from '@services/popups/popup_timecosts.service';
import TaskService from '@services/popups/popup_task.service';

// Импорт доп.функционала
import { getKeyByValue } from '@helpers/helper';
import { getDateInSpecificFormat } from '@helpers/calendar';

// Импорт стилей
import './timecosts_popup.css';
import 'react-datepicker/dist/react-datepicker.css';

registerLocale('ru', ru);

// Задача
function Task({ taskConf, onSelect }) {
    const { allTasks, task } = taskConf;

    return (
        <li className="popup__content-taskname popup-content-item">
            <h2 className="popup-content-title">Задача</h2>
            <div className="popup__menu-wrapper">{task?.title}</div>
        </li>
    );
}

// Дата
function DateReport({ presetValue, onSelect }) {
    const [calendarState, setCalendarState] = useState(false);
    const [dateReport, setDateReport] = useState(null);

    function onShowCalendar() {
        setCalendarState(true);
    }

    // Удаление даты
    function onDeleteDate() {
        setDateReport('');
        onSelect('dateReport', '');
    }

    // Выбор даты
    function onSelectDateReport(date) {
        const dateYYYYMMDD = getDateInSpecificFormat(new Date(date.getFullYear(), date.getMonth(), date.getDate()), {
            format: 'YYYYMMDD',
            separator: '-'
        });
        setDateReport(dateYYYYMMDD);
        onSelect('dateReport', dateYYYYMMDD);
    }

    useEffect(() => {
        const currDateYYYYMMDD = getDateInSpecificFormat(new Date(), {
            format: 'YYYYMMDD',
            separator: '-'
        });

        setDateReport(presetValue ?? currDateYYYYMMDD);
        onSelect('dateReport', presetValue ?? currDateYYYYMMDD);
    }, []);

    return (
        <li className="popup__content-datereport popup-content-item">
            <h2 className="popup-content-title">Дата</h2>
            <div className="popup__date-wrapper">
                <div className="popup__datereport popup-task-date">
                    <input
                        className="popup-task-date-input"
                        type="text"
                        value={dateReport}
                        disabled={true}
                        onChange={null}
                    />
                    <IconButton
                        nameClass="popup-task-date-ic-btn icon-btn"
                        type="button"
                        icon="calendar.svg"
                        onClick={onShowCalendar}
                    />
                    {calendarState
                        ? createPortal(
                              <CalendarWindow
                                  additClass="task-calendar"
                                  stateCalendar={calendarState}
                                  setStateCalendar={setCalendarState}
                                  onClickDate={onSelectDateReport}
                              />,
                              document.getElementById('portal')
                          )
                        : null}
                </div>
                {dateReport ? (
                    <IconButton
                        nameClass="icon-btn__delete-date-start icon-btn__delete-date"
                        type="button"
                        icon="cancel.svg"
                        onClick={onDeleteDate}
                    />
                ) : null}
            </div>
        </li>
    );
}

// Сотрудник
function Employee(props) {
    // console.log(`Director presetValue: ${JSON.stringify(presetValue, null, 4)}`);
    const { presetValue, config, onSelect } = props;
    const { navigate, addToHistory, appTheme } = config;

    const [statePopup, setStatePopup] = useState(false);
    const [employee, setEmployee] = useState(null);

    // Загрузка постановщика по умолчанию
    async function fetchDefaultEmployee() {
        const employee = await TaskService.getAuthorizedEmployee(Cookies.get('MMUSERID'));
        setEmployee(employee);
        onSelect('employee', employee);
    }

    // function onShowPopup() {
    //     setStatePopup(true);
    // }

    // Выбор пользователя
    // function onSelectEmployee(user) {
    //     setEmployee(user);
    //     onSelect('employee', user);
    // }

    // Удаление пользователя
    // function onDeleteEmployee() {
    //     setEmployee(null);
    //     onSelect('employee', null);
    // }

    // Переход к профилю пользователя
    function onClickUser() {
        startTransition(() => {
            addToHistory(`${window.location.pathname}`);
            navigate(`../../user/${employee?.mmId}/profile/profile/`, {
                state: { idEmployee: employee?.mmId, path: `${window.location.pathname}` }
            });
        });
    }

    useEffect(() => {
        if (!employee || Object.keys(employee).length === 0) fetchDefaultEmployee();
        else {
            setEmployee(presetValue);
            onSelect('employee', presetValue);
        }
    }, []);

    return (
        <li className="popup__content-employee popup-content-item">
            <h2 className="popup-content-title">Сотрудник</h2>
            <div className="popup__user-inner" onClick={onClickUser}>
                {employee && Object.keys(employee).length !== 0 ? (
                    <BgFillText
                        type="p"
                        text={employee.fullName}
                        bgColor={appTheme === 'dark' ? '#4c4c4e' : '#f1f1f1'}
                    />
                ) : null}
            </div>
        </li>
    );
}

// Потраченное время
function SpentTime(props) {
    const { presetValue, onSelect, onChange } = props;

    const [spentTime, setSpentTime] = useState(null);

    // Изменить потраченное время
    function onChangeSpentTime(e) {
        setSpentTime(e.target.value);
        onChange(e);
    }

    // Выбор времени в формате чч:мм
    function onSelectSpentTime(value) {
        setSpentTime(value);
        onSelect('spent', value);
    }

    // Удаление
    function onDeleteDate() {
        setSpentTime(null);
        onChange('spent', null);
    }

    useEffect(() => {
        setSpentTime(presetValue ?? '00:00');
        onSelect('spent', presetValue ?? '00:00');
    }, []);

    return (
        <li className="popup__content-spenttime popup-content-item">
            <h2 className="popup-content-title">Потраченное время</h2>
            <div className="popup__date-wrapper">
                <DatePicker
                    className="spenttime-datepicker"
                    locale="ru"
                    selected={parse(spentTime ? spentTime : presetValue ? presetValue : '00:00', 'HH:mm', new Date())}
                    onChange={date => onSelectSpentTime(format(date, 'HH:mm'))}
                    showTimeSelect
                    showTimeSelectOnly
                    timeIntervals={5}
                    timeCaption="Время"
                    dateFormat="HH:mm"
                />
            </div>
        </li>
    );
}

// Время в часах
function TimeHours({ spentTime }) {
    const [timeHours, setTimeHours] = useState(null);

    useEffect(() => {
        const timeHoursData = parse(spentTime ?? '00:00', 'HH:mm', new Date());
        setTimeHours(Number((timeHoursData?.getHours() * 60 + timeHoursData?.getMinutes()) / 60).toFixed(2));
    }, [spentTime]);

    return (
        <div className="popup__content-timehours popup-content-item">
            <h2 className="popup-content-title">Время в часах</h2>
            <div className="popup__date-wrapper">
                <div className="popup__datereport popup-task-date">
                    <input className="popup-task-date-input" type="text" value={timeHours} disabled={true} />
                </div>
            </div>
        </div>
    );
}

// Комментарий
function Comment({ presetValue, onSelect, onChange }) {
    const [report, setReport] = useState(null);

    function onChangeReport(e) {
        setReport(e.target.value);
        onChange(e);
    }

    useEffect(() => {
        setReport(presetValue ?? '');
        onSelect('report', presetValue ?? '');
    }, []);

    return (
        <div className="popup__content-comment popup-content-item">
            <h2 className="popup-content-title">Комментарий</h2>
            <textarea className="txt-area-timecosts" name="report" value={report} onChange={onChangeReport} />
        </div>
    );
}

// Постановщик
function Director({ director, config }) {
    const { navigate, addToHistory, appTheme } = config;

    // Переход к профилю пользователя
    function onClickUser() {
        startTransition(() => {
            addToHistory(`${window.location.pathname}`);
            navigate(`../../user/${director?.mmId}/profile/profile/`, {
                state: { idEmployee: director?.mmId, path: `${window.location.pathname}` }
            });
        });
    }

    return (
        <li className="popup__content-user popup-content-item">
            <h2 className="popup-content-title">Постановщик</h2>
            <div className="popup__user-inner" onClick={onClickUser}>
                {director && Object.keys(director).length !== 0 ? (
                    <BgFillText
                        type="p"
                        text={director?.fullName ?? 'Нет данных'}
                        bgColor={appTheme === 'dark' ? '#4c4c4e' : '#f1f1f1'}
                    />
                ) : null}
            </div>
        </li>
    );
}

// Исполнитель
function Executor({ executor, config }) {
    const { navigate, addToHistory, appTheme } = config;

    // Переход к профилю пользователя
    function onClickUser() {
        startTransition(() => {
            addToHistory(`${window.location.pathname}`);
            navigate(`../../user/${executor?.mmId}/profile/profile/`, {
                state: { idEmployee: executor?.mmId, path: `${window.location.pathname}` }
            });
        });
    }

    return (
        <li className="popup__content-user popup-content-item">
            <h2 className="popup-content-title">Исполнитель</h2>
            <div className="popup__user-inner" onClick={onClickUser}>
                {executor && Object.keys(executor).length !== 0 ? (
                    <BgFillText
                        type="p"
                        text={executor?.fullName ?? 'Нет данных'}
                        bgColor={appTheme === 'dark' ? '#4c4c4e' : '#f1f1f1'}
                    />
                ) : null}
            </div>
        </li>
    );
}

// Договор
function ContractNum({ contract }) {
    const [isLoading] = useState(false);
    const [contractNum, setContractNum] = useState(null);

    useEffect(() => {
        if (contract?.data && Object.keys(contract?.data).length !== 0) {
            setContractNum(getKeyByValue(contract?.data, contract?.id));
        }
    }, [contract?.data]);

    return (
        <li className="popup__content-contractnum popup-content-item">
            <h2 className="popup-content-title">Номер договора</h2>
            <div className="popup__menu-wrapper">
                {contract?.data ? (
                    <div class="dropdown-menu-search">
                        <input
                            type="text"
                            class="dropdown-menu-search__input"
                            list="suggestions"
                            placeholder="Выбрать номер договора"
                            value={contractNum}
                            disabled={true}
                        />
                    </div>
                ) : null}
            </div>
        </li>
    );
}

export default function TimeCostsPopup(props) {
    const { data, config, popupConf } = props;
    const { immutableVals, timeCostData } = data;
    // const { navigate, addToHistory, appTheme } = config;
    const { additClass, title, operation, popupState, setPopupState, refreshTaskData } = popupConf;
    const { allTasks, task } = immutableVals;

    const { disabledFields } = PopupTimeCostsService.getDataFormOperation(operation);

    const { values, onChange, onClick } = useTimeCosts(
        PopupTimeCostsService.getTimeCostData(timeCostData, disabledFields),
        disabledFields
    );

    // console.log(`TimeCostsPopup data: ${JSON.stringify(data, null, 4)}`);
    // console.log(`operation: ${operation}\nTimeCostsPopup task: ${JSON.stringify(task, null, 4)}`);
    // console.log(`TimeCostsPopup values: ${JSON.stringify(values, null, 4)}`);

    // Удаление времязатрат
    async function onDeleteTimeCost() {
        if (timeCostData && Object.keys(timeCostData).length !== 0) {
            await PopupTimeCostsService.deleteTimeCost(timeCostData?.id);
            setPopupState(false);
            // После удаления данных обновляем таблицу времязатрат
            refreshTaskData();
        }
    }

    // Отправка данных
    async function onOnSubmitData(e) {
        e.preventDefault();
        e.stopPropagation();

        if (operation === 'creation') {
            const resultData = {
                idMM: values?.employee?.mmId ?? null,
                taskId: values?.task?.id ?? null,
                dataReport: values?.dateReport ?? null,
                report: values?.report ?? null,
                spent: values?.spent ?? null
            };

            await PopupTimeCostsService.addTimeCost(resultData);
        }

        // Редактирование времязатрат
        if (operation === 'update') {
            const resultData = {
                Id: timeCostData?.id,
                dataReport: values?.dateReport ?? null,
                report: values?.report ?? null,
                spent: values?.spent ?? null
            };

            await PopupTimeCostsService.editTimeCost(resultData);
        }

        setPopupState(false);

        // После добавления или редактирования данных обновляем таблицу времязатрат
        refreshTaskData();
    }

    return (
        <>
            <div id="portal"></div>
            <InputDataPopup
                idForm="timecosts-form"
                title={title}
                additClass={additClass}
                overlay={true}
                statePopup={popupState}
                setStatePopup={setPopupState}
                modalWindowConf={{
                    type: 'confirm',
                    title: 'Вы действительно хотите удалить данные?'
                }}
                onDelete={timeCostData?.executor?.mmId === Cookies.get('MMUSERID') ? onDeleteTimeCost : null}
            >
                <form id="timecosts-form" className="popup__timecosts-form" onSubmit={e => onOnSubmitData(e)}>
                    <div className="popup__timecosts-form-top">
                        <ul className="popup__timecosts-form-left">
                            <Task key="timecost-task-item" taskConf={{ allTasks, task }} onSelect={onClick} />
                            <DateReport
                                key="timecost-datereport-item"
                                presetValue={timeCostData?.dateReport}
                                onSelect={onClick}
                            />
                            <Employee
                                key="timecost-executor-item"
                                presetValue={timeCostData?.executor}
                                config={config}
                                onSelect={onClick}
                            />
                            <SpentTime
                                key="timecost-spent-item"
                                presetValue={timeCostData?.spent}
                                onSelect={onClick}
                                onChange={onChange}
                            />
                        </ul>
                        <ul className="popup__timecosts-form-right">
                            <ContractNum key="timecost-contractnum-item" contract={task?.contract} />
                            <Director key="timecost-director-item" director={task?.director} config={config} />
                            <Executor key="timecost-executor-item" executor={task?.executor} config={config} />
                            <TimeHours key="timecost-timehours-item" spentTime={values?.spent} />
                        </ul>
                    </div>
                    <div className="popup__timecosts-form-bottom">
                        <Comment
                            key="timecost-report-item"
                            presetValue={timeCostData?.report}
                            onSelect={onClick}
                            onChange={onChange}
                        />
                    </div>
                </form>
            </InputDataPopup>
        </>
    );
}
