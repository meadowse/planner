import { useMemo, useState } from 'react';
import { useTable } from 'react-table';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames';
import axios from 'axios';

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

export default function ListMode(props) {
    const { partition, keys, testData, dataOperations } = props;
    // console.log(`keys: ${JSON.stringify(keys, null, 4)}\ntestData: ${JSON.stringify(testData, null, 4)}`);
    const navigate = useNavigate();
    const columns = useMemo(() => getSampleColumns(keys), [testData]);
    console.log(`columns: ${JSON.stringify(columns, null, 4)}`);

    const [data, setData] = useState(testData);
    const [order, setOrder] = useState('ASC');

    const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable({ columns, data });
    const { sortData } = useListMode(testData, setData);

    async function onShowInfoCard(operationVal, indElem) {
        await axios
            .post(`${window.location.origin}/api/getAgreement`, { contractId: testData[indElem]?.id })
            .then(response => {
                if (response?.status === 200) {
                    const navigationArg = {
                        state: {
                            partition: partition,
                            data: response?.data[0],
                            dataOperation: findNestedObj(dataOperations, 'key', operationVal)
                        }
                    };
                    navigate('../../dataform/', navigationArg);
                }
            });
    }

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
                                                icon='sort.svg'
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
                        rows.map((row, index) => {
                            prepareRow(row);
                            return (
                                <tr
                                    className="table-mode__tbody-tr"
                                    {...row.getRowProps()}
                                    onClick={() => onShowInfoCard('update', index)}
                                >
                                    {row.cells.map((cell, index) => {
                                        return (
                                            <td
                                                className="table-mode__tbody-td"
                                                {...cell.getCellProps()}
                                                width={
                                                    index === 0
                                                        ? 'max-content'
                                                        : `${Math.ceil((1 / (row.cells.length - 1)) * 100)}%`
                                                }
                                            >
                                                {cell.render('Cell')}
                                            </td>
                                        );
                                    })}
                                </tr>
                            );
                        })}
                </tbody>
            </table>
        </div>
    );
}
