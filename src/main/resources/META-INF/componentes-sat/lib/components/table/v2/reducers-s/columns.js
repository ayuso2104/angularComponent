export default (oldState = {}, action) => {

    switch (action.type) {
        case 'SET_COLUMNS_DEFINITION':
            return {
                ...oldState,
                columnsDefinition: action.payload.columnsDefinition
            };
        case 'WAIT_COLUMN_PROMISE':
            return {
                ...oldState,
                columnsDefinition: oldState.columnsDefinition.map( (column, index) => {
                    if(index === action.payload.index) return column;
                    return {
                        ...column,
                        pending: true
                    }
                })
            };
        case 'SET_COLUMN':
            return {
                ...oldState,
                columnsDefinition: oldState.columnsDefinition.map( (column, index) => {
                    if(index !== action.payload.index) return column;
                    return {
                        ...column,
                        pending: false,
                        $resolvedValue: action.payload.$resolvedValue
                    }
                })
            };
        case 'SET_COLUMN_ORDER':
            return {
                ...oldState,
                columnOrder: action.payload.column
            };
        default: return oldState;
    }

}