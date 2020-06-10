import React from 'react';

export default class Message extends React.Component {

    constructor() {
        super();
        this.state = {
            message: 'Un mensaje'
        };
    }

    render() {
        return <h1 className="titulo-msg">{ this.state.message }</h1>;
    }

    setMessage(newMessage) {
        this.setState({ message: newMessage })
    }
}