import { useEffect, useMemo, useState } from 'react';
import { useTable, useExpanded } from 'react-table';
import { createPortal } from 'react-dom';
import classNames from 'classnames';

// Импорт компонетов
import IconButton from '@generic/elements/buttons/IcButton.js';
import TaskPopup from '@components/pages/data_display/data_form/tabs/tab_work/popups/task/TaskPopup';
import FiltersTable from './filters/FiltersTable.js';

// Импорт кастомных хуков
import { useListMode } from '@hooks/useListMode.js';
import { useFiltersTable } from '@hooks/useFiltersTable.js';

// Импорт доп.функционала
import { findNestedObj } from '@helpers/helper';

// Импорт данных
import getSampleColumns from '@data/constans/Columns';

// Импорт сервисов
import DataDisplayService from '@services/data_display.service.js';

// Импорт стилей
import './list_mode.css';

// Ячейка шапки таблицы
function HeadCell({ cellData, cellConfig }) {
    return cellData?.column.render('Header', {
        config: { ...cellConfig }
    });
}

// Ячейка тела таблицы
function Cell({ cellData, cellConfig }) {
    return (
        <td
            className="table-mode__tbody-td"
            style={{ maxWidth: `${cellData?.width}px` }}
            {...cellData?.cell.getCellProps()}
        >
            {cellData?.cell.render('Cell', {
                config: { ...cellConfig }
            })}
        </td>
    );
}

export default function ListMode(props) {
    const { testData, modeConfig } = props;

    // console.log(`ListMode modeConfig: ${JSON.stringify(modeConfig, null, 4)}`);

    const [toggleState, setToggleState] = useState(false);
    const [data, setData] = useState([]);
    const [order, setOrder] = useState('ASC');

    const [popupState, setPopupState] = useState(false);
    const [popupInfo, setPopupInfo] = useState({
        operation: null,
        mode: null,
        data: null
    });

    const { sortData } = useListMode(data);
    const columns = useMemo(() => getSampleColumns(modeConfig?.keys), [testData]);
    const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable(
        {
            columns,
            data,
            getSubRows: row => DataDisplayService.formData(row.subtasks) || []
        },
        useExpanded
    );
    const { OPTIONS_FILTER_CONF, activeFilters, filteredData, onChangeFilter, onResetFilters } = useFiltersTable(
        modeConfig,
        testData,
        toggleState,
        setToggleState
    );

    // Конфигурация по заголовкам таблицы
    const HEAD_CELL_CONF = {
        task: headData => {
            const config = {
                idContract: modeConfig?.idContract,
                tasks: data,
                task: {},
                setPopupState,
                openPopup
            };
            return <HeadCell cellData={headData} cellConfig={config} />;
        },
        default: headData => {
            return <HeadCell cellData={headData} />;
        }
    };

    // Конфигурация по ячейкам таблицы
    const CELL_CONF = {
        contractNum: cellData => {
            const config = {
                partition: modeConfig?.partition,
                dataOperation: findNestedObj(modeConfig?.dataOperations, 'key', 'update')
            };
            return <Cell cellData={cellData} cellConfig={config} />;
        },
        task: cellData => {
            const config = {
                idContract: data[cellData?.indRow]?.contractId,
                partition: modeConfig?.partition,
                tasks: data,
                dataOperation: findNestedObj(modeConfig?.dataOperations, 'key', 'update'),
                setPopupState,
                openPopup
            };
            return <Cell cellData={cellData} cellConfig={config} />;
        },
        coExecutor: cellData => {
            // const config = {
            //     coExecutor: data[cellData?.indRow]?.coExecutor ?? null,
            //     coExecutors: data[cellData?.indRow]?.coExecutors ?? null
            // };
            // return <Cell cellData={cellData} cellConfig={config} />;
            return <Cell cellData={cellData} />;
        },
        default: cellData => {
            return <Cell cellData={cellData} />;
        }
    };

    // Конфигурация по всплывающим окнам
    const POPUP_CONF = {
        'addTask': (
            <TaskPopup
                key={`key${Date.now().toString(36) + Math.random().toString(36).substr(2)}`}
                additClass="add-task"
                title="Новая задача"
                data={popupInfo?.data}
                taskOperation={popupInfo?.operation}
                popupState={popupState}
                setPopupState={setPopupState}
                switchPopup={switchPopup}
            />
        ),
        'addSubTask': (
            <TaskPopup
                key={`key${
                    +popupInfo?.data?.editingTask?.id + Date.now().toString(36) + Math.random().toString(36).substr(2)
                }`}
                additClass="add-task"
                title="Новая подзадача"
                data={popupInfo?.data}
                taskOperation={popupInfo?.operation}
                popupState={popupState}
                setPopupState={setPopupState}
                switchPopup={switchPopup}
            />
        ),
        'editTask': (
            <TaskPopup
                key={`key${
                    +popupInfo?.data?.editingTask?.id + Date.now().toString(36) + Math.random().toString(36).substr(2)
                }`}
                additClass="add-task"
                title="Редактирование задачи"
                data={popupInfo?.data}
                taskOperation={popupInfo?.operation}
                popupState={popupState}
                setPopupState={setPopupState}
                switchPopup={switchPopup}
            />
        )
    };

    // Открыть всплывающее окно
    function openPopup(operation, mode, data = null) {
        setPopupInfo({
            operation,
            mode,
            data
        });
    }

    // Переключить всплывающее окно
    function switchPopup(operation, mode, data) {
        setPopupInfo({ operation, mode, data });
    }

    useEffect(() => {
        // console.log(`filteredData: ${JSON.stringify(filteredData, null, 4)}`);
        setData(filteredData);
    }, [activeFilters, filteredData]);

    return (
        <div className={classNames('table-mode__wrapper', { 'table-mode__wrapper_empty': !data || data.length === 0 })}>
            {!data || (data.length === 0 && <p className="table-mode__info-message">Данные отсутствуют</p>)}
            <table className="table-mode" {...getTableProps()}>
                <thead className="table-mode__thead">
                    {modeConfig?.keys && modeConfig?.keys.length !== 0 ? (
                        <FiltersTable
                            keys={modeConfig?.keys}
                            // keys={columns.map(col => col.accessor)}
                            activeFilters={activeFilters}
                            optionsFilter={OPTIONS_FILTER_CONF}
                            data={testData}
                            toggleState={toggleState}
                            onChangeFilter={onChangeFilter}
                            onResetFilters={onResetFilters}
                        />
                    ) : null}
                    {headerGroups.map(headerGroup => (
                        <>
                            <tr className="table-mode__thead-tr" {...headerGroup.getHeaderGroupProps()}>
                                {headerGroup.headers.map(column => {
                                    const cellData = {
                                        column: column
                                    };
                                    return (
                                        <th className="table-mode__thead-th" {...column.getHeaderProps()}>
                                            <div className="table-mode__thead-th-inner">
                                                {/* Генерация ячеек шапки таблицы */}
                                                {HEAD_CELL_CONF[column.id]
                                                    ? HEAD_CELL_CONF[column.id](cellData)
                                                    : HEAD_CELL_CONF.default(cellData)}
                                                {column.sortable && (
                                                    <button
                                                        className="table-mode__thead-th-btn-sorting"
                                                        onClick={() =>
                                                            column?.sortable &&
                                                            sortData(
                                                                filteredData,
                                                                column.id,
                                                                column.sortBy,
                                                                order,
                                                                setOrder,
                                                                setData
                                                            )
                                                        }
                                                    >
                                                        &#8693;
                                                    </button>
                                                )}
                                            </div>
                                        </th>
                                    );
                                })}
                            </tr>
                        </>
                    ))}
                </thead>
                <tbody className="table-mode__tbody" {...getTableBodyProps()}>
                    {data &&
                        data.length !== 0 &&
                        rows.map((row, rowInd) => {
                            prepareRow(row);
                            return (
                                <tr className="table-mode__tbody-tr" {...row.getRowProps()}>
                                    {row.cells.map((cell, cellInd) => {
                                        const cellData = {
                                            indRow: rowInd,
                                            indCell: cellInd,
                                            row: row,
                                            cell: cell,
                                            width: Math.ceil(window.screen.width / columns.length)
                                        };
                                        // Генерация ячеек тела таблицы
                                        return CELL_CONF[cell.column.id]
                                            ? CELL_CONF[cell.column.id](cellData)
                                            : CELL_CONF.default(cellData);
                                    })}
                                </tr>
                            );
                        })}
                </tbody>
            </table>
            {popupState ? createPortal(POPUP_CONF[popupInfo?.mode] ?? null, document.getElementById('root')) : null}
        </div>
    );
}
