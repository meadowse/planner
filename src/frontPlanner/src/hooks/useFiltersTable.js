import { useEffect, useState } from 'react';

// Импорт конфигураций
import { DEFAULT_ACTIVE_FILTERS, FILTER_HANDLERS_CONF } from '@config/filterstable.config';

// Импорт доп.функционала
import { getDateFromString } from '@helpers/calendar';

function applyFilters(data, filters) {
    // console.log(`filters: ${JSON.stringify(filters, null, 4)}\nfilters table data: ${JSON.stringify(data, null, 4)}`);

    const filteredData = data.filter(item =>
        Object.keys(filters).every(key => {
            const handler = FILTER_HANDLERS_CONF.get(key);
            return !handler || handler(filters[key], item[key]);
        })
    );

    // console.log(`filteredData: ${JSON.stringify(filteredData, null, 4)}`);

    return filteredData;
}

export const useFiltersTable = (tableData, toggleState, setToggleState, setData) => {
    // const activeFilters = Object.assign({}, DEFAULT_ACTIVE_FILTERS);
    const [activeFilters, setActiveFilters] = useState(Object.assign({}, DEFAULT_ACTIVE_FILTERS));
    const filteredData = applyFilters(Array.from(tableData), activeFilters);

    const OPTIONS_FILTER_MAP = {
        services: data => {
            return Array.from(
                new Set(
                    data.map(item => item.services && Object.keys(item.services).length !== 0 && item.services?.title)
                )
            );
        },
        stage: data => {
            return ['Все', ...Array.from(new Set(data.map(item => item?.stage?.title)))];
        },
        deadlineTask: data => {
            let currDate = new Date();
            const newData = [];
            let tempData = Array.from(
                new Set(
                    data.map(item => {
                        if (item?.deadlineTask) {
                            if (!item?.deadlineTask) return 'Без даты';
                            else {
                                let deadline = getDateFromString(item?.deadlineTask);
                                if (currDate > deadline) return 'Просроченные';
                                else return 'Непросроченные';
                            }
                        }
                    })
                )
            );

            tempData.map(item => {
                if (item) newData.push(item);
            });

            return newData;
        },
        dateOfEnding: data => {
            let currDate = new Date();
            const newData = [];
            let tempData = Array.from(
                new Set(
                    data.map(item => {
                        if (item?.dateOfEnding && Object.keys(item?.dateOfEnding).length !== 0) {
                            if (!item?.dateOfEnding?.value) return 'Без даты';
                            else {
                                if ('expired' in item?.dateOfEnding) {
                                    if (item?.dateOfEnding?.expired) return 'Просроченные';
                                    else return 'Непросроченные';
                                } else {
                                    let deadline = getDateFromString(item?.dateOfEnding?.value);
                                    if (currDate > deadline) return 'Просроченные';
                                    else return 'Непросроченные';
                                }
                            }
                        }
                    })
                )
            );

            tempData.map(item => {
                if (item) newData.push(item);
            });

            return newData;
        },
        responsible: data => {
            const newData = [];
            let tempData = Array.from(new Set(data.map(item => item.responsible?.fullName)));

            tempData.map(item => {
                if (item) newData.push(item);
            });

            return newData;
        }
    };

    // Сброс фильтров
    const onResetFilters = () => {
        setToggleState(!toggleState);
        setData([...applyFilters(tableData, DEFAULT_ACTIVE_FILTERS)]);
    };

    // Изменение фильтров
    const onChangeFilter = e => {
        const tempFilters = activeFilters;
        tempFilters[e.target.id] = e.target.value;

        setActiveFilters(tempFilters);
        setData([...applyFilters(tableData, activeFilters)]);
    };

    useEffect(() => {
        if (filteredData && filteredData.length !== 0) setData(filteredData);
    }, []);

    return { OPTIONS_FILTER_MAP, onResetFilters, onChangeFilter };
};
