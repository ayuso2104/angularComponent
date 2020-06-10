import React, {Component} from 'react';
import store from "src/reducers";
import {setElementData, updateSize} from "src/actionCreators";
import isString from "lodash/isString";
import isFunction from "lodash/isFunction";
import { isPromise } from "src/util/helpers";
import isElement from "lodash/isElement";
import {connect} from "react-redux";

class TableData extends Component {

    constructor(props) {
        super(props);
    }

    render() {
        const element = this.props.data[this.props.indexData];
        const columnDefinition = this.props.columnsDefinition[this.props.indexColumn];

        const styles = {
            height: `${this.props.config.defaults.height}px`
        };

        if(element.$resolvedElements.hasOwnProperty(this.props.indexColumn)) {
            const $resolvedElement = element.$resolvedElements[this.props.indexColumn];
            if(isString($resolvedElement)) {
                return <div className={"w-table-data"} style={styles}>
                    <div ref="dataContent" className={columnDefinition.className}>{$resolvedElement}</div>
                </div>;
            }
            if(isElement($resolvedElement)) {
                return <div className={"w-table-data"} style={styles}>
                    <div ref="dataContent" className={columnDefinition.className}><div ref={ref => ref ? ref.appendChild($resolvedElement): null }></div></div>
                </div>;
            }
            return <div className={"w-table-data"} style={styles}>
                <div ref="dataContent" className={columnDefinition.className}>{ $resolvedElement }</div>
            </div>
        } else {
            this.resolverData(columnDefinition, element, this.props.indexData, this.props.indexColumn, this.props.setElementData);
            return <div style={styles}>
                <div ref="dataContent" className={columnDefinition.className}>Resolviendo</div>
            </div>;
        }
    }

    resolverData(columnDefinition, element, indexData, indexColumn, setElementData, finalValue) {
        if(!columnDefinition.value) {
            return setElementData( "", indexData, indexColumn);
        }

        if(isString(columnDefinition.value)) {
            return setElementData( finalValue ? columnDefinition.value: element.$originalElement[columnDefinition.value], indexData, indexColumn);
        }

        if(isFunction(columnDefinition.value)) {
            return this.resolverData({ ...columnDefinition, value: columnDefinition.value(element.$originalElement) }, element, indexData, indexColumn, setElementData, true);
        }

        if(isPromise(columnDefinition.value)) {
            return columnDefinition.value.then( res => {
                return this.resolverData({ ...columnDefinition, value: res }, res, indexData, indexColumn, setElementData, true);
            });
        }

        return setElementData(columnDefinition.value, indexData, indexColumn);
    }

    componentDidUpdate() {
        const height = this.refs.dataContent.getBoundingClientRect().height;
        this.props.updateSize(height + 15, this.props.config.defaults.height);
    }
}

export default connect(
    state => {
        return {
            data: state.data,
            columnsDefinition: state.columnsDefinition,
            config: state.config
        };
    },
    dispatch => {
        return {
            setElementData: (data, indexData, indexColumn) => {
                dispatch(setElementData(data, indexData, indexColumn));
            },
            updateSize: (height, currentHeight) => {
                if(currentHeight >= height) {
                    return;
                }
                dispatch(updateSize({
                    height: height
                }));
            }
        };
    }
)(TableData);