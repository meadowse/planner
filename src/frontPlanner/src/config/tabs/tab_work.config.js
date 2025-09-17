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
    statuses: (director, executor) => {
        return new Map([
            ['Отмененнная', { progress: 0 }],
            ['Новая', { progress: 0, [director?.mmId]: ['Отменить'], [executor?.mmId]: ['Взять в работу'] }],
            ['В работе', { progress: 25, [director?.mmId]: ['Отменить'], [executor?.mmId]: ['Выполнено'] }],
            [
                'Выполненная',
                {
                    progress: 50,
                    [director?.mmId]: ['Отменить', 'Принять работу', 'Вернуть в работу'],
                    [executor?.mmId]: null
                }
            ],
            ['Завершенная', { progress: 75 }]
        ]);
    },
    delete: (taskOperation, directorId, authorizedUserId) => {
        return taskOperation === 'update' && directorId === authorizedUserId;
    }
};

const STATUS_ACTIONS_DIRECEXEC = {
    'Отмененнная': null,
    'Новая': ['Отменить', 'Взять в работу'],
    'В работе': ['Отменить', 'Выполнено'],
    'Выполненная': ['Отменить', 'Принять работу', 'Вернуть в работу'],
    'Завершенная': null
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

export const DATA_FORM_OPERATIONS = [
    {
        key: 'creation',
        disabledFields: {
            status: false,
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
