import './components.scss';

import React from 'react';
import { render } from 'react-dom';
import Message from './components/Message.jsx';

document.addEventListener("DOMContentLoaded", init);

function init() {
    let ref;
    render(React.createElement(Message, {
        ref: $ref => ref = $ref
    }), document.getElementById("app"));

    setTimeout(() => { ref.setMessage("Nuevo") }, 3000);
}