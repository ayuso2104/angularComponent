import React, { Component } from 'react';
import { connect } from 'react-redux';
import { goToPage, clean } from 'src/actionCreators';

class Paginator extends Component {

    constructor(props) {
        super(props);
    }

    render() {
        const areData = this.props.data.length > 0;
        const numPages = Math.ceil(this.props.total / this.props.search.rowsByPage);

        const existBefore = 1 !== this.props.search.page;
        const existNext = this.props.search.page !== numPages;

        return <div className={"w-paginator mx-auto"}>

            <div className={"w-buttons-config mb-1_2 text-center"}>
                <button className={"btn btn-default mr-1_2"} title={"Limpiar"} onClick={() => this.props.clean()}>
                    <span className="fas fa-brush icon-rotate-180"></span>
                </button>
                <button className={"btn btn-default"} title={"Configuraciones"}>
                    <span className="fas fa-cog" ></span>
                </button>
            </div>

            <div className={"mx-auto text-center"}>
                <span className="w-buttons-left">
                    <button type="button" className={`btn btn-default`} disabled={!areData || !existBefore} onClick={() => this.props.goToPage(1)}>
                        <span className={`fas fa-caret-left`}></span>
                    </button>

                    <button type="button" className={`btn btn-default`} disabled={!areData || !existBefore} onClick={() => this.props.goToPage(this.props.search.page - 1)}>
                        <span className={`fas fa-angle-left`}></span>
                    </button>
                </span>

                <span className="w-buttons">
                {
                    Array.from(numPages).map( (index) => {
                        return <button key={index} type="button" className={`btn btn-default`} disabled={this.props.search.page === index + 1} onClick={() => this.props.goToPage(index + 1)}>
                            <span>{ index + 1 }</span>
                        </button>;
                    })
                }
                </span>

                <span className="w-buttons-right">
                    <button type="button" className={`btn btn-default`} disabled={!areData || !existNext} onClick={() => this.props.goToPage(this.props.search.page + 1)}>
                        <span className={`fas fa-angle-right`}></span>
                    </button>

                    <button type="button" className={`btn btn-default`} disabled={!areData || !existNext} onClick={() => this.props.goToPage(numPages)}>
                        <span className={`fas fa-caret-right`}></span>
                    </button>
                </span>
            </div>

        </div>;
    }
}

const stateToProps = state => {
    return {
        data: state.data,
        config: state.config,
        search: state.search,
        total: state.total
    }
};

const dispatchToProps = dispatch => {
    return {
        goToPage: numPage => {
            dispatch(goToPage(numPage))
        },
        clean: () => {
            dispatch(clean());
        }
    }
};

export default connect(stateToProps, dispatchToProps)(Paginator);

