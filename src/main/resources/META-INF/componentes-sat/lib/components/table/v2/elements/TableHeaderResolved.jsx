import React, { Component } from "react";
import {connect} from "react-redux";
import { nothing} from "src/util/helpers";
import { orderBy, addFilter, cleanFilter, updateSize } from "src/actionCreators";

class TableHeaderResolved extends Component{

    constructor(props) {
        super(props);
    }

    render() {
        const columnDefinition = this.props.columnsDefinition[this.props.indexColumn];
        const isOrderable = !(columnDefinition.orderable === false);
        const isFilterable = !(columnDefinition.filterable === false);
        const styles = {
            height: `${this.props.config.defaults.headerHeight}px`
        };
        let className = `w-table-data w-table-header w-table-resolved ${isOrderable ? 'w-table-data--orderable': ''}`;
        let searchRef = React.createRef();

        return <div className={className} style={styles} onClick={ isOrderable ? () => { this.props.orderBy(this.props.indexColumn)  }: nothing }>
            {
                isOrderable? <span className={`fas ${columnDefinition.orderDirection ?
                    (columnDefinition.orderDirection === 'ASC' ? "fa-chevron-up": "fa-chevron-down"): "fa-minus"}`}></span>: null
            }
            <span ref="tableHeaderLabel">{this.props.value}</span>
            {
                isFilterable ?
                    <div ref="filterInput" className={"form-group has-feedback w-in-header"}>
                        <input className={"form-control"} onClick={ evt => { evt.stopPropagation(); }} onKeyDown={ evt => {
                            (target => setTimeout(() => {
                                if(target.value) {
                                    searchRef.classList.remove("hide");
                                } else {
                                    searchRef.classList.add("hide");
                                }
                            }, 0))(evt.target);
                            this.props.addFilter(evt, this.props.config.defaultOrder === 'local', this.props.indexColumn);
                        } }/>
                        <span className={"fas fa-times form-control-feedback no-label no-padding hide"} ref={ref => searchRef = ref} onClick={evt => { evt.stopPropagation(); evt.target.classList.add("hide"); this.props.cleanFilter(evt, this.props.indexColumn)} }></span>
                    </div>
                    :null
            }
        </div>;
    }

    componentDidUpdate() {
        this.updateSize(this.refs.tableHeaderLabel, this.refs.filterInput);
    }

    componentDidMount() {
        //this.updateSize(this.refs.tableHeaderLabel, this.refs.filterInput);
    }

    updateSize(target, filterInput) {
        const height = target.getBoundingClientRect().height;
        const input = filterInput ? filterInput.getBoundingClientRect().height: 0;
        this.props.updateSize(height + input + 20, this.props.config.defaults.headerHeight);
    }
}


const mapState = state => {
    return {
        columnsDefinition: state.columnsDefinition,
        config: state.config
    }
};

const mapDispatch = dispatch => {
    return {
        orderBy: (indexColumn) => {
            dispatch(orderBy(indexColumn));
        },
        addFilter: (evt, isLocal, indexColumn) => {
            ( (keyCode, target) => {
                setTimeout( () => {
                    if(isLocal || keyCode === 13 || !target.value) {
                        dispatch(addFilter(indexColumn, target.value));
                    }
                }, 0)
            })(evt.keyCode, evt.target);
        },
        cleanFilter: (evt, indexColumn) => {
            evt.target.parentElement.querySelector("input").value = ""
            dispatch(cleanFilter(indexColumn));
        },
        updateSize: (height, currentHeight) => {
            if(currentHeight >= height) {
                return;
            }
            dispatch(updateSize({
                headerHeight: height
            }))
        }
    }
};

export default connect(mapState, mapDispatch)(TableHeaderResolved);

