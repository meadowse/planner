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
            done: true,
            comment: false
        },
        hiddenFields: {
            parentTask: true,
            done: false
        }
    }
];
