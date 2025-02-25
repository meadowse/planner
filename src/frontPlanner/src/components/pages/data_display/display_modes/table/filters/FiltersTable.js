import { useState, useEffect } from 'react';

// Импорт конфигураций
import { FILTER_HANDLERS_CONF } from '@config/filterstable.config';

// Импорт стилей
import './filters_table.css';

const activeFilters = {};

const FILTERS_CONF = {
    // Текстовые поля
    address: (_, toggleState, onChange) => {
        return <InputTextFilter id="address" placeholder={'Адрес'} toggle={toggleState} onChange={onChange} />;
    },
    group: (_, toggleState, onChange) => {
        return <InputTextFilter id="group" placeholder={'Группа'} toggle={toggleState} onChange={onChange} />;
    },
    dateOfEnding: (_, toggleState, onChange) => {
        return <InputTextFilter id="dateOfEnding" placeholder={'00.00.00'} toggle={toggleState} onChange={onChange} />;
    },
    departure: (_, toggleState, onChange) => {
        return <InputTextFilter id="departure" placeholder={'00.00.00'} toggle={toggleState} onChange={onChange} />;
    },
    pathToFolder: (_, toggleState, onChange) => {
        return (
            <InputTextFilter id="pathToFolder" placeholder={'Путь к папке'} toggle={toggleState} onChange={onChange} />
        );
    },
    car: (_, toggleState, onChange) => {
        return <InputTextFilter id="car" placeholder={'Марка'} toggle={toggleState} onChange={onChange} />;
    },
    responsible: (_, toggleState, onChange) => {
        return <InputTextFilter id="responsible" placeholder={'Сотрудник'} toggle={toggleState} onChange={onChange} />;
    },
    subsection: (_, toggleState, onChange) => {
        return (
            <InputTextFilter id="subsection" placeholder={'Подразделение'} toggle={toggleState} onChange={onChange} />
        );
    },
    phone: (_, toggleState, onChange) => {
        return <InputTextFilter id="phone" placeholder={'Телефон'} toggle={toggleState} onChange={onChange} />;
    },
    email: (_, toggleState, onChange) => {
        return <InputTextFilter id="email" placeholder={'Почта'} toggle={toggleState} onChange={onChange} />;
    },
    // Выпадающие списки
    stage: (options, toggleState, onChange) => {
        return (
            <DropDownFilter id="stage" defaultVal="Все" options={options} toggle={toggleState} onChange={onChange} />
        );
    },
    services: (options, toggleState, onChange) => {
        return (
            <DropDownFilter id="services" defaultVal="Все" options={options} toggle={toggleState} onChange={onChange} />
        );
    },
    status: (options, toggleState, onChange) => {
        return (
            <DropDownFilter id="status" defaultVal="Все" options={options} toggle={toggleState} onChange={onChange} />
        );
    },
    participants: (options, toggleState, onChange) => {
        return (
            <DropDownFilter
                id="participants"
                defaultVal="Выбрать"
                options={options}
                toggle={toggleState}
                onChange={onChange}
            />
        );
    },
    contacts: (options, toggleState, onChange) => {
        return (
            <DropDownFilter
                id="contacts"
                defaultVal="Выбрать"
                options={options}
                toggle={toggleState}
                onChange={onChange}
            />
        );
    }
};

// Компонент текстового поля
function InputTextFilter(props) {
    const { id, placeholder, toggle, onChange } = props;
    const [enteredText, setEnteredText] = useState('');

    function onChangeText(e) {
        onChange(e);
        setEnteredText(e.target.value);
    }

    useEffect(() => {
        setEnteredText('');
    }, [toggle]);

    return (
        <input
            id={id}
            className="table-mode__filters-inpt-filter"
            type="text"
            value={enteredText}
            placeholder={placeholder}
            onChange={e => onChangeText(e)}
        />
    );
}

// Компонент выпадающего списка
function DropDownFilter(props) {
    const { id, defaultVal, options, toggle, onChange } = props;
    const [selected, setSelected] = useState(defaultVal);

    function onSelectOption(e) {
        onChange(e);
        setSelected(e.target.value);
    }

    useEffect(() => {
        setSelected(defaultVal);
    }, [toggle]);

    return (
        <select id={id} className="dropdown_filter" value={selected} onChange={e => onSelectOption(e)}>
            <option key={defaultVal} value={defaultVal}>
                {defaultVal}
            </option>
            {options &&
                options.length !== 0 &&
                options.map(value => (
                    <option key={value} value={value}>
                        {value}
                    </option>
                ))}
        </select>
    );
}

const applyFilters = (data, filters) => {
    // console.log(`filters: ${JSON.stringify(filters, null, 4)}\nfilters table data: ${JSON.stringify(data, null, 4)}`);

    const filteredData = data.filter(item =>
        Object.keys(filters).every(key => {
            const handler = FILTER_HANDLERS_CONF.get(key);
            return !handler || handler(filters[key], item[key]);
        })
    );

    console.log(`filteredData: ${JSON.stringify(filteredData, null, 4)}`);

    return filteredData;
};

function Cell(props) {
    const { keyVal, options, toggleState, onChangeFilter } = props;

    return FILTERS_CONF[keyVal] ? (
        <td className="table-mode__thead-td">{FILTERS_CONF[keyVal](options, toggleState, onChangeFilter)}</td>
    ) : (
        <td className="table-mode__thead-td"></td>
    );
}

export default function FiltersTable(props) {
    const { keys, data, setData } = props;
    const [toggleState, setToggleState] = useState(false);

    console.log(`keys: ${JSON.stringify(keys, null, 4)}`);

    const OPTIONS_FILTER_MAP = {
        services: data => {
            return Array.from(
                new Set(
                    data.map(item => item.services && Object.keys(item.services).length !== 0 && item.services?.title)
                )
            );
        },
        stage: data => {
            return Array.from(new Set(data.map(item => item?.stage?.title)));
        }
    };

    function onResetFilters() {
        setToggleState(!toggleState);
        setData(data);
        // Очищение объекта
        Object.keys(activeFilters).map(key => delete activeFilters[key]);
    }

    function onChangeFilter(e) {
        activeFilters[e.target.id] = e.target.value;
        // console.log(`activeFilters: ${JSON.stringify(activeFilters, null, 4)}`);
        setData([...applyFilters(data, activeFilters)]);
    }

    return (
        <>
            <tr className="table-mode__thead-tr-reset-filters">
                <td colSpan={8} className="table-mode__thead-td-reset-filters">
                    <p onClick={onResetFilters}>Сбросить фильтры</p>
                </td>
            </tr>
            <tr className="table-mode__thead-tr-filters">
                {keys.map(key => {
                    const options = OPTIONS_FILTER_MAP[key] ? OPTIONS_FILTER_MAP[key](data) : null;
                    return (
                        <Cell
                            key={key}
                            keyVal={key}
                            options={options}
                            toggleState={toggleState}
                            onChangeFilter={onChangeFilter}
                        />
                    );
                    // return FILTERS_CONF[key] ? (
                    //     <td key={key} className="table-mode__thead-td">
                    //         {FILTERS_CONF[key](options, toggleState, onChangeFilter)}
                    //     </td>
                    // ) : (
                    //     <td key={key} className="table-mode__thead-td"></td>
                    // );
                })}
            </tr>
        </>
    );
}
