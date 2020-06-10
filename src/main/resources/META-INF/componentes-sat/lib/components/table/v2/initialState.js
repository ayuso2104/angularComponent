const initialState = {
    config: {
        defaults: {
            height: 5,
            width: 16,
            headerHeight: 10
        }
    },
    columnsDefinition: [],
    data: {
        originalData: [],
        $resolvedData: []
    },
    total: 0,
    search: {
        page: 1,
        rowsByPage: 5
    },
    order: {
        column: {}
    },
    defaultOrder: 'global',
    filters: [],
    pending: false
};

export default initialState;