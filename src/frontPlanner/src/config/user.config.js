export const EMPLOYEE_CONF = {
    post: 'Должность',
    personalPhone: 'Личный телефон',
    mail: 'Почта',
    workPhone: 'Рабочий телефон',
    internalPhone: 'Внутренний телефон',
    telegramm: 'Telegram',
    division: 'Отдел',
    birthday: 'День рождения',
    office: 'Офис',
    director: 'Руководитель'
};

// Конфигурация по разделу "Сотрудник"
export const EMPLOYEE_DATA_CONF = {
    title: null,
    tabs: [
        {
            tab: 'Профиль',
            keyTab: 'profile',
            path: 'settings',
            tabOptions: [],
            keys: []
        },
        {
            tab: 'Задачи',
            keyTab: 'tasks',
            path: 'tableTasks',
            tabOptions: [
                { value: 'Исполнитель', key: 'executor', uniqueness: 'id' },
                { value: 'Постановщик', key: 'director', uniqueness: 'id' }
            ],
            keys: {
                executor: ['task', 'status', 'director', 'coExecutor', 'deadlineTask'],
                director: ['task', 'status', 'executor', 'coExecutor', 'deadlineTask']
            }
        },
        {
            tab: 'Договоры',
            keyTab: 'contracts',
            path: 'tableContracts',
            tabOptions: [
                { value: 'Руководитель отдела', key: 'responsible', uniqueness: 'fullName' },
                { value: 'Исполнитель', key: 'participants', uniqueness: 'fullName' }
            ],
            keys: {
                responsible: [
                    'contractNum',
                    'address',
                    'company',
                    'services',
                    'stage',
                    'dateOfEnding',
                    'responsible',
                    'pathToFolder'
                ],
                participants: [
                    'contractNum',
                    'address',
                    'company',
                    'services',
                    'stage',
                    'dateOfEnding',
                    'participants',
                    'pathToFolder'
                ]
            }
        },
        {
            tab: 'Написать в ММ',
            keyTab: 'writemm',
            path: 'writeMM',
            tabOptions: [],
            keys: []
        }
    ],
    dataOperations: [
        {
            key: 'creation',
            disabledFields: {}
        },
        {
            key: 'update',
            disabledFields: {}
        }
    ]
};
