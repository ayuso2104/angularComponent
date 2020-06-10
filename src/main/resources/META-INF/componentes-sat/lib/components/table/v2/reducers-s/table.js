import cloneDeep from "lodash/cloneDeep";

export default (oldState = {}, action) => {

    switch(action.type) {
        case 'SET_CONFIG':
            return {
                ...oldState,
                config: action.payload.config
            };
        case 'WAIT_DATA':
            return {
                ...oldState,
                pending: true
            };
        case 'SET_DATA':
            return {
                ...oldState,
                data: action.payload.data.map( el => {
                    return {
                        $originalElement: el,
                        $resolvedElements: []
                    }
                }),
                total: action.payload.total,
                pending: false
            };
        case 'SET_ELEMENT_DATA':
            return {
                ...oldState,
                data: oldState.data.map((element, index) => {
                    if(index !== action.payload.indexData) return element;
                    let newResolved = Object.assign({}, element);
                    newResolved.$resolvedElements[action.payload.indexColumn] = action.payload.elementData;
                    return newResolved;
                })
            };
        case 'LOAD_CONFIG_AND_COLUMN_DEFINITION':
            let result = cloneDeep(oldState);
            result.config = { ...result.config, ...action.payload.config };
            if(action.payload.dataProvider) {
                result.dataProvider = action.payload.dataProvider;
            }
            if(action.payload.columnsDefinition) {
                result.columnsDefinition = action.payload.columnsDefinition;
            }
            return result;
        default: return oldState;
    }

}