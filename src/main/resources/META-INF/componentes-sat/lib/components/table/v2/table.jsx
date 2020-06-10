import "src/table.scss";

import React, { Component } from 'react';
import {fetchData, loadConfig} from "src/actionCreators";
import { createStore, applyMiddleware} from "redux";
import thunk from "redux-thunk";
import { Provider, connect } from 'react-redux';
import { createLogger } from 'redux-logger';
import initialState from 'src/initialState';
import TableColumn from 'src/elements/TableColumn';
import merge from 'lodash/merge';
import cloneDeep from 'lodash/cloneDeep';
import { composeWithDevTools  } from 'redux-devtools-extension';
import reducers from 'src/reducers.js';
import Paginator from "src/elements/Paginator";

const AppComponent = ({ columnsDefinition, data, config }) => {
    return <div>
        <div className={`w-table-container mb-1_2`}>
            <div className={"w-table"} style={
                {
                    width: `${config.defaults.width * columnsDefinition.length}em`
                }
            }>
                {
                    columnsDefinition.map((column, index) => {
                        return <TableColumn key={index} indexColumn={index}/>;
                    })
                }
            </div>
            {
                (data && data.length > 0) ? null: <div className={"w-table-info"}>Sin elementos</div>
            }
        </div>
        <Paginator/>
    </div>;
};

let App = connect(
    state => {
        return {
            columnsDefinition: state.columnsDefinition,
            data: state.data,
            config: state.config
        }
    },
    dispatch => {
        return {};
    }
)(AppComponent);

export default class Table extends Component {

    constructor(props) {
        super(props);
    }

    render() {
        let clonedState = cloneDeep(initialState);
        clonedState.order = {
            column: this.props.columnsDefinition[0]
        };
        merge(clonedState, this.props);
        this.store = createStore(reducers, clonedState,
            composeWithDevTools({ trace: true })(applyMiddleware(thunk.withExtraArgument({ getDataProvider: () => this.props.dataProvider }))));
        return <Provider store={this.store}>
            <App/>
        </Provider>;
    }

    load() {
        this.store.dispatch(fetchData());
    }

    loadConfig(configAndColumnDefinition) {
        this.store.dispatch(loadConfig(cloneDeep(configAndColumnDefinition)));
    }
}
