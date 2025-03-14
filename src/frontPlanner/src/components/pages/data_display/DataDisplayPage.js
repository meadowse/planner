import { useState, useEffect, Suspense, lazy } from 'react';
import { Routes, Route, Await, useOutletContext, useNavigate, useLoaderData } from 'react-router-dom';
import classNames from 'classnames';

// Импорт компонетов
import Preloader from '@components/auxiliary_pages/loader/Preloader';

// Импорт сервисов
import DataDisplayService from '@services/data_display.service';

// Импорт вспомогательных функций
import { extractSampleData, simplifyData } from '@helpers/helper';

// Импорт стилей
import './data_display_page.css';

const KanbanMode = lazy(() => import('./display_modes/kanban/KanbanMode'));
const ListMode = lazy(() => import('./display_modes/table/ListMode'));
const CalendarMode = lazy(() => import('./display_modes/calendar/CalendarMode'));
const GanttMode = lazy(() => import('./display_modes/gantt/GanttMode'));
const CompanyStructure = lazy(() => import('./display_modes/structure/CompanyStructure'));

// Отфильтровать данные
function filterData(data, simplifiedData, filter) {
    const indexesItems = [];
    let newItem;

    // simplifiedData?.forEach((item, indItem) => {
    //     if (item.includes(filter)) indexesItems.push(indItem);
    // });

    simplifiedData?.forEach((item, indItem) => {
        newItem = JSON.stringify(item)
            .replace(/[\[\]"',]+/g, '')
            .toLowerCase();
        if (newItem.includes(filter.toLowerCase())) indexesItems.push(indItem);
    });

    if (indexesItems && indexesItems.length !== 0) {
        const filteredData = [];

        indexesItems.map(index => filteredData.push(data[index]));

        // console.log(`filteredData: ${JSON.stringify(filteredData, null, 4)}\nfilteredData len: ${filteredData.length}`);

        return filteredData;
    } else return data;
}

function Option(props) {
    const { optionVal, item, onSelectOption } = props;

    return (
        <li
            className={classNames('page-section-options__item', {
                'page-section-options__item_active': optionVal === item?.value
            })}
            onClick={() => onSelectOption(item)}
        >
            {item?.value}
        </li>
    );
}

// Режимы отображения
function DisplayModes(props) {
    const { displayModes, mode, onSelectMode } = props;

    return (
        <ul className="page-section-options">
            {displayModes && displayModes.length !== 0
                ? displayModes?.map(item => (
                      <Option key={item?.value} optionVal={mode?.value} item={item} onSelectOption={onSelectMode} />
                  ))
                : null}
        </ul>
    );
}

// Опции режима отображения
function ModeOptions(props) {
    const { modeOptions, modeOption, onSelectOption } = props;

    return (
        <ul className="page-section-options">
            {modeOptions && modeOptions.length !== 0
                ? modeOptions.map(item => (
                      <Option
                          key={item?.value}
                          optionVal={modeOption?.value}
                          item={item}
                          onSelectOption={onSelectOption}
                      />
                  ))
                : null}
        </ul>
    );
}

function HeaderTop({ itemSideMenu }) {
    return (
        <div className="page-section-header__top">
            <h2 className="page-section-header__top-title">{itemSideMenu}</h2>
            <hr className="page-section-header__hr-line" />
        </div>
    );
}

function HeaderBottom(props) {
    const {
        partition,
        searchElem,
        displayModes,
        mode,
        modeOptions,
        modeOption,
        navigate,
        setMode,
        setOption,
        setSearchElem
    } = props;

    const PARTITION_CONF = {
        department: () => {
            return (
                <div className="page-section-header__bottom">
                    <input
                        className="page-section__inpt-search"
                        type="text"
                        placeholder="Поиск по карточкам"
                        value={searchElem}
                        onChange={e => setSearchElem(e.target.value)}
                    />
                    {displayModes && displayModes.length !== 0 ? (
                        <DisplayModes
                            displayModes={displayModes}
                            mode={mode}
                            onSelectMode={onSelectMode}
                            onSelectOption={onSelectMode}
                        />
                    ) : null}
                    {modeOptions && modeOptions.length !== 0 ? (
                        <ModeOptions
                            mode={mode}
                            modeOptions={modeOptions}
                            modeOption={modeOption}
                            setOption={setOption}
                            onSelectOption={onSelectModeOption}
                        />
                    ) : null}
                    {/* <IconButton
                        nameClass="icon-btn__create icon-btn"
                        text="Создать"
                        icon="plus.svg"
                        onClick={() => onCreate(mode)}
                    /> */}
                </div>
            );
        },
        equipment: () => {
            return (
                <div className="page-section-header__bottom">
                    <div className="page-section-header__bottom-left">
                        <input
                            className="page-section__inpt-search"
                            type="text"
                            placeholder="Поиск по приборам"
                            value={searchElem}
                            // onChange={e => setSearchElem(e.target.value)}
                        />
                        <DisplayModes
                            displayModes={displayModes}
                            mode={mode}
                            onSelectMode={onSelectMode}
                            onSelectOption={onSelectMode}
                        />
                        <ModeOptions
                            mode={mode}
                            modeOptions={modeOptions}
                            modeOption={modeOption}
                            setOption={setOption}
                            onSelectOption={onSelectModeOption}
                        />
                    </div>
                    {/* <IconButton
                        nameClass="icon-btn__create icon-btn"
                        text="Создать"
                        icon="plus.svg"
                        onClick={() => onCreate(mode)}
                    /> */}
                </div>
            );
        },
        company: () => {
            return (
                <div className="page-section-header__bottom">
                    <div className="page-section-header__bottom-left">
                        <input
                            className="page-section__inpt-search"
                            type="text"
                            placeholder="Поиск по компании"
                            value={searchElem}
                            // onChange={e => setSearchElem(e.target.value)}
                        />
                        <DisplayModes
                            displayModes={displayModes}
                            mode={mode}
                            onSelectMode={onSelectMode}
                            onSelectOption={onSelectMode}
                        />
                    </div>
                    {/* <IconButton
                        nameClass="icon-btn__create icon-btn"
                        text="Создать"
                        icon="plus.svg"
                        // onClick={() => onCreate(mode)}
                    /> */}
                </div>
            );
        }
    };

    // Выбор режима отображения
    function onSelectMode(value) {
        setMode(value);
        navigate(value?.key);
        localStorage.setItem(`mode_${partition}`, JSON.stringify(value));
    }

    // Выбор опции режима отображения
    function onSelectModeOption(value) {
        setOption({ keyMode: mode?.key, ...value });
    }

    // Создание новых данных
    function onCreate(mode) {
        switch (mode.key) {
            case 'kanban':
                const navigationArg = {
                    state: {
                        partition: partition
                    }
                };
                navigate('../dataform/', navigationArg);
                break;
            case 'calendar':
                navigate(`calendar/${true}`);
                break;
            default:
                return;
        }
    }

    return partition ? PARTITION_CONF[partition]() : null;
}

export default function DataDisplayPage({ partition }) {
    const data = useLoaderData();
    const itemSideMenu = useOutletContext();
    const navigate = useNavigate();

    // Элемент поиска
    const [searchElem, setSearchElem] = useState('');

    // Режимы отображения
    const [displayModes, setDisplayModes] = useState([]);
    // Режим отображения
    const [mode, setMode] = useState(JSON.parse(localStorage.getItem(`mode_${partition}`)) || {});

    // Опции режимов отображения
    const [modeOptions, setModeOptions] = useState([]);
    // Опция режима отображения
    const [modeOption, setOption] = useState({});

    // Данные для отображения
    const valsToDisplay = DataDisplayService.getValuesToDisplay(partition, mode) || [];
    // Операции которые можно совершать с данными
    const dataOperations = DataDisplayService.getDataOperations(partition) || [];

    useEffect(() => {
        const dataModeOptions = DataDisplayService.getModeOptions(partition, mode);

        setModeOptions(dataModeOptions);

        if (dataModeOptions && dataModeOptions.length !== 0)
            setOption({
                keyMode: mode?.key,
                ...dataModeOptions[0]
            });
        else setOption({ keyMode: mode?.key, value: null, key: null });

        setSearchElem('');
    }, [mode]);

    useEffect(() => {
        const dataDisplayModes = DataDisplayService.getDisplayModes(partition)?.map(item => {
            return { key: item?.keyMode, value: item?.mode };
        });
        const displayMode = JSON.parse(localStorage.getItem(`mode_${partition}`)) || dataDisplayModes[0];
        const dataModeOptions = DataDisplayService.getModeOptions(partition, displayMode);

        setDisplayModes(dataDisplayModes);
        setMode(displayMode);

        setModeOptions(dataModeOptions);
        setOption({
            keyMode: displayMode?.key,
            ...dataModeOptions[0]
        });

        navigate(displayMode?.key);
    }, [itemSideMenu]);

    return (
        <section className="page__section-department page-section">
            <div className="page-section-header">
                <HeaderTop itemSideMenu={itemSideMenu.title} />
                <HeaderBottom
                    itemSideMenu={itemSideMenu.title}
                    partition={partition}
                    searchElem={searchElem}
                    displayModes={displayModes}
                    mode={mode}
                    modeOptions={modeOptions}
                    modeOption={modeOption}
                    navigate={navigate}
                    setMode={setMode}
                    setOption={setOption}
                    setSearchElem={setSearchElem}
                />
            </div>
            <div className="page-section-main">
                {mode && Object.keys(mode).length !== 0 ? (
                    <Routes>
                        {/* <Route index element={<Navigate to={NAVIGATE_CONF[mode?.key]} replace />} /> */}
                        <Route
                            path="kanban"
                            element={
                                <Suspense fallback={<Preloader />}>
                                    <Await resolve={data?.uploadedData}>
                                        {resolvedData => (
                                            <KanbanMode
                                                partition={partition}
                                                data={filterData(
                                                    resolvedData,
                                                    simplifyData(extractSampleData(resolvedData, valsToDisplay)),
                                                    searchElem
                                                )}
                                                modeOption={modeOption}
                                                dataOperations={dataOperations}
                                            />
                                        )}
                                    </Await>
                                </Suspense>
                            }
                        />
                        <Route
                            path="listmode"
                            element={
                                <Suspense fallback={<Preloader />}>
                                    <Await resolve={data?.uploadedData}>
                                        {resolvedData => (
                                            <ListMode
                                                testData={filterData(
                                                    resolvedData,
                                                    simplifyData(extractSampleData(resolvedData, valsToDisplay)),
                                                    searchElem
                                                )}
                                                modeConfig={{
                                                    keys: valsToDisplay,
                                                    partition: partition,
                                                    dataOperations: dataOperations
                                                }}
                                            />
                                        )}
                                    </Await>
                                </Suspense>
                            }
                        />
                        <Route
                            path="calendar/*"
                            element={
                                <Suspense fallback={<Preloader />}>
                                    <Await resolve={data?.uploadedData}>
                                        {resolvedData => (
                                            <CalendarMode testData={resolvedData} dataOperations={dataOperations} />
                                        )}
                                    </Await>
                                </Suspense>
                            }
                        />
                        <Route
                            path="gant"
                            element={
                                <Suspense fallback={<Preloader />}>
                                    <Await resolve={data?.uploadedData}>
                                        {resolvedData => (
                                            <GanttMode
                                                data={filterData(
                                                    resolvedData,
                                                    simplifyData(extractSampleData(resolvedData, valsToDisplay)),
                                                    searchElem
                                                )}
                                                modeOption={modeOption}
                                                searchElem={searchElem}
                                                dataOperations={dataOperations}
                                            />
                                        )}
                                    </Await>
                                </Suspense>
                            }
                        />
                        <Route
                            path="structure"
                            element={
                                <Suspense fallback={<Preloader />}>
                                    <Await resolve={data?.uploadedData}>
                                        {resolvedData => <CompanyStructure testData={resolvedData?.structure} />}
                                    </Await>
                                </Suspense>
                            }
                        />
                        <Route
                            path="employees"
                            element={
                                <Suspense fallback={<Preloader />}>
                                    <Await resolve={data?.uploadedData}>
                                        {resolvedData => (
                                            <ListMode
                                                testData={resolvedData?.employees}
                                                modeConfig={{
                                                    keys: valsToDisplay,
                                                    partition: partition,
                                                    dataOperations: dataOperations
                                                }}
                                            />
                                        )}
                                    </Await>
                                </Suspense>
                            }
                        />
                    </Routes>
                ) : null}
            </div>
        </section>
    );
}
