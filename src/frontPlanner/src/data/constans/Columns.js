import { Fragment, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import axios from 'axios';
import classNames from 'classnames';

// Импорт компонентов
import TaskPopup from '@components/pages/data_display/data_form/tabs/tab_work/popups/task/TaskPopup';

// Импорт доп.функционала
import { isObject, isArray } from '@helpers/helper';

const CELLS = {
    text: (value, additClass) => {
        return <p className={`cell__${additClass}`}>{value ? value : 'Нет данных'}</p>;
    },
    longtext: (value, additClass, refCell) => {
        return value ? (
            <p className={`cell__${additClass}`} ref={refCell} onMouseLeave={() => refCell?.current.scrollTo(0, 0)}>
                <span>{value}</span>
            </p>
        ) : (
            'Нет данных'
        );
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
        Header: '№',
        accessor: 'id',
        sortable: false,
        sortBy: undefined,
        Cell: props => {
            return props.value ? CELLS['text'](props.value, 'id') : 'Нет данных';
        }
    },
    {
        Header: 'Номер договора',
        accessor: 'contractNum',
        sortable: false,
        sortBy: undefined,
        Cell: props => {
            const navigate = useNavigate();

            async function onShowInfoCard() {
                await axios
                    .post(`${window.location.origin}/api/getAgreement`, { contractId: props?.config?.contractId })
                    .then(response => {
                        if (response?.status === 200) {
                            const navigationArg = {
                                state: {
                                    partition: props?.config?.partition,
                                    data: response?.data[0],
                                    dataOperation: props?.config?.dataOperation
                                }
                            };
                            navigate('../../dataform/', navigationArg);
                        }
                    });
            }

            return props.value ? (
                <p className="cell__num" onClick={onShowInfoCard}>
                    {props.value ? props.value : 'Нет данных'}
                </p>
            ) : (
                'Нет данных'
            );
        }
    },
    {
        Header: 'Адрес',
        accessor: 'address',
        sortable: false,
        sortBy: undefined,
        Cell: props => {
            const refCell = useRef();
            return CELLS?.longtext(props?.value, 'address', refCell);
        }
    },
    {
        Header: 'Заказчик',
        accessor: 'company',
        sortable: false,
        sortBy: undefined,
        Cell: props => {
            return props.value ? CELLS['text'](props.value, 'company') : 'Нет данных';
        }
    },
    {
        Header: 'Группа / Ответственный',
        accessor: 'group',
        sortable: false,
        sortBy: undefined,
        Cell: props => {
            return <p className="cell__group cell">{props.value ? props?.value : 'Нет данных'}</p>;
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
            return props?.value ? (
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
            return props?.value ? (
                <p className="cell__stage cell" style={{ backgroundColor: props?.value?.color }}>
                    {props?.value?.title}
                </p>
            ) : (
                'Нет данных'
            );
        }
    },
    {
        Header: 'Контакт для связи',
        accessor: 'contacts',
        sortable: false,
        sortBy: undefined,
        Cell: props => {
            return (
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
            );
        }
    },
    {
        Header: 'Автомобиль',
        accessor: 'car',
        sortable: false,
        sortBy: undefined,
        Cell: props => {
            return props?.value ? (
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
            return CELLS['text'](props?.value?.title, 'services');
        }
    },
    {
        Header: 'Срок',
        accessor: 'dateOfEnding',
        sortable: true,
        sortBy: 'value',
        Cell: props => {
            if (props?.value?.value) {
                return !props?.value?.expired
                    ? CELLS['text'](props?.value?.value, 'date')
                    : CELLS['text'](props?.value?.value, 'date_expired');
            }
            return 'Нет данных';
        }
        // Cell: props => {
        //     return  ? CELLS['text'](props?.value?.value, 'date') : 'Нет данных';
        // }
    },
    {
        Header: 'Путь к папке',
        accessor: 'pathToFolder',
        sortable: false,
        sortBy: undefined,
        Cell: props => {
            const refCell = useRef();
            return (
                <div className="cell__path-to-folder cell">
                    {CELLS?.longtext(props?.value, 'cell__path-to-folder', refCell)}
                    <button className="cell__btn-copy-path">
                        <img src="/img/copy.svg" alt="" />
                    </button>
                </div>
            );
        }
    },
    {
        Header: 'Сотрудник',
        accessor: 'responsible',
        sortable: true,
        sortBy: 'fullName',
        Cell: props => {
            return props?.value && Object.keys(props?.value).length !== 0
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
            return CELLS['text'](props?.value, 'subsection');
        }
    },
    {
        Header: 'Телефон',
        accessor: 'phone',
        sortable: false,
        sortBy: undefined,
        Cell: props => {
            return CELLS['text'](props?.value, 'phone');
        }
    },
    {
        Header: 'Почта',
        accessor: 'email',
        sortable: false,
        sortBy: undefined,
        Cell: props => {
            return CELLS['text'](props?.value, 'email');
        }
    },
    {
        Header: 'Название прибора',
        accessor: 'equipment',
        sortable: true,
        sortBy: undefined,
        Cell: props => {
            return (
                <div className="cell__equipment cell">
                    <img className="cell__equipment-image" src={props?.value?.image} alt="" />
                    <p className="cell__equipment-text">
                        {props?.value?.title}
                        <span>{props?.value?.model}</span>
                    </p>
                </div>
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
    },
    //
    {
        Header: 'Номер',
        accessor: 'number',
        sortable: false,
        sortBy: undefined,
        Cell: props => {
            return props.value ? CELLS['text'](props.value, 'number') : 'Нет данных';
        }
    },
    {
        Header: 'Вид работы',
        accessor: 'typeWork',
        sortable: false,
        sortBy: undefined,
        Cell: props => {
            const refCell = useRef();
            return CELLS?.longtext(props?.value, 'cell__typework-text', refCell);
        }
    },
    {
        Header: 'Срок',
        accessor: 'deadline',
        sortable: false,
        sortBy: undefined,
        Cell: props => {
            return CELLS['text'](`${props?.value} дней`, 'deadline');
        }
    },
    {
        Header: 'Дата выполнения',
        accessor: 'dateDone',
        sortable: true,
        sortBy: 'value',
        Cell: props => {
            return CELLS['text'](props?.value, 'date');
        }
    },
    {
        Header: 'Завершено',
        accessor: 'done',
        sortable: false,
        sortBy: undefined,
        Cell: props => {
            return (
                <div
                    className={classNames('cell__checkmark cell', { 'cell__checkmark_completed': props?.value })}
                ></div>
            );
        }
    },
    //
    {
        Header: props => {
            const [addTaskState, setAddTaskState] = useState(false);
            return (
                <>
                    <div className="cell__task-title">
                        Задача
                        <button className="cell__task-title-btn" onClick={() => setAddTaskState(true)}>
                            +
                        </button>
                    </div>
                    {addTaskState &&
                        createPortal(
                            <TaskPopup
                                additClass="add-task"
                                title="Новая задача"
                                data={{ idContract: props?.config?.idContract, task: props?.config?.task }}
                                operation="creation"
                                addTaskState={addTaskState}
                                setAddTaskState={setAddTaskState}
                            />,
                            document.getElementById('portal')
                        )}
                </>
            );
        },
        accessor: 'task',
        sortable: false,
        sortBy: undefined,
        Cell: props => {
            const refCell = useRef();
            const [addTaskState, setAddTaskState] = useState(false);
            return (
                <>
                    <p
                        className="cell__task"
                        ref={refCell}
                        onMouseLeave={() => refCell?.current.scrollTo(0, 0)}
                        onClick={() => setAddTaskState(true)}
                    >
                        <span>{props?.value}</span>
                    </p>
                    {addTaskState &&
                        createPortal(
                            <TaskPopup
                                additClass="add-task"
                                title="Редактирование задачи"
                                data={{ idContract: props?.config?.idContract, task: props?.config?.task }}
                                operation="update"
                                addTaskState={addTaskState}
                                setAddTaskState={setAddTaskState}
                            />,
                            document.getElementById('portal')
                        )}
                </>
            );
        }
    },
    {
        Header: 'Постановщик',
        accessor: 'director',
        sortable: false,
        sortBy: undefined,
        Cell: props => {
            return props?.value && Object.keys(props?.value).length !== 0
                ? CELLS['user'](props?.value, 'person')
                : 'Нет данных';
        }
    },
    {
        Header: 'Исполнитель',
        accessor: 'executor',
        sortable: false,
        sortBy: undefined,
        Cell: props => {
            return props?.value && Object.keys(props?.value).length !== 0
                ? CELLS['user'](props?.value, 'person')
                : 'Нет данных';
        }
    },
    {
        Header: 'Дедлайн',
        accessor: 'deadlineTask',
        sortable: true,
        sortBy: 'value',
        Cell: props => {
            return CELLS['text'](props?.value, 'date');
        }
    }
];

export default function getSampleColumns(keys) {
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
