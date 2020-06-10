import { createStore } from 'redux';
import initialState from 'src/initialState';
import {setData, waitData} from "src/actionCreators";
import merge from "lodash/merge";
import cloneDeep from "lodash/cloneDeep";

let reducers = {};

reducers['SET_CONFIG'] = function (oldState, action) {
    return {
        ...oldState,
        config: action.payload.config
    }
};

reducers['SET_COLUMNS_DEFINITION'] = function (oldState, action) {
    return {
        ...oldState,
        columnsDefinition: action.payload.columnsDefinition
    }
};

reducers['WAIT_COLUMN_PROMISE'] = function (oldState, action) {
    return {
        ...oldState,
        columnsDefinition: oldState.columnsDefinition.map( (column, index) => {
            if(index === action.payload.index) return column;
            return {
                ...column,
                pending: true
            }
        })
    }
};

reducers['SET_COLUMN'] = function (oldState, action) {
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
    }
};

reducers['WAIT_DATA'] = function (oldState, action) {
    return {
        ...oldState,
        pending: true
    }
};

reducers['SET_COLUMN_ORDER'] = function (oldState, action) {
    return {
        ...oldState,
        columnOrder: action.payload.column
    }
};

reducers['SET_DATA'] = function (oldState, action) {
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
};

reducers['SET_ELEMENT_DATA'] = function (oldState, action) {
    return {
        ...oldState,
        data: oldState.data.map((element, index) => {
            if(index !== action.payload.indexData) return element;
            let newResolved = Object.assign({}, element);
            newResolved.$resolvedElements[action.payload.indexColumn] = action.payload.elementData;
            return newResolved;
        })
    };
};

reducers['ORDER_BY'] = function (oldState, action) {
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
};

reducers['LOAD_CONFIG_AND_COLUMN_DEFINITION'] = function (oldState, action) {
    let result = cloneDeep(oldState);
    result.config = { ...result.config, ...action.payload.config };
    if(action.payload.dataProvider) {
        result.dataProvider = action.payload.dataProvider;
    }
    if(action.payload.columnsDefinition) {
        result.columnsDefinition = action.payload.columnsDefinition;
    }
    return result;
};

reducers['ADD_FILTER'] = function (oldState, action) {
    let column = cloneDeep(oldState.columnsDefinition[action.payload.indexColumn]);
    column.textToFilter = action.payload.textToFilter;
    column.indexColumn = action.payload.indexColumn;
    return {
        ...oldState,
        filters: oldState.filters.concat(column)
    };
};

reducers['REMOVE_FILTER'] = function (oldState, action) {
    return {
        ...oldState,
        filters: oldState.filters.filter( filter => filter.indexColumn !== action.payload.indexColumn)
    }
};

reducers['UPDATE_SIZE'] = function (oldState, action) {
    return {
        ...oldState,
        config: {
            ...oldState.config,
            defaults: {
                ...oldState.config.defaults,
                headerHeight: action.payload.size.headerHeight ? action.payload.size.headerHeight: oldState.config.defaults.headerHeight,
                height: action.payload.size.height ? action.payload.size.height: oldState.config.defaults.height,
                width: action.payload.size.width ? action.payload.size.width: oldState.config.defaults.width
            }
        }
    }
};

reducers['GO_TO_PAGE'] = function (oldState, action) {
  return {
      ...oldState,
      search: {
          ...oldState.search,
          page: action.payload.numPage
      }
  }
};

reducers['CLEAN'] = function (oldState, action) {
    return { ...action.payload.initialState, columnsDefinition: oldState.columnsDefinition };
};

function tableReducer(oldState, action) {
    if(reducers.hasOwnProperty(action.type)) {
        return reducers[action.type](oldState, action);
    }
    return oldState;
}

export default tableReducer;