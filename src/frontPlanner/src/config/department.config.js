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
    contractNum: value => value ?? 'Нет данных',
    address: value => value ?? 'Нет данных',
    folderPath: value => value ?? 'Нет данных',
    description: value => value ?? 'Нет данных',
    status: value => value ?? 'Без статуса',
    stage: value => {
        return Object.keys(value).length !== 0 && value?.title
            ? { title: value?.title, color: STAGES_CONF_MAP[value.title] }
            : { title: 'Без стадии', color: STAGES_CONF_MAP['Без стадии'] };
    },
    services: value => {
        if (value && value.length !== 0) {
            if (value[0]?.title) return value[0];
        }
        return null;
    },
    project: value => {
        if (value && Object.keys(value).length > 0) return value;
        return value;
    },
    responsible: value => {
        if (value && Object.keys(value).length > 0) {
            return {
                id: value?.id || value?.idMM || null,
                mmId: value?.idMM || null,
                fullName: value?.fullName,
                photo: value?.idMM
                    ? `https://mm-mpk.ru/api/v4/users/${value?.idMM}/image`
                    : value?.id
                    ? `https://mm-mpk.ru/api/v4/users/${value?.id}/image`
                    : '/img/user.svg',
                post: null
            };
        }
        return null;
    },
    manager: value => {
        if (value && Object.keys(value).length > 0) {
            return {
                id: value?.idMM ?? null,
                mmId: value?.idMM ?? null,
                fullName: value?.fullName || 'Нет данных',
                photo: value?.idMM
                    ? `https://mm-mpk.ru/api/v4/users/${value?.idMM}/image`
                    : value?.id
                    ? `https://mm-mpk.ru/api/v4/users/${value?.id}/image`
                    : '/img/user.svg',
                post: null
            };
        }
    },
    projectManager: value => {
        if (value && Object.keys(value).length > 0) {
            return {
                id: value?.idMM ?? null,
                mmId: value?.idMM ?? null,
                fullName: value?.fullName || 'Нет данных',
                photo: value?.idMM
                    ? `https://mm-mpk.ru/api/v4/users/${value?.idMM}/image`
                    : value?.id
                    ? `https://mm-mpk.ru/api/v4/users/${value?.id}/image`
                    : '/img/user.svg',
                post: null
            };
        }
    },
    participants: value => {
        return value && value.length > 0
            ? value.map(elem => {
                  const { idMM, ...restElems } = elem;
                  return {
                      id: idMM ?? elem?.participantId,
                      mmId: idMM ?? elem?.participantId,
                      ...restElems,
                      photo: idMM
                          ? `https://mm-mpk.ru/api/v4/users/${idMM}/image`
                          : elem?.participantId
                          ? `https://mm-mpk.ru/api/v4/users/${elem?.participantId}/image`
                          : '/img/user.svg',
                      post: null
                  };
              })
            : null;
    },
    director: value => {
        return value && Object.keys(value).length > 0
            ? {
                  id: value.idDirector || value.id || -1,
                  mmId: value.mmId,
                  fullName: value.fullName || value.directorName,
                  photo: value.mmId ? `https://mm-mpk.ru/api/v4/users/${value.mmId}/image` : '/img/user.svg'
              }
            : null;
    },
    executor: value => {
        return value && Object.keys(value).length > 0
            ? {
                  id: value.idExecutor || value.id || -1,
                  mmId: value.mmId,
                  fullName: value.fullName || value.executorName,
                  photo: value.mmId ? `https://mm-mpk.ru/api/v4/users/${value.mmId}/image` : '/img/user.svg'
              }
            : null;
    },
    coExecutor: value => {
        if (value && Object.keys(value).length > 0) {
            return {
                id: value.idCoExecutor || value.id || -1,
                mmId: value.mmId,
                fullName: value.fullName || value.coExecutorName,
                photo: value.mmId ? `https://mm-mpk.ru/api/v4/users/${value.mmId}/image` : '/img/user.svg'
            };
        }
        return null;
    }
};

export const PROJECTS_DATA_CONF = {
    title: 'Внутренние проекты',
    displayModes: [
        {
            mode: 'Список проектов',
            keyMode: 'listProjects',
            modeOptions: [],
            keys: ['project', 'stage', 'responsible', 'description', 'dateAdded', 'lastDate', 'folderPath']
        }
    ]
};

// Конфигурация по разделу "Задачи"
export const TASKS_DATA_CONF = {
    title: 'Задачи',
    displayModes: [
        {
            mode: 'Список задач',
            keyMode: 'listTasks',
            modeOptions: [
                { value: 'Исполнитель', key: 'executor', uniqueness: 'id' },
                { value: 'Постановщик', key: 'director', uniqueness: 'id' }
            ],
            keys: {
                executor: ['task', 'status', 'director', 'coExecutor', 'deadlineTask'],
                director: ['task', 'status', 'executor', 'coExecutor', 'deadlineTask']
            }
        },
        {
            mode: 'Список договоров',
            keyMode: 'listContracts',
            modeOptions: [
                { value: 'Руководитель отдела', key: 'responsible', uniqueness: 'id' },
                { value: 'Исполнитель', key: 'participants', uniqueness: 'id' },
                { value: 'Проектные менеджеры', key: 'projectManager', uniqueness: 'id' }
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
                ],
                projectManager: [
                    'contractNum',
                    'address',
                    'company',
                    'services',
                    'stage',
                    'dateOfEnding',
                    'projectManager',
                    'pathToFolder'
                ]
            }
        },
        {
            mode: 'Гант',
            keyMode: 'gantContracts',
            modeOptions: [],
            keys: [
                'contractId',
                'stage',
                'contractNum',
                'company',
                'address',
                'services',
                'dateOfStart',
                'dateOfEnding',
                'tasks'
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
        // {
        //     mode: 'Структура компании',
        //     keyMode: 'structure',
        //     keys: []
        // },
        {
            mode: 'Сотрудники',
            keyMode: 'employees',
            keys: ['id', 'employee', 'department', 'post', 'chief', 'office', 'phone', 'email']
            // keys: ['id', 'responsible', 'subsection', 'phone', 'email']
        },
        {
            mode: 'Отделы',
            keyMode: 'sections',
            keys: []
        },
        {
            mode: 'График отпусков',
            keyMode: 'timetable',
            keys: ['id', 'responsible', 'post', 'phone', 'email']
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
            modeOptions: [{ value: 'Тип оборудования', key: 'equipment', keyData: 'equipment', uniqueness: 'title' }],
            keys: []
        },
        // {
        //     mode: 'Список',
        //     keyMode: 'listmode',
        //     modeOptions: [],
        //     keys: ['id', 'equipment', 'status', 'dates', 'responsible', 'location']
        // },
        {
            mode: 'Календарь',
            modeOptions: [],
            keyMode: 'calendar',
            keys: []
        }
        // {
        //     mode: 'Гант',
        //     keyMode: 'gant',
        //     modeOptions: [
        //         // { value: 'Оборудование', key: 'equipment', uniqueness: '_' },
        //         // { value: 'Поверка', key: 'verification', uniqueness: '_' }
        //     ],
        //     keys: []
        // }
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
                { value: 'Услуги', key: 'services', keyData: 'contracts', uniqueness: 'title', disclose: null },
                { value: 'Стадии', key: 'stage', keyData: 'contracts', uniqueness: 'title', disclose: null },
                { value: 'Дни', key: 'date', keyData: 'contracts', uniqueness: 'value', disclose: null }
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
                'manager',
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
                'manager',
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
                { value: 'Менеджеры проектов', key: 'manager', keyData: 'contracts', uniqueness: 'fullName' },
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
