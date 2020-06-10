import React, { Component } from 'react';
import store from "src/reducers";
import TableData from "src/elements/TableData";
import { connect } from 'react-redux';

const TableRow = ({ indexData, columnsDefinition }) => {
    return <div className={"w-table-row"}>
        {
            columnsDefinition.map((column, index) => {
                return <TableData key={index} indexColumn={index} indexData={indexData}/>
            })
        }
    </div>;
};

export default connect(
    state => {
        return {
            columnsDefinition: state.columnsDefinition
        }
    },
    dispatch => {
        return {}
    }
)(TableRow);