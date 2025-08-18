import { useEffect, useState } from 'react';

// Импорт конфигураций
import {
    DEFAULT_FILTERS,
    INITIAL_FILTERS,
    KEYS_FOR_STORAGE,
    OPTIONS_FILTER_CONF,
    FILTER_HANDLERS_CONF
} from '@config/filterstable.config';

// Инициализация фильтров
function initializeFilters(data, keys) {
    const initFilters = {};

    if (keys && keys.length !== 0) {
        keys.forEach(key => {
            if (key in DEFAULT_FILTERS) initFilters[key] = DEFAULT_FILTERS[key];
        });

        Object.keys(INITIAL_FILTERS).map(key => {
            if (initFilters[key]) {
                const options = OPTIONS_FILTER_CONF[key](data);
                console.log(`options[${key}]: ${JSON.stringify(options, null, 4)}`);
                if (options && options.length !== 0) {
                    if (!options.includes(INITIAL_FILTERS[key])) initFilters[key] = DEFAULT_FILTERS[key];
                    else initFilters[key] = INITIAL_FILTERS[key];
                }
            }
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

    // console.log(`filteredData: ${JSON.stringify(filteredData, null, 4)}`);

    return filteredData;
}

export const useFiltersTable = (modeConfig, tableData, toggleState, setToggleState) => {
    const [activeFilters, setActiveFilters] = useState({});
    const [filteredData, setFilteredData] = useState([]);
    const { keys, mode, option, partition, dataOperations } = modeConfig;

    const savedFilters = JSON.parse(localStorage.getItem('listmode-filters')) ?? {};

    // Сброс фильтров
    const onResetFilters = () => {
        setToggleState(!toggleState);

        if (partition in KEYS_FOR_STORAGE) {
            const keyStorage = KEYS_FOR_STORAGE[partition](mode?.key, option?.key);

            savedFilters[keyStorage] = initializeFilters(tableData, keys);
            localStorage.setItem('listmode-filters', JSON.stringify(savedFilters));

            setActiveFilters(savedFilters[keyStorage]);
            setFilteredData(applyFilters(tableData, savedFilters[keyStorage]));
        }
    };

    // Изменение фильтров
    const onChangeFilter = e => {
        const tempFilters = Object.assign({}, activeFilters);
        tempFilters[e.target.id] = e.target.value;

        if (partition in KEYS_FOR_STORAGE) {
            const keyStorage = KEYS_FOR_STORAGE[partition](mode?.key, option?.key);

            savedFilters[keyStorage] = tempFilters;
            setActiveFilters(savedFilters[keyStorage]);
            setFilteredData(applyFilters(tableData, savedFilters[keyStorage]));

            localStorage.setItem('listmode-filters', JSON.stringify(savedFilters));
        }
    };

    useEffect(() => {
        // console.log(`initFilters: ${JSON.stringify(initializeFilters(modeConfig?.keys), null, 4)}`);
        console.log(`modeConfig: ${JSON.stringify(modeConfig, null, 4)}`);
        // console.log(`savedFilters: ${JSON.stringify(savedFilters, null, 4)}`);

        if (partition in KEYS_FOR_STORAGE) {
            const keyStorage = KEYS_FOR_STORAGE[partition](mode?.key, option?.key);
            console.log(`keyStorage: ${keyStorage}`);

            if (!savedFilters[keyStorage] || Object.keys(savedFilters[keyStorage]).length === 0) {
                savedFilters[keyStorage] = initializeFilters(tableData, keys);
                localStorage.setItem('listmode-filters', JSON.stringify(savedFilters));
            }

            setActiveFilters(savedFilters[keyStorage]);
            setFilteredData(applyFilters(tableData, savedFilters[keyStorage]));
        }
    }, [modeConfig]);

    return { OPTIONS_FILTER_CONF, activeFilters, filteredData, onChangeFilter, onResetFilters };
};
