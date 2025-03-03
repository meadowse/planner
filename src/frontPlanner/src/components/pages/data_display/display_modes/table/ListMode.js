import { useMemo, useState } from 'react';
import { useTable } from 'react-table';
import classNames from 'classnames';

// Импорт компонетов
import IconButton from '@generic/elements/buttons/IcButton.js';
import FiltersTable from './filters/FiltersTable.js';

// Импорт кастомных хуков
import { useListMode } from '@hooks/useListMode.js';

// Импорт доп.функционала
import { findNestedObj } from '@helpers/helper';

// Импорт данных
import getSampleColumns from '@data/constans/Columns';

// Импорт стилей
import './list_mode.css';

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
    const { partition, keys, testData, dataOperations } = props;
    // console.log(`keys: ${JSON.stringify(keys, null, 4)}\ntestData: ${JSON.stringify(testData, null, 4)}`);
    const columns = useMemo(() => getSampleColumns(keys), [testData]);
    // console.log(`columns: ${JSON.stringify(columns, null, 4)}`);

    // const [data, setData] = useState(testData.sort((a, b) => parseInt(b?.id) - parseInt(a?.id)));
    const [data, setData] = useState(testData);
    const [order, setOrder] = useState('ASC');

    const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable({ columns, data });
    const { sortData } = useListMode(testData, setData);

    const CELL_CONF = {
        contractNum: data => {
            const config = {
                partition: partition,
                contractId: testData[data?.indRow]?.id,
                dataOperation: findNestedObj(dataOperations, 'key', 'update')
            };
            return <Cell cellData={data} cellConfig={config} />;
        },
        default: data => {
            return <Cell cellData={data} />;
        }
    };

    return (
        <div className={classNames('table-mode__wrapper', { 'table-mode__wrapper_empty': !data || data.length === 0 })}>
            {!data || (data.length === 0 && <p className="table-mode__info-message">Данные отсутствуют</p>)}
            <table className="table-mode" {...getTableProps()}>
                <thead className="table-mode__thead">
                    {keys && keys.length !== 0 ? <FiltersTable keys={keys} data={testData} setData={setData} /> : null}
                    {headerGroups.map(headerGroup => (
                        <tr className="table-mode__thead-tr" {...headerGroup.getHeaderGroupProps()}>
                            {headerGroup.headers.map(column => (
                                <th className="table-mode__thead-th" {...column.getHeaderProps()}>
                                    <div className="table-mode__thead-th-inner">
                                        {column.render('Header')}
                                        {column.sortable && (
                                            <IconButton
                                                nameClass={classNames('ic_btn', 'sorting')}
                                                icon={'sort.svg'}
                                                onClick={() =>
                                                    column?.sortable &&
                                                    sortData(
                                                        testData,
                                                        column.id,
                                                        column.sortBy,
                                                        order,
                                                        setOrder,
                                                        setData
                                                    )
                                                }
                                            />
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
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
                                        return CELL_CONF[cell.column.id]
                                            ? CELL_CONF[cell.column.id](cellData)
                                            : CELL_CONF.default(cellData);
                                    })}
                                </tr>
                            );
                        })}
                </tbody>
            </table>
        </div>
    );
}
