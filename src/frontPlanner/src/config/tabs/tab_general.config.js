export const TAB_GENERAL_CONF = {
    contacts: [
        {
            value: 'ФИО',
            key: 'fullName',
            additClass: 'full_name',
            copyStatus: true
        },
        {
            value: 'Должность',
            key: 'post',
            additClass: 'post',
            copyStatus: false
        },
        {
            value: 'Телефон',
            key: 'phone',
            additClass: 'phone',
            copyStatus: true
        },
        {
            value: 'Почта',
            key: 'email',
            additClass: 'email',
            copyStatus: true
        }
    ]
};

export const DEFAULT_VALUES = {
    condition: value => {
        return value && Object.keys(value).length !== 0 ? value : '';
    },
    imgBuilding: value => {
        return value && Object.keys(value).length !== 0 ? value : null;
    },
    manager: value => {
        return value && Object.keys(value).length !== 0 ? value : null;
    },
    responsible: value => {
        return value && Object.keys(value).length !== 0 ? value : null;
    },
    participants: value => {
        return value && value.length !== 0 ? value : [];
    },
    company: value => {
        return value ? value : '';
    },
    address: value => {
        return value ? value : '';
    },
    pathToFolder: value => {
        return value ? value : '';
    },
    dateCreation: value => {
        return value ? value : '';
    },
    dateOfStart: value => {
        return value ? value : '';
    },
    dateOfEnding: value => {
        return value ? value : '';
    },
    contractNum: value => {
        return value ? value : '';
    },
    contacts: value => {
        return value && value.length !== 0 ? value : [];
    },
    services: value => {
        return value && value.length !== 0 ? value : [];
    }
};
