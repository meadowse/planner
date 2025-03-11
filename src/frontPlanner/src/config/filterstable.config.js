export const DEFAULT_ACTIVE_FILTERS = {
    stage: 'В работе'
};

export const FILTER_HANDLERS_CONF = new Map([
    ['address', (filterVal, address) => address?.toLowerCase().includes(filterVal?.toLowerCase())],
    ['group', (filterVal, group) => group?.toLowerCase().includes(filterVal?.toLowerCase())],
    // [
    //     'dateOfEnding',
    //     (filterVal, date) => {
    //         if (!date?.value && filterVal?.toLowerCase().includes('Нет данных'.toLowerCase())) return true;
    //         else return date?.value?.toLowerCase().includes(filterVal?.toLowerCase());
    //     }
    // ],
    ['pathToFolder', (filterVal, pathToFolder) => pathToFolder?.toLowerCase().includes(filterVal?.toLowerCase())],
    ['car', (filterVal, car) => Object.values(car).some(item => item.toLowerCase().includes(filterVal.toLowerCase()))],
    // ['responsible', (filterVal, responsible) => responsible?.fullName.toLowerCase().includes(filterVal?.toLowerCase())],
    ['subsection', (filterVal, subsection) => subsection?.toLowerCase().includes(filterVal?.toLowerCase())],
    ['phone', (filterVal, phone) => phone?.toLowerCase().includes(filterVal?.toLowerCase())],
    ['email', (filterVal, email) => email?.toLowerCase().includes(filterVal?.toLowerCase())],
    [
        'stage',
        (filterVal, stage) =>
            filterVal?.includes('Все') || stage?.title.toLowerCase().includes(filterVal?.toLowerCase())
    ],
    [
        'services',
        (filterVal, services) =>
            filterVal?.includes('Все') || services?.title?.toLowerCase().includes(filterVal?.toLowerCase())
    ],
    ['status', (filterVal, status) => filterVal?.includes('Все') || Object.values(status)?.includes(filterVal)],
    [
        'responsible',
        (filterVal, responsible) => filterVal?.includes('Все') || Object.values(responsible)?.includes(filterVal)
    ],
    [
        'dateOfEnding',
        (filterVal, date) => {
            // console.log(`filterVal: ${filterVal}\ndate: ${JSON.stringify(date, null, 4)}`);
            if (filterVal?.includes('Все')) return Object.values({ value: filterVal })?.includes(filterVal);
            else {
                if (date && Object.keys(date).length !== 0) {
                    if (!date?.value) return Object.values({ value: 'Без даты' })?.includes(filterVal);
                    else {
                        if (date?.value && date?.expired)
                            return Object.values({ value: 'Просроченные' })?.includes(filterVal);
                        else return Object.values({ value: 'Непросроченные' })?.includes(filterVal);
                    }
                }
            }
        }
    ],
    [
        'participants',
        (filterVal, participants) =>
            filterVal?.includes('Выбрать') ||
            participants?.some(participant => Object.values(participant).includes(filterVal))
    ],
    [
        'contacts',
        (filterVal, contacts) =>
            filterVal?.includes('Выбрать') || contacts?.some(contact => Object.values(contact).includes(filterVal))
    ]
]);
