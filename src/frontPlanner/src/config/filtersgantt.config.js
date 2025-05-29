export const DEFAULT_FILTERS = {
    stage: 'Все'
};

export const INITIAL_FILTERS = {
    stage: 'В работе'
};

export const FILTER_HANDLERS_CONF = new Map([
    [
        'stage',
        (filterVal, stage) =>
            filterVal?.includes('Все') || stage?.title.toLowerCase().includes(filterVal?.toLowerCase())
    ]
]);
