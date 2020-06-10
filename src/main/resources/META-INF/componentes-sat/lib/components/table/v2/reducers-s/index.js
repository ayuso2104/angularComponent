import { combineReducers } from 'redux';
import table from 'src/reducers/table';
import columns from 'src/reducers/columns';
import options from 'src/reducers/options';

export default combineReducers({
    table,
    columns,
    options
});