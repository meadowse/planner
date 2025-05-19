import { useState, useEffect } from 'react';

// Импорт кастомных хуков
import { useFiltersTable } from '@hooks/useFiltersTable';

// Импорт стилей
import './filters_table.css';

const FILTERS_CONF = {
    // Текстовые поля
    contractNum: (_, activeOption, toggleState, onChange) => {
        return (
            <InputTextFilter id="contractNum" placeholder="Номер договора" toggle={toggleState} onChange={onChange} />
        );
    },
    address: (_, activeOption, toggleState, onChange) => {
        return <InputTextFilter id="address" placeholder="Адрес" toggle={toggleState} onChange={onChange} />;
    },
    company: (_, activeOption, toggleState, onChange) => {
        return <InputTextFilter id="company" placeholder="Заказчик" toggle={toggleState} onChange={onChange} />;
    },
    group: (_, activeOption, toggleState, onChange) => {
        return <InputTextFilter id="group" placeholder="Группа" toggle={toggleState} onChange={onChange} />;
    },
    departure: (_, activeOption, toggleState, onChange) => {
        return <InputTextFilter id="departure" placeholder="00.00.00" toggle={toggleState} onChange={onChange} />;
    },
    pathToFolder: (_, activeOption, toggleState, onChange) => {
        return (
            <InputTextFilter id="pathToFolder" placeholder="Путь к папке" toggle={toggleState} onChange={onChange} />
        );
    },
    car: (_, activeOption, toggleState, onChange) => {
        return <InputTextFilter id="car" placeholder="Марка" toggle={toggleState} onChange={onChange} />;
    },
    subsection: (_, activeOption, toggleState, onChange) => {
        return <InputTextFilter id="subsection" placeholder="Подразделение" toggle={toggleState} onChange={onChange} />;
    },
    phone: (_, activeOption, toggleState, onChange) => {
        return <InputTextFilter id="phone" placeholder="Телефон" toggle={toggleState} onChange={onChange} />;
    },
    email: (_, activeOption, toggleState, onChange) => {
        return <InputTextFilter id="email" placeholder="Почта" toggle={toggleState} onChange={onChange} />;
    },
    // Выпадающие списки
    stage: (options, activeOption, toggleState, onChange) => {
        return (
            <DropDownFilter
                id="stage"
                defaultVal={activeOption}
                options={options}
                toggle={toggleState}
                onChange={onChange}
            />
        );
    },
    services: (options, activeOption, toggleState, onChange) => {
        return (
            <DropDownFilter
                id="services"
                defaultVal={activeOption}
                options={options}
                toggle={toggleState}
                onChange={onChange}
            />
        );
    },
    status: (options, activeOption, toggleState, onChange) => {
        return (
            <DropDownFilter
                id="status"
                defaultVal={activeOption}
                options={options}
                toggle={toggleState}
                onChange={onChange}
            />
        );
    },
    done: (options, activeOption, toggleState, onChange) => {
        return (
            <DropDownFilter
                id="done"
                defaultVal={activeOption}
                options={options}
                toggle={toggleState}
                onChange={onChange}
            />
        );
    },
    // dateDone: (options, activeOption, toggleState, onChange) => {
    //     return (
    //         <DropDownFilter
    //             id="dateDone"
    //             defaultVal={activeOption}
    //             options={options}
    //             toggle={toggleState}
    //             onChange={onChange}
    //         />
    //     );
    // },
    deadlineTask: (options, activeOption, toggleState, onChange) => {
        return (
            <DropDownFilter
                id="deadlineTask"
                defaultVal={activeOption}
                options={options}
                toggle={toggleState}
                onChange={onChange}
            />
        );
    },
    dateOfEnding: (options, activeOption, toggleState, onChange) => {
        return (
            <DropDownFilter
                id="dateOfEnding"
                defaultVal={activeOption}
                options={options}
                toggle={toggleState}
                onChange={onChange}
            />
        );
    },
    manager: (options, activeOption, toggleState, onChange) => {
        return (
            <DropDownFilter
                id="manager"
                defaultVal={activeOption}
                options={options}
                toggle={toggleState}
                onChange={onChange}
            />
        );
    },
    responsible: (options, activeOption, toggleState, onChange) => {
        return (
            <DropDownFilter
                id="responsible"
                defaultVal={activeOption}
                options={options}
                toggle={toggleState}
                onChange={onChange}
            />
        );
    },
    participants: (options, activeOption, toggleState, onChange) => {
        return (
            <DropDownFilter
                id="participants"
                defaultVal={activeOption}
                options={options}
                toggle={toggleState}
                onChange={onChange}
            />
        );
    },
    contacts: (options, activeOption, toggleState, onChange) => {
        return (
            <DropDownFilter
                id="contacts"
                defaultVal={activeOption}
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
    const [selectedItem, setSelectedItem] = useState({});

    function onSelectOption(e) {
        onChange(e);
        setSelectedItem(e.target.value);
    }

    useEffect(() => {
        setSelectedItem(defaultVal);
    }, [defaultVal]);

    useEffect(() => {
        setSelectedItem(defaultVal);
    }, [toggle]);

    return (
        <select id={id} className="dropdown_filter" value={selectedItem} onChange={onSelectOption}>
            {options &&
                options.length !== 0 &&
                options.map(value => (
                    <option key={value} value={value} selected={value === selectedItem}>
                        {value}
                    </option>
                ))}
        </select>
    );
}

function Cell(props) {
    const { keyVal, options, activeFilters, toggleState, onChangeFilter } = props;

    return FILTERS_CONF[keyVal] ? (
        <td className="table-mode__thead-td">
            {FILTERS_CONF[keyVal](options, activeFilters[keyVal], toggleState, onChangeFilter)}
        </td>
    ) : (
        <td className="table-mode__thead-td"></td>
    );
}

export default function FiltersTable(props) {
    const { keys, activeFilters, optionsFilter, data, toggleState, onChangeFilter, onResetFilters } = props;

    return data && data.length !== 0 ? (
        <>
            <tr className="table-mode__thead-tr-reset-filters">
                <td colSpan={9} className="table-mode__thead-td-reset-filters">
                    <p onClick={onResetFilters}>Сбросить фильтры</p>
                </td>
            </tr>
            <tr className="table-mode__thead-tr-filters">
                {keys.map(key => {
                    const options = optionsFilter[key] ? optionsFilter[key](data) : null;
                    return (
                        <Cell
                            key={key}
                            keyVal={key}
                            options={options}
                            activeFilters={activeFilters}
                            toggleState={toggleState}
                            onChangeFilter={onChangeFilter}
                        />
                    );
                })}
            </tr>
        </>
    ) : null;
}
