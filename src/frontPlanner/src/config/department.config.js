// Импорт доп.функционала
import { isObject } from '@helpers/helper';

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
    contractNum: contractNum => {
        return contractNum ? contractNum : 'Нет данных';
    },
    address: address => {
        return address ? address : 'Нет данных';
    },
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
            return {
                id: -1,
                mmId: responsible?.idResponsible || -1,
                fullName: responsible?.fullName,
                photo: responsible?.idResponsible
                    ? `https://mm-mpk.ru/api/v4/users/${responsible?.idResponsible}/image`
                    : '/img/user.svg',
                post: null
            };
        }
        return null;
    },
    manager: manager => {
        if (manager && Object.keys(manager).length !== 0) {
            return {
                id: -1,
                mmId: manager?.idManager || -1,
                fullName: manager?.fullName || 'Нет данных',
                photo: manager?.idManager
                    ? `https://mm-mpk.ru/api/v4/users/${manager?.idManager}/image`
                    : '/img/user.svg',
                post: null
            };
        }
    },
    participants: participants => {
        return participants && participants.length !== 0
            ? participants.map(participant => {
                  const { participantId, ...restElems } = participant;
                  return {
                      id: -1,
                      mmId: participantId,
                      ...restElems,
                      photo: participantId ? `https://mm-mpk.ru/api/v4/users/${participantId}/image` : '/img/user.svg',
                      post: null
                  };
              })
            : null;
    },
    director: director => {
        return director && Object.keys(director).length !== 0
            ? {
                  id: director.idDirector,
                  mmId: director.mmId,
                  fullName: director.fullName || director.directorName,
                  photo: director.mmId ? `https://mm-mpk.ru/api/v4/users/${director.mmId}/image` : '/img/user.svg'
              }
            : null;
    },
    executor: executor => {
        return executor && Object.keys(executor).length !== 0
            ? {
                  id: executor.idExecutor,
                  mmId: executor.mmId,
                  fullName: executor.fullName || executor.executorName,
                  photo: executor.mmId ? `https://mm-mpk.ru/api/v4/users/${executor.mmId}/image` : '/img/user.svg'
              }
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
            modeOptions: [
                { value: 'Исполнитель', key: 'executor', uniqueness: 'id' },
                { value: 'Постановщик', key: 'director', uniqueness: 'id' }
            ],
            keys: ['task', 'contractNum', 'address', 'customer', 'director', 'executor', 'deadlineTask', 'done']
        },
        {
            mode: 'Список договоров',
            keyMode: 'listContracts',
            modeOptions: [
                { value: 'Руководитель отдела', key: 'responsible', uniqueness: 'id' },
                { value: 'Исполнитель', key: 'participants', uniqueness: 'id' }
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
            mode: 'Гант',
            keyMode: 'gantContracts',
            modeOptions: [
                // { value: 'Услуги', key: 'services', keyData: 'contracts', uniqueness: 'title' },
                // { value: 'Руководители отделов', key: 'responsible', keyData: 'contracts', uniqueness: 'fullName' },
                // { value: 'Менеджеры проектов', key: 'manager', keyData: 'contracts', uniqueness: 'fullName' },
                // { value: 'Сотрудники отделов', key: 'section', keyData: 'sections', uniqueness: 'title' }
            ],
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
        {
            mode: 'Структура компании',
            keyMode: 'structure',
            keys: []
        },
        {
            mode: 'Сотрудники',
            keyMode: 'employees',
            keys: ['id', 'responsible', 'post', 'phone', 'email']
            // keys: ['id', 'responsible', 'subsection', 'phone', 'email']
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
