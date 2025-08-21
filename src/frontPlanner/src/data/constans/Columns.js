import { startTransition, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import classNames from 'classnames';

// Импорт компонентов
import TaskPopup from '@components/pages/data_display/data_form/tabs/tab_work/popups/task/TaskPopup';

// Импорт доп.функционала
import { isObject, isArray } from '@helpers/helper';
import { getDateFromString } from '@helpers/calendar';

//
import { useHistoryContext } from '../../contexts/history.context';

const CELLS = {
    text: (value, additClass) => {
        return <p className={`cell__${additClass}`}>{value ?? 'Нет данных'}</p>;
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
    user: (value, additClass, onClick) => {
        return (
            <div className={`cell__${additClass}`} onClick={onClick}>
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
            const { addToHistory } = useHistoryContext();

            function onShowInfoCard(event) {
                if (props?.config?.idContract) {
                    const navigationArg = {
                        state: {
                            idContract: props?.config?.idContract,
                            tabForm: { key: 'general', title: 'Общие' },
                            partition: props?.config?.partition,
                            dataOperation: props?.config?.dataOperation
                        }
                    };

                    localStorage.setItem('idContract', JSON.stringify(props?.config?.idContract));
                    localStorage.setItem('selectedTab', JSON.stringify({ key: 'general', title: 'Общие' }));

                    addToHistory(`${window.location.pathname}`);

                    if (event.button === 1) {
                        const url = `../../dataform/general?data=${encodeURIComponent(
                            JSON.stringify(navigationArg.state)
                        )}`;
                        window.open(url, '_blank');
                    } else navigate('../../dataform/general/', navigationArg);
                }
            }

            return (
                <p className="cell__num" onClick={e => onShowInfoCard(e)} onMouseDown={e => onShowInfoCard(e)}>
                    {props.value ? props.value : 'Нет данных'}
                </p>
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
        Header: 'Заказчик',
        accessor: 'customer',
        sortable: false,
        sortBy: undefined,
        Cell: props => {
            return props.value ? CELLS['text'](props.value, 'customer') : 'Нет данных';
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
                <p className="cell__status cell" style={{ backgroundColor: props?.value?.color }}>
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
    },
    {
        Header: 'Путь к папке',
        accessor: 'pathToFolder',
        sortable: false,
        sortBy: undefined,
        Cell: props => {
            const refCell = useRef();

            function onCopyToClipboard() {
                if (!navigator.clipboard) return;
                navigator.clipboard.writeText(props?.value);
            }

            return (
                <div className="cell__path-to-folder cell">
                    {CELLS?.longtext(props?.value, 'cell__path-to-folder', refCell)}
                    <button className="cell__btn-copy-path" onClick={onCopyToClipboard}>
                        <img src="/img/copy.svg" alt="" />
                    </button>
                </div>
            );
        }
    },
    {
        Header: 'Должность',
        accessor: 'post',
        sortable: false,
        sortBy: undefined,
        Cell: props => {
            return CELLS['text'](props?.value, 'post');
        }
    },
    // {
    //     Header: 'Подразделение',
    //     accessor: 'subsection',
    //     sortable: false,
    //     sortBy: undefined,
    //     Cell: props => {
    //         return CELLS['text'](props?.value, 'subsection');
    //     }
    // },
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
            if (isArray(props.value) && props.value.length !== 0) {
                const sortedDates = props.value.sort((dateA, dateB) => {
                    return new Date(getDateFromString(dateB?.end)) - new Date(getDateFromString(dateA?.end));
                });

                return (
                    <ul className="cell__dates cell">
                        <li className="cell__dates-item">
                            <h2>Дата последней поверки:</h2>
                            <div className="cell__dates-item-wrapper">
                                {CELLS['text'](sortedDates[1]?.start ?? 'Нет данных', 'dates-item-value')}
                                {CELLS['text'](sortedDates[1]?.end ?? 'Нет данных', 'dates-item-value')}
                            </div>
                        </li>
                        <li className="cell__dates-item">
                            <h2>Дата следующей поверки:</h2>
                            <div className="cell__dates-item-wrapper">
                                {CELLS['text'](sortedDates[0]?.start ?? 'Нет данных', 'dates-item-value')}
                                {CELLS['text'](sortedDates[0]?.end ?? 'Нет данных', 'dates-item-value')}
                            </div>
                        </li>
                    </ul>
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
                            <li className="cell__location">{item ?? 'Нет данных'}</li>
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
            return props?.value
                ? CELLS['text'](`${props?.value} дней`, 'deadline')
                : CELLS['text']('Нет данных', 'deadline');
        }
    },
    {
        Header: 'Дата выполнения',
        accessor: 'dateDone',
        sortable: true,
        sortBy: 'value',
        Cell: props => {
            if (props?.value) {
                return !props?.value?.expired
                    ? CELLS['text'](props?.value?.value, 'date')
                    : CELLS['text'](props?.value?.value, 'date_expired');
            }
            return CELLS['text']('Нет данных', 'date');
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
                                data={{
                                    idContract: props?.config?.idContract,
                                    tasks: props?.config?.tasks,
                                    task: props?.config?.task
                                    // contractsIDs: props?.config?.contractsIDs
                                }}
                                operation="creation"
                                addTaskState={addTaskState}
                                setAddTaskState={setAddTaskState}
                            />,
                            document.getElementById('root')
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
            console.log(`Original task: ${JSON.stringify(props?.row?.original, null, 4)}`);
            return (
                <>
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            columnGap: '5px',
                            paddingLeft: `${props?.row?.depth * 20}px`
                        }}
                    >
                        <p
                            className="cell__task"
                            ref={refCell}
                            onMouseLeave={() => refCell?.current.scrollTo(0, 0)}
                            onClick={() => setAddTaskState(true)}
                        >
                            <span>{props?.value || 'Нет данных'}</span>
                        </p>
                        {props?.row.canExpand ? (
                            <span className="cell__expand" {...props?.row.getToggleRowExpandedProps()}>
                                {props?.row?.isExpanded ? '▼' : '▶'}
                            </span>
                        ) : null}
                    </div>
                    {addTaskState &&
                        createPortal(
                            <TaskPopup
                                additClass="add-task"
                                title="Редактирование задачи"
                                data={{
                                    // idContract: props?.config?.idContract,
                                    idContract: props?.row?.original?.contractId,
                                    partition: props?.config?.partition,
                                    tasks: props?.config?.tasks,
                                    task: props?.row?.original,
                                    contractOperations: props?.config?.dataOperation
                                    // contractsIDs: props?.config?.contractsIDs
                                }}
                                taskOperation="update"
                                addTaskState={addTaskState}
                                setAddTaskState={setAddTaskState}
                            />,
                            document.getElementById('root')
                        )}
                </>
            );
        }
    },
    {
        Header: 'Проектный менеджер',
        accessor: 'manager',
        sortable: true,
        sortBy: 'fullName',
        Cell: props => {
            const navigate = useNavigate();
            const { addToHistory } = useHistoryContext();

            function onShowInfoEmployee(employee) {
                if (employee?.mmId && employee?.mmId !== -1) {
                    startTransition(() => {
                        addToHistory(`${window.location.pathname}`);
                        navigate(`../../user/${employee?.mmId}/profile/profile/`, {
                            state: { idEmployee: employee?.mmId, path: `${window.location.pathname}` }
                        });

                        // navigate(`../../user/profile/`, {
                        //     state: { idEmployee: employee?.mmId, path: `${window.location.pathname}` }
                        // });
                    });
                }
            }

            return props?.value && Object.keys(props?.value).length !== 0
                ? CELLS['user'](props?.value, 'person', () => onShowInfoEmployee(props?.value))
                : 'Нет данных';
        }
    },
    {
        Header: 'Руководитель отдела',
        accessor: 'responsible',
        sortable: true,
        sortBy: 'fullName',
        Cell: props => {
            const navigate = useNavigate();
            const { addToHistory } = useHistoryContext();

            function onShowInfoEmployee(employee) {
                // const userInfo = JSON.parse(localStorage.getItem('employee_settings')) || {};

                // localStorage.setItem('employee_settings', JSON.stringify({ activeTab: 0, data: userInfo?.data || [] }));

                startTransition(() => {
                    addToHistory(`${window.location.pathname}`);
                    navigate(`../../user/${employee?.mmId}/profile/profile/`, {
                        state: { idEmployee: employee?.mmId, path: `${window.location.pathname}` }
                    });

                    // navigate(`../../user/profile/`, {
                    //     state: { idEmployee: employee?.mmId, path: `${window.location.pathname}` }
                    // });
                });
            }

            return props?.value && Object.keys(props?.value).length !== 0
                ? CELLS['user'](props?.value, 'person', () => onShowInfoEmployee(props?.value))
                : 'Нет данных';
        }
    },
    {
        Header: 'Постановщик',
        accessor: 'director',
        sortable: false,
        sortBy: undefined,
        Cell: props => {
            const navigate = useNavigate();
            const { addToHistory } = useHistoryContext();

            function onShowInfoEmployee(employee) {
                // const userInfo = JSON.parse(localStorage.getItem('employee_settings')) || {};
                // localStorage.setItem('employee_settings', JSON.stringify({ activeTab: 0, data: userInfo?.data || [] }));
                startTransition(() => {
                    addToHistory(`${window.location.pathname}`);
                    navigate(`../../user/${employee?.mmId}/profile/profile/`, {
                        state: { idEmployee: employee?.mmId, path: `${window.location.pathname}` }
                    });

                    // navigate(`../../user/profile/`, {
                    //     state: { idEmployee: employee?.mmId, path: `${window.location.pathname}` }
                    // });
                });
            }

            return props?.value && Object.keys(props?.value).length !== 0
                ? CELLS['user'](props?.value, 'person', () => onShowInfoEmployee(props?.value))
                : 'Нет данных';
        }
    },
    {
        Header: 'Исполнитель',
        accessor: 'executor',
        sortable: false,
        sortBy: undefined,
        Cell: props => {
            const navigate = useNavigate();
            const { addToHistory } = useHistoryContext();

            function onShowInfoEmployee(employee) {
                // alert(`employee: ${JSON.stringify(employee, null, 4)}`);
                startTransition(() => {
                    addToHistory(`${window.location.pathname}`);

                    navigate(`../../user/${employee?.mmId}/profile/profile/`, {
                        state: { idEmployee: employee?.mmId, path: `${window.location.pathname}` }
                    });
                    // navigate(`../../user/profile/`, {
                    //     state: { idEmployee: employee?.mmId, path: `${window.location.pathname}` }
                    // });
                });
            }

            return props?.value && Object.keys(props?.value).length !== 0
                ? CELLS['user'](props?.value, 'person', () => onShowInfoEmployee(props?.value))
                : 'Нет данных';
        }
    },
    {
        Header: 'Исполнители',
        accessor: 'participants',
        sortable: false,
        sortBy: undefined,
        Cell: props => {
            const navigate = useNavigate();
            const { addToHistory } = useHistoryContext();

            function onShowInfoEmployee(employee) {
                // alert(`Исполнители employee: ${JSON.stringify(employee, null, 4)}`);
                // const userInfo = JSON.parse(localStorage.getItem('employee_settings')) || {};
                // localStorage.setItem('employee_settings', JSON.stringify({ activeTab: 0, data: userInfo?.data || [] }));

                startTransition(() => {
                    startTransition(() => {
                        addToHistory(`${window.location.pathname}`);

                        navigate(`../../user/${employee?.mmId}/profile/profile/`, {
                            state: { idEmployee: employee?.mmId, path: `${window.location.pathname}` }
                        });

                        // navigate(`../../user/profile/`, {
                        //     state: { idEmployee: employee?.mmId, path: `${window.location.pathname}` }
                        // });
                    });
                });
            }

            return (
                <>
                    {Object.keys(props).length === 0 || !props.value || (props.value.length === 0 && <p>Нет данных</p>)}
                    {props?.value && props?.value.length !== 0 && (
                        <ul className="cell__participants cell">
                            {props.value.map(participant => {
                                return CELLS['user'](participant, 'person', () => onShowInfoEmployee(participant));
                            })}
                        </ul>
                    )}
                </>
            );
        }
    },
    {
        Header: 'Дедлайн',
        accessor: 'deadlineTask',
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
    }
];

export default function getSampleColumns(keys) {
    const filteredData = COLUMNS.filter(column => keys?.indexOf(column.accessor) >= 0);
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
