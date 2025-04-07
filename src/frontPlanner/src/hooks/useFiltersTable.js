import { useEffect, useState } from 'react';

// Импорт конфигураций
import { INITIAL_FILTERS, OPTIONS_FILTER_CONF, FILTER_HANDLERS_CONF } from '@config/filterstable.config';

// Инициализация фильтров
function initializeFilters(keys) {
    const initFilters = {};
    if (keys && keys.length !== 0) {
        keys.forEach(key => (initFilters[key] = INITIAL_FILTERS[key]));
    }
    console.log(`initFilters: ${JSON.stringify(initFilters, null, 4)}`);
    return initFilters;
}

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

export const useFiltersTable = (modeConfig, tableData, toggleState, setToggleState) => {
    const [activeFilters, setActiveFilters] = useState({});
    const [filteredData, setFilteredData] = useState([]);

    // Сброс фильтров
    const onResetFilters = () => {
        setToggleState(!toggleState);

        setActiveFilters(initializeFilters(modeConfig?.keys));
        setFilteredData(applyFilters(tableData, initializeFilters(modeConfig?.keys)));
        // setActiveFilters(Object.assign({}, INITIAL_FILTERS));
        // setFilteredData(applyFilters(tableData, INITIAL_FILTERS));
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
        setActiveFilters(initializeFilters(modeConfig?.keys));
        setFilteredData(applyFilters(tableData, initializeFilters(modeConfig?.keys)));
    }, [modeConfig]);

    return { OPTIONS_FILTER_CONF, activeFilters, filteredData, onChangeFilter, onResetFilters };
};
