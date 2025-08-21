import axios from 'axios';

// Импорт доп.функционала
import { findNestedObj } from '@helpers/helper';
import { getDateInSpecificFormat } from '@helpers/calendar';

// Импорт конфигураций
import { DATA_FORM_OPERATIONS } from '@config/tabs/tab_work.config';

const getDataFormOperation = operation => {
    return findNestedObj(DATA_FORM_OPERATIONS, 'key', operation);
};

const formData = data => {
    return {
        contractId: data?.contractId ?? null,
        parentId: data?.parentId ?? null,
        taskId: data?.id ?? null,
        task: data?.task ?? '',
        dateStart: data?.dateStart ?? '',
        deadlineTask: data?.deadlineTask
            ? {
                  value: data?.deadlineTask
              }
            : null,
        director: {
            id: data?.idDirector,
            mmId: data?.idMMDirector,
            fullName: data?.directorFIO,
            photo: `https://mm-mpk.ru/api/v4/users/${data?.idMMDirector}/image`
        },
        executor: {
            id: data?.idExecutor,
            mmId: data?.idMMExecutor,
            fullName: data?.executorFIO,
            photo: `https://mm-mpk.ru/api/v4/users/${data?.idMMExecutor}/image`
        },
        done: data?.done
    };
};

const getTaskData = (data, disabledFields) => {
    const dataConf = {};
    const DEFAULT_VALUES = {
        //
        // contractNum: value => {
        //     return value ? value : '';
        // },
        // Вид работы
        typeWork: value => {
            return value && Object.keys(value).length !== 0 ? value : null;
        },
        // Родительcкая Задача
        parentTask: value => {
            return value && Object.keys(value).length !== 0 ? value : null;
        },
        // Задача
        task: value => {
            return value && Object.keys(value).length !== 0 ? value : '';
        },
        // Постановщик
        director: value => {
            return value && Object.keys(value).length !== 0 ? value : null;
        },
        // Исполнитель
        executor: value => {
            return value && Object.keys(value).length !== 0 ? value : null;
        },
        // Дата начала
        dateStart: value => {
            const currDateYYYYMMDD = getDateInSpecificFormat(new Date(), {
                format: 'YYYYMMDD',
                separator: '-'
            });
            return value ? value : currDateYYYYMMDD;
        },
        // Дедлайн
        deadlineTask: value => {
            const currDateYYYYMMDD = getDateInSpecificFormat(new Date(), {
                format: 'YYYYMMDD',
                separator: '-'
            });
            return value && Object.keys(value).length !== 0 ? value : { value: currDateYYYYMMDD };
        },
        // Завершено
        done: value => {
            return value ? value : 0;
        },
        // Комментарий
        comment: value => {
            return value ? value : '';
        }
    };

    if (data && Object.keys(data).length !== 0) {
        if (disabledFields) {
            if (Object.keys(disabledFields).length !== 0) {
                Object.keys(data).map(key =>
                    DEFAULT_VALUES[key] && DEFAULT_VALUES[key] !== undefined && !disabledFields[key]
                        ? (dataConf[key] = DEFAULT_VALUES[key](data[key]))
                        : null
                );
            } else {
                Object.keys(data).map(key =>
                    DEFAULT_VALUES[key] && DEFAULT_VALUES[key] !== undefined
                        ? (dataConf[key] = DEFAULT_VALUES[key](data[key]))
                        : null
                );
            }
        }
    } else {
        if (disabledFields) {
            if (Object.keys(disabledFields).length !== 0) {
                Object.keys(DEFAULT_VALUES).map(key =>
                    DEFAULT_VALUES[key] && DEFAULT_VALUES[key] !== undefined && !disabledFields[key]
                        ? (dataConf[key] = DEFAULT_VALUES[key]())
                        : null
                );
            } else {
                Object.keys(DEFAULT_VALUES).map(key =>
                    DEFAULT_VALUES[key] && DEFAULT_VALUES[key] !== undefined
                        ? (dataConf[key] = DEFAULT_VALUES[key]())
                        : null
                );
            }
        }
    }

    return dataConf;
};

// Получение всех задач
const getAllTasks = (tasks, newTasks) => {
    const tasksData = newTasks;

    tasks?.forEach(item => {
        const { id, task, subtasks } = item;
        if (subtasks && subtasks.length !== 0) {
            tasksData.push({ id, title: task });
            return getAllTasks(subtasks, tasksData);
        } else tasksData.push({ id, title: task });
    });

    return tasksData;
};

// getTask taskId parentId
const getTaskInfo = async (idTask, idParent) => {
    let taskInfoData = {};
    await axios
        .post(`${window.location.origin}/api/getTask`, {
            // contractId: JSON.parse(localStorage.getItem('idContract'))
            taskId: idTask,
            parentId: idParent
        })
        .then(response => {
            if (response?.status === 200) {
                console.log(`typeof taskInfoData: ${typeof taskInfoData}`);
                // console.log(`id: ${JSON.parse(localStorage.getItem('idContract'))}`);
                if (response?.data && response?.data.length !== 0) taskInfoData = response?.data;
            }
        })
        .catch(error => {
            if (error.response) {
                console.log('server responded');
                taskInfoData = {};
            } else if (error.request) {
                console.log('network error');
                taskInfoData = {};
            } else {
                console.log(error);
                taskInfoData = {};
            }
        });

    return taskInfoData;
};

// Получение всех договоров
const getContractsIDs = async () => {
    const contractsIDs = {};

    await axios
        .get(`${window.location.origin}/api/`)
        .then(response => {
            if (response.status === 200) {
                if (response.data && response.data.length !== 0) {
                    response.data.forEach(contract => {
                        contractsIDs[contract.contractNum] = contract?.contractId || -1;
                    });
                }
            }
        })
        .catch(error => {
            if (error.response) {
                console.log('server responded');
                contractsIDs = {};
            } else if (error.request) {
                console.log('network error');
                contractsIDs = {};
            } else {
                console.log(error);
                contractsIDs = {};
            }
        });
    return contractsIDs;
};

// Получение видов работ
const getTypesWork = async idContract => {
    let typesWork = [];
    await axios
        .post(`${window.location.origin}/api/getTypesWork`, {
            // contractId: JSON.parse(localStorage.getItem('idContract'))
            contractId: idContract
        })
        .then(response => {
            if (response?.status === 200) {
                // console.log(`id: ${JSON.parse(localStorage.getItem('idContract'))}`);
                if (response?.data && response?.data.length !== 0) {
                    typesWork = response?.data?.map(item => {
                        return { id: item?.number, title: item?.typeWork };
                    });
                }
            }
        })
        .catch(error => {
            if (error.response) {
                console.log('server responded');
                typesWork = [];
            } else if (error.request) {
                console.log('network error');
                typesWork = [];
            } else {
                console.log(error);
                typesWork = [];
            }
        });

    return typesWork;
};

// Получение авторизованного сотрудника
const getAuthorizedEmployee = async idEmployee => {
    let employee = {};
    await axios
        .post(`${window.location.origin}/api/getDataUser`, { employeeId: idEmployee })
        .then(response => {
            if (response.status === 200) {
                const { id, mmId, FIO } = response.data && response.data.length !== 0 ? response.data[0] : {};
                const fio = FIO.trim().split(' ');
                employee = { id, mmId, fullName: `${fio[0] + ' ' + fio[1]}` };
            }
        })
        .catch(error => {
            if (error.response) {
                console.log('server responded');
            } else if (error.request) {
                console.log('network error');
            } else {
                console.log(error);
            }
        });
    return employee;
};

// Добавление задачи
const addTask = async (data, socket, notificationData) => {
    const endpoints = {
        [`${window.location.origin}/api/addTask`]: data,
        [`${window.location.origin}/api/getDataUser`]: { employeeId: notificationData?.director?.mmId }
    };

    // console.log(`keys: ${JSON.stringify(Object.keys(endpoints), null, 4)}`);

    await axios
        .all(Object.keys(endpoints).map(key => axios.post(key, endpoints[key])))
        .then(
            axios.spread((response, user) => {
                if (response.status === 200) {
                    const employee = user.data && user.data.length !== 0 ? user.data[0] : {};

                    // socket.emit('addTask', {
                    //     task: {
                    //         title: data?.task,
                    //         director: {
                    //             mmId: employee?.id,
                    //             fullName: employee?.FIO
                    //         },
                    //         deadline: data?.deadline?.value,
                    //         comment: data?.comment
                    //     },
                    //     assigneeId: notificationData?.executor?.mmId
                    // });

                    // setAddTaskState(false);
                    // navigate(window.location.pathname);
                }
            })
        )
        .catch(error => {
            if (error.response) {
                console.log(error.response);
                console.log('server responded');
                return false;
            } else if (error.request) {
                console.log('network error');
                return false;
            } else {
                console.log(error);
                return false;
            }
        });
};

// Редактирование задачи
const editTask = async newData => {
    await axios
        .post(`${window.location.origin}/api/editTask`, newData)
        .then(response => {
            if (response.status === 200) {
                //
            }
        })
        .catch(error => {
            if (error.response) {
                console.log(error.response);
                console.log('server responded');
            } else if (error.request) {
                console.log('network error');
            } else {
                console.log(error);
            }
        });
};

// Удаление задачи
const deleteTask = async idTask => {
    await axios
        .post(`${window.location.origin}/api/deleteTask`, { taskId: idTask })
        .then(response => {
            if (response.status === 200) {
                //
            }
        })
        .catch(error => {
            if (error.response) {
                console.log(error.response);
                console.log('server responded');
            } else if (error.request) {
                console.log('network error');
            } else {
                console.log(error);
            }
        });
};

const TaskService = {
    formData,
    getDataFormOperation,
    getAllTasks,
    getTaskData,
    getContractsIDs,
    getTypesWork,
    getAuthorizedEmployee,
    getTaskInfo,
    addTask,
    editTask,
    deleteTask
};

export default TaskService;
