// Импорт доп.функционала
import { getDateFromString } from '@helpers/calendar';
import { isObject } from '@helpers/helper';

export const DEFAULT_FILTERS = {
    contractNum: '',
    address: '',
    company: '',
    services: 'Все',
    stage: 'Все',
    deadlineTask: 'Все',
    dateOfEnding: 'Все',
    manager: 'Все',
    responsible: 'Все',
    participants: 'Все',
    pathToFolder: '',
    // subsection: '',
    phone: '',
    email: '',
    typeWork: '',
    deadline: 'Все',
    dateDone: 'Все',
    done: 'Все'
};

export const INITIAL_FILTERS = {
    stage: 'В работе',
    done: 'Не завершено'
};

export const KEYS_FOR_STORAGE = {
    department: (keyMode, keyOption) => `department${keyMode ? `-${keyMode}` : ''}${keyOption ? `_${keyOption}` : ''}`,
    equipment: (keyMode, keyOption) => `equipment${keyMode ? `-${keyMode}` : ''}${keyOption ? `_${keyOption}` : ''}`,
    company: (keyMode, keyOption) => `company${keyMode ? `-${keyMode}` : ''}${keyOption ? `_${keyOption}` : ''}`,
    personal: (keyMode, keyOption) => `personal${keyMode ? `-${keyMode}` : ''}${keyOption ? `_${keyOption}` : ''}`,
    user: (keyMode, keyOption) => `user${keyMode ? `-${keyMode}` : ''}${keyOption ? `_${keyOption}` : ''}`,
    dataform: (keyMode, keyOption) => `dataform${keyMode ? `-${keyMode}` : ''}${keyOption ? `_${keyOption}` : ''}`
};

export const OPTIONS_FILTER_CONF = {
    services: data => {
        const newData = [];

        let tempData = [
            'Все',
            ...Array.from(
                new Set(
                    data.map(item => item.services && Object.keys(item.services).length !== 0 && item.services?.title)
                )
            )
        ];

        tempData.map(item => {
            if (item) newData.push(item);
        });

        return newData;
    },
    stage: data => {
        const newData = [];

        let tempData = ['Все', ...Array.from(new Set(data.map(item => item?.stage?.title)))];

        tempData.map(item => {
            if (item) newData.push(item);
        });

        return newData;
    },
    dateOfEnding: data => {
        if (data && data.length !== 0) {
            const newData = [];

            let currDate = new Date();
            let tempData = [
                'Все',
                ...Array.from(
                    new Set(
                        data.map(item => {
                            if (item?.dateOfEnding && Object.keys(item?.dateOfEnding).length !== 0) {
                                if (!item?.dateOfEnding?.value) return 'Без даты';
                                else {
                                    if ('expired' in item?.dateOfEnding) {
                                        if (item?.dateOfEnding?.expired) return 'Просроченные';
                                        else return 'Непросроченные';
                                    } else {
                                        let deadline = getDateFromString(item?.dateOfEnding?.value);
                                        if (currDate > deadline) return 'Просроченные';
                                        else return 'Непросроченные';
                                    }
                                }
                            }
                        })
                    )
                )
            ];

            tempData.map(item => {
                if (item) newData.push(item);
            });

            return newData;
        }
        return [];
    },
    deadlineTask: data => {
        if (data && data.length !== 0) {
            const newData = [];

            let currDate = new Date();
            let tempData = [
                'Все',
                ...Array.from(
                    new Set(
                        data.map(item => {
                            if (item?.deadlineTask) {
                                if (isObject(item?.deadlineTask) && Object.keys(item?.deadlineTask).length !== 0) {
                                    if (!item?.deadlineTask.value) return 'Без даты';
                                    else {
                                        if ('expired' in item?.deadlineTask) {
                                            if (item?.deadlineTask?.expired) return 'Просроченные';
                                            else return 'Непросроченные';
                                        } else {
                                            let deadline = getDateFromString(item?.deadlineTask?.value);
                                            if (currDate > deadline) return 'Просроченные';
                                            else return 'Непросроченные';
                                        }
                                    }
                                }
                            }
                        })
                    )
                )
            ];

            tempData.map(item => {
                if (item) newData.push(item);
            });
            return newData || [];
        }
        return [];
    },
    dateDone: data => {
        const newData = [];

        let currDate = new Date();
        let tempData = [
            'Все',
            ...Array.from(
                new Set(
                    data.map(item => {
                        if (item?.dateDone && Object.keys(item?.dateDone).length !== 0) {
                            if (!item?.dateDone.value) return 'Без даты';
                            else {
                                if ('expired' in item?.dateDone) {
                                    if (item?.dateDone?.expired) return 'Просроченные';
                                    else return 'Непросроченные';
                                } else {
                                    let deadline = getDateFromString(item?.dateDone?.value);
                                    if (currDate > deadline) return 'Просроченные';
                                    else return 'Непросроченные';
                                }
                            }
                        }
                    })
                )
            )
        ];

        // console.log(`tempData data: ${JSON.stringify(tempData, null, 4)}`);

        tempData.map(item => {
            if (item) newData.push(item);
        });
        return newData;
    },
    done: data => {
        const newData = [];
        let tempData = [
            'Все',
            ...Array.from(
                new Set(
                    data.map(item => {
                        if (item.done) return 'Завершено';
                        else return 'Не завершено';
                    })
                )
            )
        ];

        tempData.map(item => {
            if (item) newData.push(item);
        });

        return newData;
    },
    manager: data => {
        const newData = [];
        const tempData = ['Все', ...Array.from(new Set(data.map(item => item.manager?.fullName)))];

        tempData.map(item => {
            if (item) newData.push(item);
        });

        return newData;
    },
    responsible: data => {
        const newData = [];
        const tempData = ['Все', ...Array.from(new Set(data.map(item => item.responsible?.fullName)))];

        tempData.map(item => {
            if (item) newData.push(item);
        });

        return newData;
    },
    participants: data => {
        const newData = [];
        let tempData = [];

        // tempData.map(item => {
        //     if (item) newData.push(item);
        // });

        return ['Все'];
    }
};

export const FILTER_HANDLERS_CONF = new Map([
    ['contractNum', (filterVal, contractNum) => contractNum?.toLowerCase().includes(filterVal?.toLowerCase())],
    ['address', (filterVal, address) => address?.toLowerCase().includes(filterVal?.toLowerCase())],
    ['company', (filterVal, company) => company?.toLowerCase().includes(filterVal?.toLowerCase())],
    ['group', (filterVal, group) => group?.toLowerCase().includes(filterVal?.toLowerCase())],
    ['pathToFolder', (filterVal, pathToFolder) => pathToFolder?.toLowerCase().includes(filterVal?.toLowerCase())],
    ['car', (filterVal, car) => Object.values(car).some(item => item.toLowerCase().includes(filterVal.toLowerCase()))],
    // ['subsection', (filterVal, subsection) => subsection?.toLowerCase().includes(filterVal?.toLowerCase())],
    ['phone', (filterVal, phone) => phone?.toLowerCase().includes(filterVal?.toLowerCase())],
    // ['email', (filterVal, email) => email?.toLowerCase().includes(filterVal?.toLowerCase())],
    ['email', (filterVal, email) => email?.toLowerCase().includes(filterVal?.toLowerCase())],
    ['typeWork', (filterVal, typeWork) => typeWork?.toLowerCase().includes(filterVal?.toLowerCase())],
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
    // ['status', (filterVal, status) => filterVal?.includes('Все') || Object.values(status)?.includes(filterVal)],
    [
        'manager',
        (filterVal, manager) => {
            if (filterVal?.includes('Все')) return true;
            else {
                if (manager && Object.keys(manager).length !== 0)
                    return filterVal?.includes('Все') || Object.values(manager)?.includes(filterVal);
            }
        }
    ],
    [
        'responsible',
        (filterVal, responsible) => {
            if (filterVal?.includes('Все')) return true;
            else {
                if (responsible && Object.keys(responsible).length !== 0)
                    return filterVal?.includes('Все') || Object.values(responsible)?.includes(filterVal);
            }
        }
    ],
    [
        'participants',
        (filterVal, participants) => {
            if (participants && participants.length !== 0) {
                if (filterVal?.includes('Все')) return true;
                // else {
                //     participants.forEach(participant => {
                //         if (Object.values(participant)?.includes(filterVal)) return true;
                //     });
                // }
            }
        }
    ],
    [
        'dateOfEnding',
        (filterVal, date) => {
            // console.log(`filterVal: ${filterVal}\ndate: ${JSON.stringify(date, null, 4)}`);
            if (date) {
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
        }
    ],
    [
        'deadlineTask',
        (filterVal, date) => {
            // console.log(`filterVal: ${filterVal}\ndate: ${JSON.stringify(date, null, 4)}`);
            if (date) {
                if (filterVal?.includes('Все')) return true;
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
            return false;
        }
    ],
    [
        'dateDone',
        (filterVal, date) => {
            console.log(`filterVal: ${filterVal}\ndate: ${JSON.stringify(date, null, 4)}`);
            if (date) {
                if (filterVal?.includes('Все')) return true;
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
        }
    ],
    [
        'done',
        (filterVal, done) => {
            if (filterVal?.includes('Все')) return true;
            else {
                if (done) return filterVal === 'Завершено';
                else return filterVal === 'Не завершено';
            }
        }
    ],
    [
        'contacts',
        (filterVal, contacts) =>
            filterVal?.includes('Выбрать') || contacts?.some(contact => Object.values(contact).includes(filterVal))
    ]
]);
