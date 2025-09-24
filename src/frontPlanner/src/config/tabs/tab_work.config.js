// Конфигурация по преобразованию данных
export const DATA_CONVERSION_MAP = {
    director: director => {
        return director && Object.keys(director).length !== 0
            ? {
                  id: director.idDirector || director.id || -1,
                  mmId: director.mmId,
                  fullName: director.fullName || director.directorName,
                  photo: director.mmId ? `https://mm-mpk.ru/api/v4/users/${director.mmId}/image` : '/img/user.svg'
              }
            : null;
    },
    executor: executor => {
        return executor && Object.keys(executor).length !== 0
            ? {
                  id: executor.idExecutor || executor.id || -1,
                  mmId: executor.mmId,
                  fullName: executor.fullName || executor.executorName,
                  photo: executor.mmId ? `https://mm-mpk.ru/api/v4/users/${executor.mmId}/image` : '/img/user.svg'
              }
            : null;
    }
};

export const EMPLOYEE_ACTIONS = {
    statuses: (directorId, executorId) => {
        return {
            'Отмененнная': { progress: 0, [directorId]: ['Отменить'] },
            'Новая': {
                progress: 0,
                [executorId]: ['Взять в работу'],
                allActions: ['Взять в работу']
            },
            'В работе': {
                progress: 25,
                [executorId]: ['Выполнено'],
                allActions: ['Выполнено']
            },
            'Выполненная': {
                progress: 50,
                [directorId]: ['Принять работу', 'Вернуть в работу'],
                [executorId]: null,
                allActions: ['Принять работу', 'Вернуть в работу']
            },
            'Завершенная': {
                progress: 75
            }
        };
    },
    delete: (taskOperation, directorId, authorizedUserId) => {
        return taskOperation === 'update' && directorId === authorizedUserId;
    }
};

export const ACTIONS_TASK = {
    'Отменить': {
        title: 'Отмененнная',
        progress: 0
    },
    'Взять в работу': {
        title: 'В работе',
        progress: 25
    },
    'Выполнено': {
        title: 'Выполненная',
        progress: 50
    },
    'Вернуть в работу': {
        title: 'В работе',
        progress: 25
    },
    'Принять работу': {
        title: 'Завершенная',
        progress: 75,
        done: 1
    }
};

export const IMAGES_ACTIONS_TASK = {
    'Отменить': <span>&#10007;</span>,
    'Взять в работу': <span>&#128296;</span>,
    'Выполнено': <span>&#10004;</span>,
    'Вернуть в работу': <span>&#8617;</span>,
    'Принять работу': <span>&#128077;</span>
};

export const DATA_FORM_OPERATIONS = [
    {
        key: 'creation',
        disabledFields: {
            status: false,
            plannedTimeCosts: false,
            typeWork: false,
            director: false,
            executor: false,
            parentTask: false,
            task: false,
            dateStart: false,
            deadlineTask: false,
            done: true,
            comment: false
        },
        hiddenFields: {
            done: true
        }
    },
    {
        key: 'update',
        disabledFields: {
            status: false,
            plannedTimeCosts: false,
            typeWork: false,
            director: false,
            executor: false,
            parentTask: false,
            task: false,
            dateStart: false,
            deadlineTask: false,
            // done: true,
            done: false,
            comment: false
        },
        hiddenFields: {
            parentTask: false,
            done: false
        }
    }
];
