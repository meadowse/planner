import { useEffect, useState } from 'react';

// Импорт конфигураций
import {
    DEFAULT_FILTERS,
    INITIAL_FILTERS,
    OPTIONS_FILTER_CONF,
    FILTER_HANDLERS_CONF
} from '@config/filterstable.config';

// Инициализация фильтров
function initializeFilters(data, keys) {
    const initFilters = {};

    if (keys && keys.length !== 0) {
        keys.forEach(key => {
            if (key in OPTIONS_FILTER_CONF && key in INITIAL_FILTERS) {
                const options = OPTIONS_FILTER_CONF[key](data);
                if (options && options.length !== 0) {
                    if (options.includes(INITIAL_FILTERS[key])) initFilters[key] = INITIAL_FILTERS[key];
                }
            } else initFilters[key] = DEFAULT_FILTERS[key];
        });
    }

    // console.log(`initFilters: ${JSON.stringify(initFilters, null, 4)}`);
    return initFilters;
}

// Фильтрация данных
function applyFilters(data, filters) {
    // console.log(`filters: ${JSON.stringify(filters, null, 4)}\nfilters table data: ${JSON.stringify(data, null, 4)}`);

    const filteredData = data.filter(item =>
        Object.keys(filters).every(key => {
            const handler = FILTER_HANDLERS_CONF.get(key);
            return !handler || handler(filters[key], item[key]);
        })
    );

    console.log(`filteredData: ${JSON.stringify(filteredData, null, 4)}`);

    return filteredData;
}

export const useFiltersTable = (modeConfig, tableData, toggleState, setToggleState) => {
    const [activeFilters, setActiveFilters] = useState({});
    const [filteredData, setFilteredData] = useState([]);

    // Сброс фильтров
    const onResetFilters = () => {
        setToggleState(!toggleState);

        setActiveFilters(initializeFilters(tableData, modeConfig?.keys));
        setFilteredData(applyFilters(tableData, initializeFilters(tableData, modeConfig?.keys)));
    };

    // Изменение фильтров
    const onChangeFilter = e => {
        const tempFilters = Object.assign({}, activeFilters);
        tempFilters[e.target.id] = e.target.value;

        // console.log(`tempFilters: ${JSON.stringify(tempFilters, null, 4)}`);

        setActiveFilters(tempFilters);
        setFilteredData(applyFilters(tableData, tempFilters));
    };

    useEffect(() => {
        // console.log(`initFilters: ${JSON.stringify(initializeFilters(modeConfig?.keys), null, 4)}`);
        setActiveFilters(initializeFilters(tableData, modeConfig?.keys));
        setFilteredData(applyFilters(tableData, initializeFilters(tableData, modeConfig?.keys)));
    }, [modeConfig]);

    return { OPTIONS_FILTER_CONF, activeFilters, filteredData, onChangeFilter, onResetFilters };
};
