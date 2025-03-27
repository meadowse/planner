// Конфигурация по стадиям
export const STAGES_CONF_MAP = {
    'Без стадии': '#e9ecef',
    'В работе': '#E3AA74',
    'Доработка': '#ffa200',
    'Доработка завершена': '#ff7b00',
    'Работа приостановлена': '#8d99ae',
    'Работа завершена': '#d4e09b',
    'Успех': '#8ac926',
    'Отменена': '#fb4b4e',
    'Аннулировано': '#e63946'
};

// Конфигурация по замене ключей
export const REPLACING_ITEM_KEYS_CONF_MAP = {
    CONTRACT_ID: 'id',
    PATH: 'pathToFolder',
    CONTRACT_NUM: 'contractNum',
    STADIA: 'stage',
    ADRESS: 'address',
    DIRECTION: 'services',
    DATE_OF_ENDING: 'date',
    CUSTOMER: 'company',
    CONTACT_NAME: 'contacts',
    EMPLOYEE_NAMES: 'responsible'
};

// Конфигурация по статусам
export const STATUSES_CONF = {
    'Свободен': '#CAE3AA',
    'Занят': '#C5D8EA',
    'Сломан': '#E4B2B9',
    'В ремонте': '#EFE3A1',
    'На поверке': '#F0D1BB'
};

// Конфигурация по преобразованию данных
export const DATA_CONVERSION_MAP = {
    stage: stage => {
        return Object.keys(stage).length !== 0 && stage?.title
            ? { title: stage?.title, color: STAGES_CONF_MAP[stage.title] }
            : { title: 'Без стадии', color: STAGES_CONF_MAP['Без стадии'] };
    },
    status: status => {
        return Object.keys(status).length !== 0 && status?.title
            ? { title: status?.title, color: STATUSES_CONF[status.title] }
            : { title: 'Без статуса', color: STATUSES_CONF['Без статуса'] };
    },
    services: services => {
        if (services && services.length !== 0) {
            if (services[0]?.title) return services[0];
        }
        return null;
    },
    responsible: responsible => {
        if (responsible && Object.keys(responsible).length !== 0) {
            if (responsible?.fullName) {
                return {
                    ...responsible,
                    photo: '/img/user.svg',
                    post: null
                };
            }
        }
        return null;
    },
    participants: participants => {
        return participants && participants.length !== 0
            ? participants.map(participant => {
                  return { ...participant, photo: '/img/user.svg', post: null };
              })
            : null;
    }
};

// Конфигурация по разделу "Задачи"
export const TASKS_DATA_CONF = {
    title: 'Задачи',
    displayModes: [
        {
            mode: 'Список задач',
            keyMode: 'listTasks',
            modeOptions: [],
            keys: ['task', 'director', 'executor', 'deadlineTask', 'done']
        },
        {
            mode: 'Список договоров',
            keyMode: 'listContracts',
            modeOptions: [],
            keys: [
                'contractNum',
                'address',
                'company',
                'services',
                'stage',
                'dateOfEnding',
                'responsible',
                'pathToFolder'
            ]
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

// Конфигурация по разделу "Компания"
export const COMPANY_DATA_CONF = {
    title: 'Компания',
    displayModes: [
        {
            mode: 'Структура компании',
            keyMode: 'structure',
            keys: []
        },
        {
            mode: 'Сотрудники',
            keyMode: 'employees',
            keys: ['id', 'responsible', 'subsection', 'phone', 'email']
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

// Конфигурация по разделу "Оборудование"
export const EQUIPMENT_DATA_CONF = {
    title: 'Оборудование',
    displayModes: [
        {
            mode: 'Канбан',
            keyMode: 'kanban',
            modeOptions: [
                { value: 'Статусы', key: 'status', uniqueness: 'title' },
                { value: 'Люди', key: 'responsible', uniqueness: 'fullName' }
            ],
            keys: []
        },
        {
            mode: 'Список',
            keyMode: 'listmode',
            modeOptions: [],
            keys: ['id', 'equipment', 'status', 'dates', 'responsible', 'location']
        },
        {
            mode: 'Календарь',
            modeOptions: [],
            keyMode: 'calendar',
            keys: []
        },
        {
            mode: 'Гант',
            keyMode: 'gant',
            modeOptions: [
                { value: 'Оборудование', key: 'equipment', uniqueness: '_' },
                { value: 'Поверка', key: 'verification', uniqueness: '_' }
            ],
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

// Конфигурация по разделу "Производственный департамент"
export const DEPARTMENT_DATA_CONF = {
    title: 'Производство',
    displayModes: [
        {
            mode: 'Канбан',
            keyMode: 'kanban',
            modeOptions: [
                { value: 'Услуги', key: 'services', keyData: 'contracts', uniqueness: 'title' },
                { value: 'Стадии', key: 'stage', keyData: 'contracts', uniqueness: 'title' },
                { value: 'Дни', key: 'date', keyData: 'contracts', uniqueness: 'value' }
            ],
            keys: [
                'id',
                'contractNum',
                'stage',
                'services',
                'pathToFolder',
                'company',
                'contacts',
                'dateOfEnding',
                'responsible'
            ]
        },
        {
            mode: 'Список',
            keyMode: 'listmode',
            modeOptions: [],
            keys: [
                'contractNum',
                'address',
                'company',
                'services',
                'stage',
                'dateOfEnding',
                'responsible',
                'pathToFolder'
            ]
        },
        {
            mode: 'Календарь',
            keyMode: 'calendar',
            modeOptions: []
        },
        {
            mode: 'Гант',
            keyMode: 'gant',
            modeOptions: [
                { value: 'Услуги', key: 'services', keyData: 'contracts', uniqueness: 'title' },
                { value: 'Руководители отделов', key: 'responsible', keyData: 'contracts', uniqueness: 'fullName' },
                { value: 'Сотрудники отделов', key: 'section', keyData: 'sections', uniqueness: 'title' }
            ]
            // keys: [
            //     'id',
            //     'stage',
            //     'contractNum',
            //     'company',
            //     'section',
            //     'address',
            //     'services',
            //     'dateOfStart',
            //     'dateOfEnding',
            //     'tasks',
            //     'responsible',
            //     'employee'
            // ]
        }
    ],
    dataOperations: [
        {
            key: 'creation',
            disabledFields: {}
        },
        {
            key: 'update',
            disabledFields: {
                id: true,
                condition: true,
                imgBuilding: false,
                manager: true,
                responsible: true,
                participants: false,
                company: true,
                address: true,
                pathToFolder: true,
                dateOfCreation: true,
                dateOfStart: true,
                dateOfEnding: true,
                contractNum: true,
                contacts: true,
                deadlines: true,
                services: true,
                comment: true
            }
        }
    ]
};
