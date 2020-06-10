import isArray from 'lodash/isArray';
import initialState from 'src/initialState';

export function setConfig(config) {
    return {
        type: 'SET_CONFIG',
        payload: {
            config
        }
    }
}

export function setColumnsDefinition(columnsDefinition) {
    return {
        type: 'SET_COLUMNS_DEFINITION',
        payload: {
            columnsDefinition
        }
    }
}

export function setDataProvider(data) {
    return {
        type: 'SET_DATA',
        payload: {
            data
        }
    }
}

export function waitColumnPromise(index) {
    return {
        type: 'WAIT_COLUMN_PROMISE',
        payload: {
            index
        }
    }
}

export function setColumn($resolvedValue, index) {
    return {
        type: 'SET_COLUMN',
        payload: {
            $resolvedValue,
            index
        }
    }
}

export function waitData() {
    return {
        type: 'WAIT_DATA',
        payload: {

        }
    }
}

export function setColumnOrder(column) {
    return {
        type: 'SET_COLUMN_ORDER',
        payload: {
            column
        }
    }
}

export function setData(data, total) {
    return {
        type: 'SET_DATA',
        payload: {
            data,
            total
        }
    }
}

export function setElementData(elementData, indexData, indexColumn) {
    return {
        type: 'SET_ELEMENT_DATA',
        payload: {
            elementData,
            indexData,
            indexColumn
        }
    }
}

export function setOrderBy(indexColumn) {
    return {
        type: 'ORDER_BY',
        payload: {
            indexColumn
        }
    }
}

export function orderBy(indexColumn) {
    return (dispatch) => {
        dispatch(setOrderBy(indexColumn));
        dispatch(fetchData());
    }
}

export function loadConfig({ columnsDefinition, config, dataProvider }) {
    return {
        type: 'LOAD_CONFIG_AND_COLUMN_DEFINITION',
        payload: {
            columnsDefinition,
            config,
            dataProvider
        }
    }
}

export function appendFilter(indexColumn, textToFilter) {
    return {
        type: 'ADD_FILTER',
        payload: {
            indexColumn,
            textToFilter
        }
    }
}

export function removeFilter(indexColumn) {
    return {
        type: 'REMOVE_FILTER',
        payload: {
            indexColumn
        }
    }
}

export function addFilter(indexColumn, textToFilter) {
    return dispatch => {
        dispatch(appendFilter(indexColumn, textToFilter));
        dispatch(fetchData())
    }
}

export function cleanFilter(indexColumn) {
    return dispatch => {
        dispatch(removeFilter(indexColumn));
        dispatch(fetchData());
    }
}

export function  updateSize(size) {
    return {
        type: 'UPDATE_SIZE',
        payload: {
            size
        }
    }
}

export function setPage(numPage) {
    return {
        type: 'GO_TO_PAGE',
        payload: {
            numPage
        }
    }
}

export function goToPage(numPage) {
    return dispatch => {
        dispatch(setPage(numPage));
        dispatch(fetchData());
    }
}

export function clean() {
    return {
        type: 'CLEAN',
        payload: {
            initialState
        }
    }
}

export function fetchData() {
    return (dispatch, getState, { getDataProvider }) => {
        let dataProvider = getDataProvider();
        let state = getState();

        if(dataProvider) {
            dispatch(waitData());

            dataProvider.getPage((state.search.page - 1) * state.search.rowsByPage, state.search.rowsByPage, state.order.column, state.filters).then( res => {
                if(res) {
                    dispatch(setData(res.rows, res.total));
                }
            }, () => dispatch(setData([], 0)));
        }
    }
}