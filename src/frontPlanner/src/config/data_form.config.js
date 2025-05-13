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

// Конфигурация по преобразованию данных
export const DATA_CONVERSION_MAP = {
    stage: stage => {
        return Object.keys(stage).length !== 0 && stage?.title
            ? { title: stage?.title, color: STAGES_CONF_MAP[stage.title] }
            : { title: 'Без стадии', color: STAGES_CONF_MAP['Без стадии'] };
    },
    deadlineTask: date => {
        return date ? { value: date } : { value: 'Нет данных' };
    },
    director: director => {
        return director && Object.keys(director).length !== 0
            ? {
                  ...director,
                  photo: '/img/user.svg'
              }
            : null;
    },
    executor: executor => {
        return executor && Object.keys(executor).length !== 0
            ? {
                  ...executor,
                  photo: '/img/user.svg'
              }
            : null;
    }
};

export const DATA_FORM_CONF = {
    stages: [
        {
            title: 'Без стадии',
            color: '#E9ECEF'
        },
        {
            title: 'Распределение',
            color: '#D69A9A'
        },
        {
            title: 'Идут работы',
            color: '#E3AA74'
        },
        {
            title: 'Проверка',
            color: '#E2CF6B'
        },
        {
            title: 'Правки',
            color: '#DADF9E'
        },
        {
            title: 'Доработка',
            color: '#ffa200'
        },
        {
            title: 'Доработка завершена',
            color: '#ff7b00'
        },
        {
            title: 'Работа приостановлена',
            color: '#8d99ae'
        },
        {
            title: 'Работа завершена',
            color: '#d4e09b'
        },
        {
            title: 'Отменена',
            color: '#fb4b4e'
        },
        {
            title: 'Аннулировано',
            color: '#E63946'
        }
        // {
        //     title: 'Завершено',
        //     color: '#92CA77'
        // }
    ],
    statuses: [
        {
            title: 'Свободен',
            color: '#CAE3AA'
        },
        {
            title: 'Занят',
            color: '#C5D8EA'
        },
        {
            title: 'Сломан',
            color: '#E4B2B9'
        },
        {
            title: 'В ремонте',
            color: '#EFE3A1'
        },
        {
            title: 'На поверке',
            color: '#F0D1BB'
        }
    ],
    colors: [
        { color: '#B7BE69' },
        { color: '#BE6974' },
        { color: '#69AABE' },
        { color: '#A775A8' },
        { color: '#69BE8B' },
        { color: '#C8CB3E' },
        { color: '#6981BE' },
        { color: '#BE7E69' }
    ],
    services: [
        { title: 'Техническое обследование' },
        { title: 'Пожарная безопасность' },
        { title: 'Кадастровые работы' },
        { title: 'Проектирование ОКН' },
        { title: 'Независимая экспертиза' },
        { title: 'Легализация самостроя' }
    ],
    tabs: [
        { key: 'general', title: 'Общие' },
        { key: 'works', title: 'Работа и задачи' }
        // { key: 'departures', title: 'Выезды' },
        // { key: 'contractors', title: 'Подрядчики' },
        // { key: 'documents', title: 'Документы' }
    ],
    actions: [{ title: 'В архив' }, { title: 'Удалить' }]
};
