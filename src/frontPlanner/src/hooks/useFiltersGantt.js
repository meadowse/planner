import { useEffect, useState } from 'react';

// Импорт конфигураций
import { INITIAL_FILTERS, FILTER_HANDLERS_CONF } from '@config/filtersgantt.config';

function applyFilters(keyData, data, filters) {
    console.log(`applyFilters\nfilters: ${JSON.stringify(filters, null, 4)}`);

    const FILTER_DATA_CONF = {
        contracts: () => {
            if (data && data.length !== 0) {
                const filteredData = data?.filter(item =>
                    Object.keys(filters).every(key => {
                        const handler = FILTER_HANDLERS_CONF.get(key);
                        return !handler || handler(filters[key], item[key]);
                    })
                );
                // console.log(`Gantt filteredData: ${JSON.stringify(filteredData, null, 4)}`);
                // return filteredData
                return filteredData.length !== 0 ? filteredData : data;
            }
        },
        sections: () => {
            const newData = data.map(item => {
                return { section: item.section, employee: item.employee };
            });
            // console.log(`useFiltersGantt newData: ${JSON.stringify(newData, null, 4)}`);

            data.forEach((item, indItem) => {
                if (item.contracts && item.contracts.length !== 0) {
                    let filteredData = item.contracts.filter(contract =>
                        Object.keys(filters).every(key => {
                            const handler = FILTER_HANDLERS_CONF.get(key);
                            return !handler || handler(filters[key], contract[key]);
                        })
                    );
                    newData[indItem].contracts = filteredData;
                }
            });

            // return newData;
            return newData.length !== 0 ? newData : data;
        }
    };

    return FILTER_DATA_CONF[keyData] ? FILTER_DATA_CONF[keyData]() : data;
}

export const useFiltersGantt = (modeOption, data) => {
    const [activeFilters, setActiveFilters] = useState(Object.assign({}, INITIAL_FILTERS));
    const [filteredData, setFilteredData] = useState(applyFilters(modeOption?.keyData, data, activeFilters) || []);

    const OPTIONS_FILTER_CONF = {
        stage: () => {
            if (modeOption?.keyData === 'contracts')
                return ['Все', ...Array.from(new Set(data.map(item => item?.stage?.title)))];
            if (modeOption?.keyData === 'sections') {
                const newData = [];
                data.forEach(item => {
                    if (item.contracts && item.contracts.length !== 0) {
                        item.contracts.forEach(contract => newData.push(contract?.stage?.title));
                    }
                });
                return ['Все', ...Array.from(new Set(newData))];
            }
        }
    };

    const onChangeFilter = e => {
        const tempFilters = Object.assign({}, activeFilters);
        tempFilters[e.target.id] = e.target.value;

        // console.log(`tempFilters: ${JSON.stringify(tempFilters, null, 4)}`);

        setActiveFilters(tempFilters);
        setFilteredData(applyFilters(modeOption?.keyData, data, tempFilters));
    };

    useEffect(() => {
        setActiveFilters(Object.assign({}, INITIAL_FILTERS));
        setFilteredData(applyFilters(modeOption?.keyData, data, Object.assign({}, INITIAL_FILTERS)));
    }, [modeOption]);

    return { OPTIONS_FILTER_CONF, activeFilters, filteredData, onChangeFilter };
};
