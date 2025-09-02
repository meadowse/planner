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

export const DATA_FORM_OPERATIONS = [
    {
        key: 'creation',
        disabledFields: {
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
