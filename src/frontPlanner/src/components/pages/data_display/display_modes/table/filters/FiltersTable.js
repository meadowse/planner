import { useState, useEffect, useRef } from 'react';

// Импорт дополнительного функционала
import { isArray } from '@helpers/helper';

// Импорт стилей
import './filters_table.css';

const FILTERS_CONF = {
    // Текстовые поля
    contractNum: (_, activeOption, toggleState, onChange, onMultipleSelect) => {
        return (
            <InputTextFilter
                id="contractNum"
                placeholder="Номер договора"
                defaultVal={activeOption}
                toggle={toggleState}
                onChange={onChange}
            />
        );
    },
    address: (_, activeOption, toggleState, onChange, onMultipleSelect) => {
        return (
            <InputTextFilter
                id="address"
                placeholder="Адрес"
                defaultVal={activeOption}
                toggle={toggleState}
                onChange={onChange}
            />
        );
    },
    company: (_, activeOption, toggleState, onChange, onMultipleSelect) => {
        return (
            <InputTextFilter
                id="company"
                placeholder="Заказчик"
                defaultVal={activeOption}
                toggle={toggleState}
                onChange={onChange}
            />
        );
    },
    group: (_, activeOption, toggleState, onChange, onMultipleSelect) => {
        return (
            <InputTextFilter
                id="group"
                placeholder="Группа"
                defaultVal={activeOption}
                toggle={toggleState}
                onChange={onChange}
            />
        );
    },
    departure: (_, activeOption, toggleState, onChange, onMultipleSelect) => {
        return (
            <InputTextFilter
                id="departure"
                placeholder="00.00.00"
                defaultVal={activeOption}
                toggle={toggleState}
                onChange={onChange}
            />
        );
    },
    pathToFolder: (_, activeOption, toggleState, onChange, onMultipleSelect) => {
        return (
            <InputTextFilter
                id="pathToFolder"
                placeholder="Путь к папке"
                defaultVal={activeOption}
                toggle={toggleState}
                onChange={onChange}
            />
        );
    },
    car: (_, activeOption, toggleState, onChange, onMultipleSelect) => {
        return (
            <InputTextFilter
                id="car"
                placeholder="Марка"
                defaultVal={activeOption}
                toggle={toggleState}
                onChange={onChange}
            />
        );
    },
    subsection: (_, activeOption, toggleState, onChange, onMultipleSelect) => {
        return (
            <InputTextFilter
                id="subsection"
                placeholder="Подразделение"
                defaultVal={activeOption}
                toggle={toggleState}
                onChange={onChange}
            />
        );
    },
    phone: (_, activeOption, toggleState, onChange, onMultipleSelect) => {
        return (
            <InputTextFilter
                id="phone"
                placeholder="Телефон"
                defaultVal={activeOption}
                toggle={toggleState}
                onChange={onChange}
            />
        );
    },
    email: (_, activeOption, toggleState, onChange, onMultipleSelect) => {
        return (
            <InputTextFilter
                id="email"
                placeholder="Почта"
                defaultVal={activeOption}
                toggle={toggleState}
                onChange={onChange}
            />
        );
    },
    // Выпадающие списки
    stage: (options, activeOption, toggleState, onChange, onMultipleSelect) => {
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
    services: (options, activeOption, toggleState, onChange, onMultipleSelect) => {
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
    status: (options, activeOption, toggleState, onChange, onMultipleSelectFilter) => {
        return (
            <MultipleDropDownFilter
                id="status"
                defaultVal={activeOption}
                options={options}
                toggle={toggleState}
                onMultipleSelectFilter={onMultipleSelectFilter}
            />
        );
    },
    // status: (options, activeOption, toggleState, onChange) => {
    //     return (
    //         <DropDownFilter
    //             id="status"
    //             defaultVal={activeOption}
    //             options={options}
    //             toggle={toggleState}
    //             onChange={onChange}
    //         />
    //     );
    // },
    done: (options, activeOption, toggleState, onChange, onMultipleSelect) => {
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
    deadlineTask: (options, activeOption, toggleState, onChange, onMultipleSelect) => {
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
    dateOfEnding: (options, activeOption, toggleState, onChange, onMultipleSelect) => {
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
    manager: (options, activeOption, toggleState, onChange, onMultipleSelect) => {
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
    responsible: (options, activeOption, toggleState, onChange, onMultipleSelect) => {
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
    participants: (options, activeOption, toggleState, onChange, onMultipleSelect) => {
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
    contacts: (options, activeOption, toggleState, onChange, onMultipleSelect) => {
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
    const { id, placeholder, defaultVal, toggle, onChange } = props;
    // console.log(`InputTextFilter[${id}] defaultVal: ${defaultVal}`);
    const [enteredText, setEnteredText] = useState(defaultVal ?? null);

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
            className="table__filters-inpt-filter"
            type="text"
            // value={enteredText}
            value={defaultVal}
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
        <select id={id} className="table__dropdown-filter" value={selectedItem} onChange={onSelectOption}>
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

function MultipleDropDownFilter(props) {
    const { id, defaultVal, options, toggle, onMultipleSelectFilter } = props;

    // console.log(`MultipleDropDownFilter defaultVal: ${JSON.stringify(defaultVal, null, 4)}`);

    const [selectedOptions, setSelectedOptions] = useState([]);
    const refSelectList = useRef(null);

    // Выбор элемента из списка
    const handleChange = e => {
        const tempData = [...new Set([...selectedOptions, e?.target?.value])];

        if (tempData.includes('Все')) tempData.shift();

        onMultipleSelectFilter(e?.target?.id, tempData);
        setSelectedOptions(tempData);
    };

    // Удаление элемента
    const onDelete = indElem => {
        const tempData = [...selectedOptions];
        tempData.splice(indElem, 1);

        if (tempData.length === 0) tempData.push('Все');

        onMultipleSelectFilter('status', tempData);
        setSelectedOptions(tempData);
    };

    useEffect(() => {
        setSelectedOptions(defaultVal && defaultVal.length > 0 ? defaultVal : []);
    }, [defaultVal, toggle]);

    useEffect(() => {
        if (refSelectList.current) refSelectList.current.value = 'default';
    }, [selectedOptions]);

    return (
        <div className="table__dropdown-filter-wrapper">
            <select ref={refSelectList} id={id} className="table__dropdown-filter" value={null} onChange={handleChange}>
                <option value="default" selected disabled hidden>
                    Выберите статус
                </option>
                {options &&
                    options.length !== 0 &&
                    options.map(value => (
                        <option key={value} value={value}>
                            {value}
                        </option>
                    ))}
            </select>
            <div className="table__selected-filters-wrapper">
                <ul className="table__selected-filters-list">
                    {isArray(selectedOptions) &&
                        selectedOptions.length > 0 &&
                        selectedOptions?.map((option, ind) => (
                            <li className="table__selected-filters-list-item" key={option}>
                                <p>{option}</p>
                                <button onClick={() => onDelete(ind)}>&#215;</button>
                            </li>
                        ))}
                </ul>
            </div>
        </div>
    );
}

function Cell(props) {
    const { keyVal, options, activeFilter, toggleState, onChangeFilter, onMultipleSelectFilter } = props;

    return FILTERS_CONF[keyVal] ? (
        <td className="table-mode__thead-td">
            {FILTERS_CONF[keyVal](options, activeFilter, toggleState, onChangeFilter, onMultipleSelectFilter)}
        </td>
    ) : (
        <td className="table-mode__thead-td"></td>
    );
}

export default function FiltersTable(props) {
    const {
        keys,
        activeFilters,
        optionsFilter,
        data,
        toggleState,
        onChangeFilter,
        onMultipleSelectFilter,
        onResetFilters
    } = props;

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
                            activeFilter={activeFilters[key]}
                            toggleState={toggleState}
                            onChangeFilter={onChangeFilter}
                            onMultipleSelectFilter={onMultipleSelectFilter}
                        />
                    );
                })}
            </tr>
        </>
    ) : null;
}
