import cloneDeep from "lodash/cloneDeep";

export default (oldState = {}, action) => {
    switch(action.type) {
        case 'ORDER_BY':
            let result =  cloneDeep(oldState);
            result.columnsDefinition.forEach( (column, i) => {
                if(i === action.payload.indexColumn) {
                    result.columnsDefinition[i].orderDirection = result.columnsDefinition[action.payload.indexColumn].orderDirection === 'DESC' ? 'ASC' : 'DESC';
                    result.order.column = result.columnsDefinition[i];
                } else {
                    result.columnsDefinition[i].orderDirection = undefined;
                }
            });
            return result;
        case 'ADD_FILTER':
            return oldState;
        default: return oldState;
    }
}