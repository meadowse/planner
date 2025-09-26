import { useState, useEffect, Suspense, lazy } from 'react';
import { Routes, Route, Navigate, Await, useOutletContext, useNavigate, useLoaderData } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Cookies from 'js-cookie';
import classNames from 'classnames';

// Импорт компонетов
import Preloader from '@components/auxiliary_pages/loader/Preloader';

// Импорт сервисов
import DataDisplayService from '@services/data_display.service';

// Импорт вспомогательных функций
import { extractSampleData, simplifyData, getUniqueData, getFilteredData } from '@helpers/helper';

// Импорт контекста
import { useHistoryContext } from '../../../contexts/history.context';

// Импорт стилей
import './data_display_page.css';

const KanbanMode = lazy(() => import('./display_modes/kanban/KanbanMode'));
const ListMode = lazy(() => import('./display_modes/table/ListMode'));
const CalendarMode = lazy(() => import('./display_modes/calendar/CalendarMode'));
const GanttMode = lazy(() => import('./display_modes/gantt/GanttMode'));
const CompanyStructure = lazy(() => import('./display_modes/structure/CompanyStructure'));
const TimeTableMode = lazy(() => import('./display_modes/timetable/TimeTableMode'));

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
    } else return [];
}

function Option(props) {
    const { keyVal, item, onSelectOption } = props;
    // console.log(`keyVal: ${JSON.stringify(keyVal, null, 4)}\nitem: ${JSON.stringify(item, null, 4)}`);

    return (
        <li
            className={classNames('page-section-options__item', {
                'page-section-options__item_active': keyVal === item?.key
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
                      <Option key={item?.value} keyVal={mode?.key} item={item} onSelectOption={onSelectMode} />
                  ))
                : null}
        </ul>
    );
}

// Опции режима отображения
function ModeOptions(props) {
    const { modeOptions, modeOption, onSelectOption } = props;
    // console.log(`modeOption: ${JSON.stringify(modeOption, null, 4)}`);

    return (
        <ul className="page-section-options">
            {modeOptions && modeOptions.length !== 0
                ? modeOptions.map(item => (
                      <Option key={item?.value} keyVal={modeOption?.key} item={item} onSelectOption={onSelectOption} />
                  ))
                : null}
        </ul>
    );
}

function HeaderTop(props) {
    const { itemSideMenu, theme, onToggleAppTheme } = props;

    return (
        <div className="page-section-header__top">
            <h2 className="page-section-header__top-title">{itemSideMenu}</h2>
            <hr className="page-section-header__hr-line" />
            <input
                id="checkbox-app-theme"
                className="page-section-header__btn-theme"
                type="checkbox"
                checked={theme === 'dark' ? true : false}
                onChange={onToggleAppTheme}
            />
            <label className="page-section-header__theme-label" for="checkbox-app-theme" />
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
        // Производство
        department: () => {
            return (
                <div className="page-section-header__bottom">
                    <input
                        className="page-section__inpt-search"
                        type="text"
                        placeholder="Поиск по карточкам"
                        value={searchElem}
                        onBlur={onFocusOut}
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
                </div>
            );
        },
        // Оборудование
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
                </div>
            );
        },
        // Компания
        company: () => {
            return (
                <div className="page-section-header__bottom">
                    <div className="page-section-header__bottom-left">
                        <input
                            className="page-section__inpt-search"
                            type="text"
                            placeholder="Поиск по компании"
                            value={searchElem}
                            onBlur={onFocusOut}
                            onChange={e => setSearchElem(e.target.value)}
                        />
                        <DisplayModes
                            displayModes={displayModes}
                            mode={mode}
                            onSelectMode={onSelectMode}
                            onSelectOption={onSelectMode}
                        />
                    </div>
                </div>
            );
        },
        // Персональные Задачи и Договоры
        personal: () => {
            return (
                <div className="page-section-header__bottom">
                    <div className="page-section-header__bottom-left">
                        <input
                            className="page-section__inpt-search"
                            type="text"
                            placeholder="Поиск по задачам"
                            value={searchElem}
                            onBlur={onFocusOut}
                            onChange={e => setSearchElem(e.target.value)}
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
                </div>
            );
        }
    };

    // Обработка потери фокуса
    function onFocusOut(e) {
        localStorage.setItem('globalSearch', e.target.value);
    }

    // Выбор режима отображения
    function onSelectMode(value) {
        setMode(value);
        navigate(value?.key);
        localStorage.setItem(`mode_${partition}`, JSON.stringify(value));
    }

    // Выбор опции режима отображения
    function onSelectModeOption(value) {
        let option = {
            [mode?.key]: { keyMode: mode?.key, ...value }
        };
        setOption(option);
        localStorage.setItem(`mode-option_${partition}`, JSON.stringify(option));
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
    // const data = useLoaderData();
    const { uploadedData } = useLoaderData();
    // const itemSideMenu = useOutletContext();

    const {
        data: cachedData,
        isLoading,
        error
    } = useQuery({
        queryKey: [partition],
        queryFn: () => Promise.resolve(uploadedData),
        uploadedData,
        enabled: ['department'].includes(partition),
        staleTime: 5 * 60 * 1000,
        cacheTime: 60 * 60 * 1000
    });

    const { itemSideMenu, searchElem, theme, onToggleAppTheme, setSearchElem } = useOutletContext();

    const navigate = useNavigate();
    const { clearHistory } = useHistoryContext();

    // Режимы отображения
    const [displayModes, setDisplayModes] = useState([]);
    // Режим отображения
    const [mode, setMode] = useState(JSON.parse(localStorage.getItem(`mode_${partition}`)) || {});

    // Опции режимов отображения
    const [modeOptions, setModeOptions] = useState([]);
    // Опция режима отображения
    const [modeOption, setOption] = useState(JSON.parse(localStorage.getItem(`mode-option_${partition}`)) || {});

    // Данные для отображения
    const valsToDisplay = DataDisplayService.getValuesToDisplay(partition, mode, modeOption[mode?.key]) || [];
    // Операции которые можно совершать с данными
    const dataOperations = DataDisplayService.getDataOperations(partition) || [];

    // Конфигурация мо маршрутам которые используют кэшированные данные
    const ROUTES_CONFIG = {
        kanban: () => {
            const keyData = modeOption[mode?.key]?.keyData ?? itemSideMenu?.key;

            const kanbanData =
                cachedData && Object.keys(cachedData).length !== 0
                    ? filterData(
                          cachedData[keyData] ?? cachedData,
                          simplifyData(extractSampleData(cachedData[keyData] ?? cachedData, valsToDisplay)),
                          searchElem
                      )
                    : [];

            return (
                <Route
                    path="kanban"
                    element={
                        !isLoading ? (
                            <KanbanMode
                                partition={partition}
                                data={kanbanData}
                                modeOption={modeOption[mode?.key]}
                                dataOperations={dataOperations}
                            />
                        ) : (
                            <Preloader />
                        )
                    }
                />
            );
        },
        listmode: () => {
            const keyData = modeOption[mode?.key]?.keyData ?? itemSideMenu?.key;
            const tableData =
                cachedData && Object.keys(cachedData).length !== 0
                    ? filterData(
                          cachedData[keyData] ?? cachedData,
                          simplifyData(extractSampleData(cachedData[keyData] ?? cachedData, valsToDisplay)),
                          searchElem
                      )
                    : [];
            return (
                <Route
                    path="listmode"
                    element={
                        !isLoading ? (
                            <ListMode
                                testData={tableData}
                                modeConfig={{
                                    keys: valsToDisplay,
                                    mode: mode,
                                    option: modeOption[mode?.key],
                                    partition: partition,
                                    dataOperations: dataOperations
                                }}
                            />
                        ) : (
                            <Preloader />
                        )
                    }
                />
            );
        },
        calendar: () => {
            const keyData = modeOption[mode?.key]?.keyData ?? itemSideMenu?.key;
            const calendarData =
                cachedData && Object.keys(cachedData).length !== 0 ? cachedData[keyData] ?? cachedData : [];
            return (
                <Route
                    path="calendar"
                    element={
                        !isLoading ? (
                            <CalendarMode
                                partition={partition}
                                testData={calendarData}
                                dataOperations={dataOperations}
                            />
                        ) : (
                            <Preloader />
                        )
                    }
                />
            );
        },
        gant: () => {
            const keyData = modeOption[mode?.key]?.keyData ?? itemSideMenu?.key;
            const gantData =
                cachedData && Object.keys(cachedData).length !== 0 ? cachedData[keyData] ?? cachedData : [];
            return (
                <Route
                    path="gant"
                    element={
                        !isLoading ? (
                            <GanttMode
                                partition={partition}
                                data={gantData}
                                modeConfig={{
                                    resolvedData: gantData,
                                    modeOptions: modeOptions,
                                    modeOption: modeOption[mode?.key],
                                    dataOperations: dataOperations
                                }}
                            />
                        ) : (
                            <Preloader />
                        )
                    }
                />
            );
        }
    };

    // Очитска истории маршрутов
    // useEffect(() => clearHistory(`${itemSideMenu?.path}${mode?.key}`), [itemSideMenu]);

    useEffect(() => {
        // Очитска истории маршрутов
        clearHistory(`${itemSideMenu?.path}${mode?.key}`);

        const dataDisplayModes = DataDisplayService.getDisplayModes(partition)?.map(item => {
            return { key: item?.keyMode, value: item?.mode };
        });
        const displayMode = JSON.parse(localStorage.getItem(`mode_${partition}`)) || dataDisplayModes[0];
        const dataModeOptions = DataDisplayService.getModeOptions(partition, displayMode);

        setDisplayModes(dataDisplayModes);
        setMode(() => {
            localStorage.setItem(`mode_${partition}`, JSON.stringify(displayMode));
            return displayMode;
        });

        setModeOptions(dataModeOptions);
        setOption(() => {
            let option = {};
            let savedOption = JSON.parse(localStorage.getItem(`mode-option_${partition}`));
            if (!savedOption || Object.keys(savedOption).length === 0) {
                option = {
                    [displayMode?.key]: dataModeOptions[0]
                };
                localStorage.setItem(`mode-option_${partition}`, JSON.stringify(option));
                return option;
            } else return savedOption;
        });

        navigate(displayMode?.key);
    }, [itemSideMenu]);

    useEffect(() => {
        const dataModeOptions = DataDisplayService.getModeOptions(partition, mode);
        setModeOptions(dataModeOptions);
        setOption(() => {
            let savedOption = JSON.parse(localStorage.getItem(`mode-option_${partition}`));
            let option = {};

            if (savedOption && Object.keys(savedOption).length !== 0) {
                if (mode?.key && mode?.key in savedOption) {
                    option = savedOption ? savedOption : { [mode?.key]: { value: null, key: null } };
                } else {
                    option = { [mode?.key]: dataModeOptions[0] };
                }
            } else option = { [mode?.key]: dataModeOptions[0] };

            localStorage.setItem(`mode-option_${partition}`, JSON.stringify(option));

            return option;
        });
    }, [mode]);

    return (
        <section className="page__section-department page-section">
            <div className="page-section-header">
                <HeaderTop itemSideMenu={itemSideMenu.title} theme={theme} onToggleAppTheme={onToggleAppTheme} />
                <HeaderBottom
                    partition={partition}
                    searchElem={searchElem}
                    displayModes={displayModes}
                    mode={mode}
                    modeOptions={modeOptions}
                    modeOption={modeOption[mode?.key]}
                    navigate={navigate}
                    setMode={setMode}
                    setOption={setOption}
                    setSearchElem={setSearchElem}
                />
            </div>
            <div className="page-section-main">
                {mode && Object.keys(mode).length !== 0 ? (
                    <Routes>
                        <Route index element={<Navigate to={`${itemSideMenu?.path}${mode?.key}`} replace />} />
                        {ROUTES_CONFIG[mode?.key] ? ROUTES_CONFIG[mode?.key]() : null}
                        {/* Маршруты которые пока не используют кэшированные данные */}
                        <Route
                            path="kanban"
                            element={
                                <Suspense fallback={<Preloader />}>
                                    {/* resolve={uploadedData} */}
                                    <Await resolve={uploadedData}>
                                        {resolvedData => {
                                            const kanbanData = filterData(
                                                resolvedData?.equipment ?? resolvedData,
                                                simplifyData(
                                                    extractSampleData(
                                                        resolvedData?.equipment ?? resolvedData,
                                                        valsToDisplay
                                                    )
                                                ),
                                                searchElem
                                            );
                                            return (
                                                <KanbanMode
                                                    partition={partition}
                                                    data={kanbanData}
                                                    modeOption={modeOption[mode?.key]}
                                                    dataOperations={dataOperations}
                                                />
                                            );
                                        }}
                                    </Await>
                                </Suspense>
                            }
                        />
                        <Route
                            path="structure"
                            element={
                                <Suspense fallback={<Preloader />}>
                                    <Await resolve={uploadedData}>
                                        {resolvedData => <CompanyStructure testData={resolvedData?.structure} />}
                                    </Await>
                                </Suspense>
                            }
                        />
                        <Route
                            path="employees"
                            element={
                                <Suspense fallback={<Preloader />}>
                                    <Await resolve={uploadedData}>
                                        {resolvedData => {
                                            const tableData = filterData(
                                                resolvedData?.employees,
                                                simplifyData(extractSampleData(resolvedData?.employees, valsToDisplay)),
                                                searchElem
                                            );
                                            return (
                                                <ListMode
                                                    testData={tableData}
                                                    modeConfig={{
                                                        keys: valsToDisplay,
                                                        mode: mode,
                                                        option: modeOption[mode?.key],
                                                        partition: partition,
                                                        dataOperations: dataOperations
                                                    }}
                                                />
                                            );
                                        }}
                                    </Await>
                                </Suspense>
                            }
                        />
                        <Route
                            path="listTasks"
                            element={
                                <Suspense fallback={<Preloader />}>
                                    <Await resolve={uploadedData}>
                                        {resolvedData => {
                                            // Фильтрация данных по id
                                            const filteredDataByIdExec = getFilteredData(
                                                resolvedData?.tasks,
                                                Cookies.get('MMUSERID'),
                                                modeOption?.listTasks
                                            );
                                            // Фильтрация данных по id соисполнителя
                                            const filteredDataByIdCoExec = getFilteredData(
                                                resolvedData?.tasks,
                                                Cookies.get('MMUSERID'),
                                                {
                                                    keyMode: 'listTasks',
                                                    value: 'Соисполнитель',
                                                    key: 'coExecutor',
                                                    uniqueness: 'id'
                                                }
                                            );

                                            // Сформированные данные после слияния
                                            const mergedData = filteredDataByIdExec.concat(filteredDataByIdCoExec);
                                            // Массив уникальных идентификаторов
                                            const uniqueIds = [...new Set(mergedData.map(elem => elem.id))];
                                            // Уникальные данные
                                            const uniqueData = resolvedData?.tasks?.filter(item =>
                                                uniqueIds.includes(item?.id)
                                            );

                                            const filteredData = filterData(
                                                uniqueData,
                                                simplifyData(extractSampleData(uniqueData, valsToDisplay)),
                                                searchElem
                                            );
                                            return (
                                                <ListMode
                                                    testData={filteredData}
                                                    modeConfig={{
                                                        keys: valsToDisplay,
                                                        mode: mode,
                                                        option: modeOption[mode?.key],
                                                        // contractsIDs: resolvedData?.contractsIDs,
                                                        partition: partition,
                                                        dataOperations: dataOperations
                                                    }}
                                                />
                                            );
                                        }}
                                    </Await>
                                </Suspense>
                            }
                        />
                        <Route
                            path="listContracts"
                            element={
                                <Suspense fallback={<Preloader />}>
                                    <Await resolve={uploadedData}>
                                        {resolvedData => {
                                            const dataById = getFilteredData(
                                                resolvedData?.contracts,
                                                Cookies.get('MMUSERID'),
                                                modeOption?.listContracts
                                            );
                                            // console.log(`dataById: ${JSON.stringify(dataById, null, 4)}`);
                                            const filteredData = filterData(
                                                dataById,
                                                simplifyData(extractSampleData(dataById, valsToDisplay)),
                                                searchElem
                                            );
                                            // console.log(`filteredData: ${JSON.stringify(filteredData, null, 4)}`);
                                            return (
                                                <ListMode
                                                    testData={filteredData}
                                                    modeConfig={{
                                                        keys: valsToDisplay,
                                                        mode: mode,
                                                        option: modeOption[mode?.key],
                                                        partition: partition,
                                                        dataOperations: dataOperations
                                                    }}
                                                />
                                            );
                                        }}
                                    </Await>
                                </Suspense>
                            }
                        />
                        <Route
                            path="gantContracts"
                            element={
                                <Suspense fallback={<Preloader />}>
                                    <Await resolve={uploadedData}>
                                        {resolvedData => {
                                            const filteredData = filterData(
                                                resolvedData?.contracts,
                                                simplifyData(
                                                    extractSampleData(resolvedData?.contracts, [
                                                        'contractId',
                                                        'stage',
                                                        'contractNum',
                                                        'company',
                                                        'address',
                                                        'services',
                                                        'dateOfStart',
                                                        'dateOfEnding',
                                                        'tasks',
                                                        'contacts'
                                                    ])
                                                ),
                                                Cookies.get('MMUSERID')
                                            );
                                            return (
                                                <GanttMode
                                                    // data={resolvedData?.contracts || []}
                                                    partition={partition}
                                                    data={filteredData}
                                                    modeConfig={{
                                                        resolvedData: resolvedData?.contracts,
                                                        modeOptions: modeOptions,
                                                        modeOption: {
                                                            keyData: 'contracts',
                                                            keys: [
                                                                'contractId',
                                                                'stage',
                                                                'contractNum',
                                                                'company',
                                                                'address',
                                                                'services',
                                                                'dateOfStart',
                                                                'dateOfEnding',
                                                                'tasks',
                                                                'contacts'
                                                            ]
                                                        },
                                                        dataOperations: dataOperations
                                                    }}
                                                />
                                            );
                                        }}
                                    </Await>
                                </Suspense>
                            }
                        />
                        <Route
                            path="timetable"
                            element={
                                <Suspense fallback={<Preloader />}>
                                    <Await resolve={uploadedData}>
                                        {resolvedData => {
                                            return <TimeTableMode />;
                                        }}
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
