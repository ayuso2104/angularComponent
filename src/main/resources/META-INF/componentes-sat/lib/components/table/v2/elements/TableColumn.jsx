import React from 'react';
import {connect} from "react-redux";
import TableHeader from "src/elements/TableHeader";
import TableData from "src/elements/TableData";


const TableColumn = ({indexColumn, data, config}) => {
    return <div className={"w-table-column"} style={
        {
            width: `${config.defaults.width}em`
        }
    }>
        <TableHeader indexColumn={indexColumn} />
        {
            data.length ? data.map((element, index) => {
                return <TableData key={index} indexColumn={indexColumn} indexData={index}/>
            }): ""
        }
    </div>
};

const mapState = state => {
    return {
        data: state.data,
        config: state.config
    }
};

const mapDispatch = dispatch => {
    return {

    }
};

export default connect(mapState, mapDispatch)(TableColumn);