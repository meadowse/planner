import classNames from 'classnames';

// Импорт доп.функционала
import { isObject, isArray } from '@helpers/helper';

const CELLS = {
    text: (value, additClass) => {
        return <p className={`cell__${additClass}`}>{value ? value : 'Нет данных'}</p>;
    },
    user: (value, additClass) => {
        return (
            <div className={`cell__${additClass}`}>
                <img className={`cell__${additClass}-photo`} src={value?.photo} alt="" />
                <div className={`cell__${additClass}-info`}>
                    <h2 className={`cell__${additClass}-fullname`}>{value?.fullName || 'Нет данных'}</h2>
                    {value?.post ? <p className={`cell__${additClass}-post`}>{value?.post}</p> : null}
                    {value?.phone ? (
                        <p className={`cell__${additClass}-phone`}>{value?.phone || 'Нет данных'}</p>
                    ) : null}
                </div>
            </div>
        );
    }
};

const COLUMNS = [
    {
        Header: 'Номер договора',
        accessor: 'contractNum',
        sortable: false,
        sortBy: undefined,
        Cell: props => {
            return Object.keys(props).length !== 0 && props.value ? CELLS['text'](props.value, 'num') : 'Нет данных';
        }
    },
    {
        Header: 'Адрес',
        accessor: 'address',
        sortable: false,
        sortBy: undefined,
        Cell: props => {
            return (
                <p className="cell__address cell">
                    <span>{Object.keys(props).length !== 0 && props.value ? props?.value : 'Нет данных'}</span>
                </p>
            );
        }
    },
    {
        Header: 'Группа / Ответственный',
        accessor: 'group',
        sortable: false,
        sortBy: undefined,
        Cell: props => {
            return (
                <p className="cell__group cell">
                    {Object.keys(props).length !== 0 && props.value ? props?.value : 'Нет данных'}
                </p>
            );
        }
    },
    {
        Header: 'Кто выезжает',
        accessor: 'participants',
        sortable: false,
        sortBy: undefined,
        Cell: props => {
            return (
                <>
                    {Object.keys(props).length === 0 || !props.value || (props.value.length === 0 && <p>Нет данных</p>)}
                    {props?.value && props?.value.length !== 0 && (
                        <ul className="cell__participants cell">
                            {props.value.map(participant => {
                                return CELLS['user'](participant, 'person');
                            })}
                        </ul>
                    )}
                </>
            );
        }
    },
    {
        Header: 'Стадия',
        accessor: 'stage',
        sortable: true,
        sortBy: 'title',
        Cell: props => {
            return Object.keys(props).length !== 0 && props?.value ? (
                <p className="cell__stage cell" style={{ backgroundColor: props?.value?.color }}>
                    {props?.value?.title}
                </p>
            ) : (
                'Нет данных'
            );
        }
    },
    {
        Header: 'Статус',
        accessor: 'status',
        sortable: true,
        sortBy: 'title',
        Cell: props => {
            return Object.keys(props).length !== 0 && props?.value ? (
                <p className="cell__stage cell" style={{ backgroundColor: props?.value?.color }}>
                    {props?.value?.title}
                </p>
            ) : (
                'Нет данных'
            );
        }
    },
    {
        Header: 'Даты выездов',
        accessor: 'departure',
        sortable: true,
        sortBy: undefined,
        Cell: props => {
            return Object.keys(props).length !== 0 ? CELLS['text'](props?.value, 'depart-date') : 'Нет данных';
        }
    },
    {
        Header: 'Контакт для связи',
        accessor: 'contacts',
        sortable: false,
        sortBy: undefined,
        Cell: props => {
            return Object.keys(props).length !== 0 ? (
                <div className="cell__contacts cell">
                    {props.value &&
                        props.value.length !== 0 &&
                        props.value.map(contact => (
                            <>
                                <p>{contact?.fullName || 'Нет данных'}</p>
                                <p>{contact?.phone || 'Нет данных'}</p>
                            </>
                        ))}
                    {!props.value || (props.value.length === 0 && <p>Нет данных</p>)}
                </div>
            ) : (
                'Нет данных'
            );
        }
    },
    {
        Header: 'Автомобиль',
        accessor: 'car',
        sortable: false,
        sortBy: undefined,
        Cell: props => {
            return Object.keys(props).length !== 0 && props?.value ? (
                <>
                    {Object.keys(props.value).length !== 0 ? (
                        <p className="cell__car cell">
                            {props?.value?.stamp || 'Нет данных' + ' ' + props?.value?.numCar || 'Нет данных'}
                        </p>
                    ) : (
                        'Нет данных'
                    )}
                </>
            ) : (
                'Нет данных'
            );
        }
    },
    {
        Header: 'Услуга',
        accessor: 'services',
        sortable: true,
        sortBy: 'title',
        Cell: props => {
            return Object.keys(props).length !== 0 ? CELLS['text'](props?.value?.title, 'services') : 'Нет данных';
        }
    },
    {
        Header: 'Срок',
        accessor: 'dateOfEnding',
        sortable: true,
        sortBy: 'value',
        Cell: props => {
            if (Object.keys(props).length !== 0) {
                if (props?.value?.value) return CELLS['text'](props?.value?.value, props?.value?.expired ? 'date_expired' : 'date')
            }
            return 'Нет данных';
        }
    },
    {
        Header: 'Путь к папке',
        accessor: 'pathToFolder',
        sortable: false,
        sortBy: undefined,
        Cell: props => {
            return (
                Object.keys(props).length !== 0 && (
                    <div className="cell__path-to-folder cell">
                        <p>{props?.value || 'Нет данных'}</p>
                        <button className="cell__btn-copy-path">
                            <img src="/img/copy.svg" alt="" />
                        </button>
                    </div>
                )
            );
        }
    },
    {
        Header: 'Сотрудник',
        accessor: 'responsible',
        sortable: true,
        sortBy: 'fullName',
        Cell: props => {
            return props?.value && Object.keys(props).length !== 0 && Object.keys(props?.value).length !== 0
                ? CELLS['user'](props?.value, 'person')
                : 'Нет данных';
        }
    },
    {
        Header: 'Подразделение',
        accessor: 'subsection',
        sortable: false,
        sortBy: undefined,
        Cell: props => {
            return Object.keys(props).length !== 0 ? CELLS['text'](props?.value, 'subsection') : 'Нет данных';
        }
    },
    {
        Header: 'Телефон',
        accessor: 'phone',
        sortable: false,
        sortBy: undefined,
        Cell: props => {
            return Object.keys(props).length !== 0 ? CELLS['text'](props?.value, 'phone') : 'Нет данных';
        }
    },
    {
        Header: 'Почта',
        accessor: 'email',
        sortable: false,
        sortBy: undefined,
        Cell: props => {
            return Object.keys(props).length !== 0 ? CELLS['text'](props?.value, 'email') : 'Нет данных';
        }
    },
    {
        Header: 'Название прибора',
        accessor: 'equipment',
        sortable: true,
        sortBy: undefined,
        Cell: props => {
            return Object.keys(props).length !== 0 ? (
                <div className="cell__equipment cell">
                    <img className="cell__equipment-image" src={props?.value?.image} alt="" />
                    <p className="cell__equipment-text">
                        {props?.value?.title}
                        <span>{props?.value?.model}</span>
                    </p>
                </div>
            ) : (
                'Нет данных'
            );
        }
    },
    {
        Header: 'Дата',
        accessor: 'dates',
        sortable: false,
        sortBy: undefined,
        Cell: props => {
            if (isObject(props.value) && Object.keys(props.value).length !== 0) {
                return (
                    <ul className="cell__dates cell">
                        <li className="cell__dates-item">c{CELLS['text'](props?.value?.start, 'dates-item-value')}</li>
                        <li className="cell__dates-item">по{CELLS['text'](props?.value?.end, 'dates-item-value')}</li>
                    </ul>
                );
            }
            if (isArray(props.value) && props.value.length !== 0) {
                return (
                    <div className="cell__dates-wrapper">
                        <ul className="cell__dates cell">
                            {props.value.map(item => (
                                <li className="cell__dates-item">{CELLS['text'](item, 'dates-item-value')}</li>
                            ))}
                        </ul>
                    </div>
                );
            }
        }
    },
    {
        Header: 'Местоположение',
        accessor: 'location',
        sortable: true,
        sortBy: undefined,
        Cell: props => {
            return props?.value && props?.value.length !== 0 ? (
                <div className="cell__locations-wrapper cell">
                    <ul className="cell__locations cell">
                        {props?.value.map(item => (
                            <li className="cell__location">{item}</li>
                        ))}
                    </ul>
                </div>
            ) : null;
        }
    }
];

export default function getSampleColumns(keys, partition) {
    const filteredData = COLUMNS.filter(column => keys.indexOf(column.accessor) >= 0);
    const data = new Array(keys.length).fill({});

    for (let i = 0; i < keys.length; i++) {
        for (let j = 0; j < filteredData.length; j++) {
            if (keys[i] === filteredData[j].accessor) {
                data[i] = filteredData[j];
                break;
            }
        }
    }
    return data;
}
