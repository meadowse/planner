import { useEffect, useState } from 'react';
import { useLoaderData, useOutletContext } from 'react-router-dom';

// Импорт компонентов
import ListMode from '@components/pages/data_display/display_modes/table/ListMode';

import Preloader from '../../../../../auxiliary_pages/loader/Preloader';
import IconButton from '@generic/elements/buttons/IcButton';
import DropdownMenu from '@generic/elements/dropdown_menu/DropdownMenu';
import BgFillText from '@generic/elements/text/BgFillText';

import UsersPopupWindow from '@generic/elements/popup/UsersPopupWindow';
import CalendarWindow from '@generic/elements/calendar/CalendarWindow';

// Импорт стилей
import './tab_innerproject.css';

// Название проекта
function Name({ presetValue }) {
    const [project, setProject] = useState(null);

    useEffect(() => {
        if (presetValue && Object.keys(presetValue).length > 0) setProject(presetValue?.title);
    }, []);

    return (
        <div className="tab-project-row-wrapper">
            <div className="tab-project-row__name tab-project-row">
                <h2 className="tab-project-row__title">Название</h2>
                <div className="tab-project__name tab-project-row-field">
                    <input
                        className="tab-project-row__input"
                        name="project"
                        type="text"
                        value={project}
                        // onChange={e => onChangeCompany(e)}
                    />
                </div>
            </div>
        </div>
    );
}

// Название проекта
function Stage({ presetValue }) {
    const [stage, setStage] = useState(null);

    useEffect(() => {
        if (presetValue && Object.keys(presetValue).length > 0) setStage(presetValue);
    }, []);

    return (
        <div className="tab-project-row__stage tab-project-row">
            <h2 className="tab-project-row__title">Стадия</h2>
            <p
                style={{
                    width: 'max-content',
                    padding: '5px 10px',
                    borderRadius: '5px',
                    color: '#000',
                    backgroundColor: presetValue?.color
                }}
            >
                {stage?.title}
            </p>
            {/* <BgFillText type="p" text={stage?.title} bgColor={presetValue?.color} /> */}
            {/* <DropdownMenu
                additClass="stage"
                // icon={appTheme === 'dark' ? 'arrow_down_sm_wh.svg' : 'arrow_down_sm.svg'}
                keyMenu="stages"
                nameMenu="Статус"
                disabledElem={false}
                specifiedVal={stage}
                // onItemClick={onClickItemStage}
            /> */}
        </div>
    );
}

// Ответсвенный
function Responsible({ presetValue }) {
    const [statePopup, setStatePopup] = useState(false);
    const [responsible, setResponsible] = useState(presetValue ? presetValue : {});

    return (
        <div className="tab-project-row">
            <h2 className="tab-project-row__title">Ответственный</h2>
            <div className="tab-project__employee tab-project-row-item">
                {responsible && Object.keys(responsible)?.length > 0 ? (
                    <div className="tab-project-row__employee">
                        <img src={responsible?.photo ?? '/img/user.svg'} alt="#" />
                        <p>{responsible?.fullName ?? 'Нет данных'}</p>
                    </div>
                ) : (
                    <div className="tab-project-row__employee">
                        <img src={'/img/user.svg'} alt="#" />
                        <p>{'Нет данных'}</p>
                    </div>
                )}
                {/* <IconButton
                    nameClass="tab-project-row__ic-btn icon-btn"
                    type="button"
                    icon="plus_gr.svg"
                    // disabled={disabledElem}
                    // onClick={onShowPopup}
                /> */}
                {/* {statePopup
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
                    : null} */}
            </div>
        </div>
    );
}

// Описание
function Description({ presetValue }) {
    const [description, setDescription] = useState(presetValue ?? null);

    return (
        <div className="tab-project-row__description tab-project-row">
            <h2 className="tab-project-row__title">Описание</h2>
            <textarea
                className="tab-project-row__txt-area"
                name="description"
                value={description}
                // onChange={e => onChange(e)}
            />
        </div>
    );
}

// Дата добавления
function DateAdded({ presetValue }) {
    const [date, setDate] = useState(presetValue?.value ?? null);
    return (
        <div className="tab-project-row__dateadded tab-project-row">
            <h3 className="tab-project-row__title">Дата добавления</h3>
            <div className="tab-project-row__wrapper tab-project-row-date">
                <input className="tab-project-row__date" type="text" value={date || '__ . __ . __'} />
                <IconButton
                    nameClass="tab-project-row__ic-btn icon-btn"
                    type="button"
                    icon="calendar.svg"
                    // onClick={onShowCalendar}
                />
                {/* {calendarState ? (
                    <CalendarWindow
                        additClass="tab-project-calendar"
                        stateCalendar={calendarState}
                        setStateCalendar={setCalendarState}
                        onClickDate={onSelectDate}
                    />
                ) : null} */}
            </div>
        </div>
    );
}

// Дедлайн
function Deadline({ presetValue }) {
    const [date, setDate] = useState(presetValue?.value ?? null);
    return (
        <div className="tab-project-row__deadline tab-project-row">
            <h3 className="tab-project-row__title">Дедлайн</h3>
            <div
                className="tab-project-row__wrapper tab-project-row-date"
                // data-error={deadlineError && Object.keys(deadlineError).length !== 0 ? deadlineError.message : null}
            >
                <input className="tab-project-row__date" type="text" value={date || '__ . __ . __'} />
                <IconButton
                    nameClass="tab-project-row__ic-btn icon-btn"
                    type="button"
                    icon="calendar.svg"
                    // onClick={onShowCalendar}
                />
                {/* {calendarState ? (
                    <CalendarWindow
                        additClass="tab-project-calendar"
                        stateCalendar={calendarState}
                        setStateCalendar={setCalendarState}
                        onClickDate={onSelectDate}
                    />
                ) : null} */}
            </div>
        </div>
    );
}

// Путь к папке
function PathToFolder({ presetValue }) {
    const [description, setDescription] = useState(presetValue ?? null);
    return (
        <div className="tab-project-row-wrapper">
            <div className="tab-project-row__path tab-project-row">
                <h2 className="tab-project-row__title">Путь к папке</h2>
                <div className="tab-project__path tab-project-row-field">
                    <input
                        className="tab-project-row__input"
                        name="pathToFolder"
                        type="text"
                        value={description}
                        // onChange={e => onChangePathFolder(e)}
                    />
                    <IconButton
                        nameClass="tab-project-row__ic-btn icon-btn"
                        type="button"
                        icon="copy.svg"
                        // onClick={onCopyToClipboard}
                    />
                </div>
            </div>
        </div>
    );
}

function ProjectInfo({ data }) {
    console.log(`ProjectInfo: ${JSON.stringify(data, null, 4)}`);
    return (
        <div className="tab-project__main-info">
            <Name presetValue={data?.project} />
            <Stage presetValue={data?.stage} />
            <Responsible presetValue={data?.responsible} />
            <Description presetValue={data?.description} />
            <DateAdded presetValue={data?.dateAdded} />
            <Deadline presetValue={data?.lastDate} />
            <PathToFolder presetValue={data?.folderPath} />
        </div>
    );
}

export default function TabInnerProject() {
    const { uploadedData } = useLoaderData();
    const { partition, projectData } = useOutletContext();

    const [loading, setLoading] = useState(true);
    const [tasks, setTasks] = useState([]);

    useEffect(() => {
        if (uploadedData && uploadedData.length > 0) setTasks(uploadedData);
        setLoading(false);
    }, [uploadedData]);

    return (
        <div className="tab-project__main">
            <ProjectInfo data={projectData ?? []} />
            {loading ? (
                <Preloader />
            ) : (
                <ListMode
                    key={`${partition}-table-tasks`}
                    testData={tasks}
                    modeConfig={{
                        keys: ['task', 'status', 'director', 'executor', 'deadlineTask'],
                        mode: {
                            key: 'listTasksProject'
                        },
                        partition: 'projectform',
                        path: `${window.location.pathname}`,
                        dataOperations: []
                        // popupConf,
                        // idProject
                    }}
                />
            )}
        </div>
    );
}
