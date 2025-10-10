import { startTransition, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames';

// Импорт сервисов
import TaskService from '@services/popups/popup_task.service';

// Импорт доп.функционала
import { isObject, isArray } from '@helpers/helper';
import { getDateFromString } from '@helpers/calendar';

// Импорт контекста
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
                    <h2 className={`cell__${additClass}-fullname`}>{value?.fullName ?? null}</h2>
                    {value?.post ? <p className={`cell__${additClass}-post`}>{value?.post}</p> : null}
                    {value?.phone ? <p className={`cell__${additClass}-phone`}>{value?.phone ?? null}</p> : null}
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
            // console.log(`props.original.row: ${JSON.stringify(props.original.row, null, 4)}`);
            const navigate = useNavigate();
            const { addToHistory } = useHistoryContext();

            function onShowInfoCard(event) {
                // alert(`Номер договора: ${JSON.stringify(props?.row.original?.contractNum, null, 4)}`);
                if (props.row.original?.contractId) {
                    const navigationArg = {
                        state: {
                            idContract: props.row.original?.contractId,
                            tabForm: { key: 'general', title: 'Общие' },
                            partition: props?.config?.partition,
                            dataOperation: props?.config?.dataOperation
                        }
                    };

                    localStorage.setItem('idContract', JSON.stringify(props.row.original?.contractId));
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
                <p
                    className="cell__num"
                    onClick={e => {
                        e.stopPropagation();
                        onShowInfoCard(e);
                    }}
                >
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
    // {
    //     Header: 'Статус',
    //     accessor: 'status',
    //     sortable: true,
    //     sortBy: 'title',
    //     Cell: props => {
    //         return props?.value ? (
    //             <p className="cell__status cell" style={{ backgroundColor: props?.value?.color }}>
    //                 {props?.value?.title}
    //             </p>
    //         ) : (
    //             'Нет данных'
    //         );
    //     }
    // },
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
        Header: 'Сотрудник',
        accessor: 'employee',
        sortable: true,
        sortBy: 'fullName',
        Cell: props => {
            const navigate = useNavigate();
            const { addToHistory } = useHistoryContext();

            function onShowInfoEmployee(employee) {
                startTransition(() => {
                    addToHistory(`${window.location.pathname}`);
                    navigate(`../../user/${employee?.mmId}/profile/profile/`, {
                        state: { idEmployee: employee?.mmId, path: `${window.location.pathname}` }
                    });
                });
            }

            return props?.value && Object.keys(props?.value).length !== 0
                ? CELLS['user'](props?.value, 'person', () => onShowInfoEmployee(props?.value))
                : 'Нет данных';
        }
    },
    {
        Header: 'Отдел',
        accessor: 'department',
        sortable: false,
        sortBy: undefined,
        Cell: props => {
            return CELLS['text'](props?.value, 'post');
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
    {
        Header: 'Руководитель',
        accessor: 'chief',
        sortable: true,
        sortBy: 'fullName',
        Cell: props => {
            const navigate = useNavigate();
            const { addToHistory } = useHistoryContext();

            function onShowInfoEmployee(employee) {
                startTransition(() => {
                    addToHistory(`${window.location.pathname}`);
                    navigate(`../../user/${employee?.mmId}/profile/profile/`, {
                        state: { idEmployee: employee?.mmId, path: `${window.location.pathname}` }
                    });
                });
            }

            return props?.value && Object.keys(props?.value).length !== 0
                ? CELLS['user'](props?.value, 'person', () => onShowInfoEmployee(props?.value))
                : 'Нет данных';
        }
    },
    {
        Header: 'Офис',
        accessor: 'office',
        sortable: false,
        sortBy: undefined,
        Cell: props => {
            return CELLS['text'](props?.value, 'post');
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
    {
        Header: props => {
            const { idContract, tasks, task, setPopupState, openPopup } = props?.config;

            // const [addTaskState, setAddTaskState] = useState(false);
            // const [popupState, setPopupState] = useState(false);

            // Добавить новую задачу
            const onOpenAddTaskPopup = () => {
                setPopupState(true);
                openPopup('creation', 'addTask', {
                    idContract,
                    tasks,
                    task
                });
            };

            return (
                <>
                    <div className="cell__task-title">
                        Задача
                        <button className="cell__task-title-btn" onClick={onOpenAddTaskPopup}>
                            +
                        </button>
                    </div>
                </>
            );
        },
        accessor: 'task',
        sortable: false,
        sortBy: undefined,
        Cell: props => {
            const { partition, tasks, dataOperation, setPopupState, openPopup } = props?.config;

            const refCell = useRef();

            // Открыть окно редактирования задачи
            const onOpenEditTaskPopup = async () => {
                const { id: taskId, parentId: parentTaskId } = props?.row?.original;

                // Получение информации о задаче
                const taskData = await TaskService.getTaskInfo(taskId, parentTaskId);
                // const taskData = await fetchTaskData(taskId, parentTaskId);

                setPopupState(true);
                openPopup('update', 'editTask', {
                    idContract: props?.row?.original?.contractId,
                    partition,
                    tasks,
                    task: taskData,
                    contractOperations: dataOperation
                });
            };

            // console.log(`row data: ${JSON.stringify(props?.row.original, null, 4)}`);

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
                        <div className="cell__task" ref={refCell} onMouseLeave={() => refCell?.current.scrollTo(0, 0)}>
                            <div className="cell__task-content">
                                <h2 onClick={onOpenEditTaskPopup}>{props?.value || 'Нет данных'}</h2>
                                <h3>
                                    {props?.row?.original?.contractNum ?? null}
                                    {String.fromCharCode(8195)}
                                    {props?.row?.original?.address ?? null}
                                    {String.fromCharCode(8195)}
                                    {props?.row?.original?.customer ?? null}
                                </h3>
                            </div>
                        </div>
                        {props?.row.canExpand ? (
                            <span
                                className="cell__expand"
                                {...props?.row.getToggleRowExpandedProps({
                                    onClick: e => {
                                        e.stopPropagation(); // блокируем всплытие
                                        props?.row.toggleRowExpanded(); // вручную триггерим expand/collapse
                                    }
                                })}
                            >
                                {props?.row?.isExpanded ? '▼' : '▶'}
                            </span>
                        ) : null}
                    </div>
                </>
            );
        }
    },
    {
        Header: 'Статус',
        accessor: 'status',
        sortable: true,
        sortBy: 'status',
        Cell: props => {
            // console.log(`Статус ${props.value}`);
            return props.value ? CELLS['text'](props.value, 'status') : 'Нет данных';
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
        Header: 'Проектный менеджер',
        accessor: 'projectManager',
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

            // console.log(`Руководитель отдела: ${JSON.stringify(props?.value, null, 4)}`);

            function onShowInfoEmployee(employee) {
                // const userInfo = JSON.parse(localStorage.getItem('employee_settings')) || {};

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
        Header: 'Соисполнитель',
        accessor: 'coExecutor',
        sortable: true,
        sortBy: 'value',
        Cell: props => {
            // const { coExecutor, coExecutors } = props.config;
            const { coExecutor, coExecutors } = props.row.original;
            let coExecutorVal = null;
            let coExecutorsArr = coExecutors && coExecutors.length !== 0 ? [...coExecutors] : [];

            const [popupState, setPopupState] = useState(false);
            const ref = useRef();

            const navigate = useNavigate();
            const { addToHistory } = useHistoryContext();

            if (!coExecutor || Object.keys(coExecutor).length === 0) {
                if (coExecutors && coExecutors.length !== 0) coExecutorVal = Object.assign({}, coExecutors[0]);
            } else coExecutorVal = Object.assign({}, coExecutor);

            function onShowInfoEmployee(employee) {
                startTransition(() => {
                    addToHistory(`${window.location.pathname}`);
                    navigate(`../../user/${employee?.mmId}/profile/profile/`, {
                        state: { idEmployee: employee?.mmId, path: `${window.location.pathname}` }
                    });
                });
            }

            useEffect(() => {
                const checkIfClickedOutside = e => {
                    if (ref.current && !ref.current.contains(e.target)) setPopupState(false);
                };
                document.addEventListener('click', checkIfClickedOutside);
                return () => {
                    document.removeEventListener('click', checkIfClickedOutside);
                };
            }, [setPopupState]);

            return (
                <div className="cell__person-wrapper">
                    <div className="cell__person" onClick={() => onShowInfoEmployee(coExecutorVal)}>
                        <img
                            className={`cell__person-photo`}
                            src={
                                coExecutorVal?.mmId
                                    ? `https://mm-mpk.ru/api/v4/users/${coExecutorVal?.mmId}/image`
                                    : '/img/user.svg'
                            }
                            alt=""
                        />
                        <h2 className={`cell__person-fullname`}>
                            {coExecutorVal?.coExecutorName ?? coExecutorVal?.fullName}
                        </h2>
                    </div>
                    {coExecutorsArr && coExecutorsArr.length > 0 ? (
                        <button
                            ref={ref}
                            className="cell__btn-show-persons"
                            type="button"
                            onClick={() => setPopupState(true)}
                        >
                            <span>+</span>
                            <span>{coExecutorsArr.length}</span>
                        </button>
                    ) : null}
                    <div class="cell__persons-list-wrapper">
                        {coExecutorsArr && coExecutorsArr.length !== 0 && popupState ? (
                            <ul className="cell__persons-list">
                                {coExecutorsArr.map(elem => (
                                    <li className="cell__persons-list-item" onClick={() => onShowInfoEmployee(elem)}>
                                        <img
                                            className={`cell__person-photo`}
                                            src={
                                                elem?.mmId
                                                    ? `https://mm-mpk.ru/api/v4/users/${elem?.mmId}/image`
                                                    : '/img/user.svg'
                                            }
                                            alt=""
                                        />
                                        <h2 className={`cell__person-fullname`}>
                                            {elem?.coExecutorName ?? elem?.fullName}
                                        </h2>
                                    </li>
                                ))}
                            </ul>
                        ) : null}
                    </div>
                </div>
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
    const data = new Array(keys.length);

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
