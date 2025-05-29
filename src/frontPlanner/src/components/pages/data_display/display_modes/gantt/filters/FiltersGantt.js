import { useState } from 'react';

// Импорт стилей
import './filters_gantt.css';

const FILTERS_CONF = {
    stage: (options, activeOption, toggleState, onChange) => {
        return (
            <DropDownFilter
                id="stage"
                className="gantt-filter__stage gantt-filter"
                defaultVal={activeOption}
                options={options}
                toggle={toggleState}
                onChange={onChange}
            />
        );
    }
};

// Компонент выпадающего списка
function DropDownFilter(props) {
    const { id, className, defaultVal, options, toggle, onChange } = props;

    function onSelectOption(e) {
        onChange(e);
    }

    // useEffect(() => {
    //     setSelectedItem(defaultVal);
    // }, [toggle]);

    return (
        <select id={id} className={className} onChange={onSelectOption}>
            {options &&
                options.length !== 0 &&
                options.map(value => (
                    <option key={value} value={value} selected={value === defaultVal}>
                        {value}
                    </option>
                ))}
        </select>
    );
}

export default function FiltersGantt(props) {
    const { activeFilters, optionsFilter, keys, data, onChangeFilter } = props;
    // console.log(`FiltersGantt activeFilters: ${JSON.stringify(activeFilters, null, 4)}`);

    const [toggleState, setToggleState] = useState(false);

    return (
        <div className="gantt-mode__filters">
            <div className="gantt-mode__filters-list">
                {keys && keys.length !== 0
                    ? keys.map(key => {
                          const options = optionsFilter[key] ? optionsFilter[key](data) : [];
                          return FILTERS_CONF[key]
                              ? FILTERS_CONF[key](options, activeFilters[key], toggleState, onChangeFilter)
                              : null;
                      })
                    : null}
            </div>
        </div>
    );
}
