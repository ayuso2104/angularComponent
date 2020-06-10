import React from 'react';
import isFunction from 'lodash/isFunction';
import { isPromise } from 'src/util/helpers';
import {setColumn, waitColumnPromise} from "src/actionCreators";
import {connect} from "react-redux";
import TableHeaderResolver from "src/elements/TableHeaderResolved";

const TableHeader = ({indexColumn, columnsDefinition, setColumn, waitColumn}) => {
    const columnDefinition = columnsDefinition[indexColumn];

    if(columnDefinition.$resolvedValue !== undefined) {
        return <TableHeaderResolver indexColumn={indexColumn} value={columnDefinition.$resolvedValue}/>;
    }

    resolverValor();

    return <TableHeaderResolver indexColumn={indexColumn} value={columnDefinition.$resolvedValue} className={"w-table-data w-table-header w-table-empty"}/>;

    function resolverValor() {
        let columnName = columnDefinition.columnName;

        if(!columnName) {
            setColumn(false, indexColumn);
        } else {
            if(isFunction(columnName)) {
                setColumn(columnName(), indexColumn);
            } else {
                if(isPromise(columnName)) {
                    waitColumn(indexColumn);
                    columnName.then( val => {
                        setColumn(val, indexColumn);
                    });
                } else {
                    setColumn(columnName, indexColumn);
                }
            }
        }
    }
};

export default connect(
    state => {
        return {
            columnsDefinition: state.columnsDefinition
        }
    },
    dispatch => {
        return {
            setColumn: ($resolvedValue, indexColumn) => {
                dispatch(setColumn($resolvedValue, indexColumn))
            },
            waitColumn: (indexColumn) => {
                dispatch(waitColumnPromise(indexColumn));
            }
        }
    }
)(TableHeader);