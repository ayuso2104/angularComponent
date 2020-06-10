var WEBC = {};

/**
 * Generate uniqueUUID
 */
;
(function (WEBC) {
    "use strict";

    WEBC.uuid = function () {
        var S4 = function () {
            return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        };
        return "SAT_ID_" + (S4() + S4() + S4() + S4() + S4() + S4() + S4() + S4());
    }

})(WEBC);

;(function() {
    var MutationObserver;

    window.MutationObserver = window.MutationObserver || window.webkitMutationObserver || window.mozMutationObserver;
    if (window.MutationObserver != null) {
        return;
    }

    MutationObserver = (function() {
        function MutationObserver(callBack) {
            this.callBack = callBack;
        }

        MutationObserver.prototype.observe = function(element, options) {
            this.element = element;
            return this.interval = setInterval((function(_this) {
                return function() {
                    var html;
                    html = _this.element.innerHTML;
                    if (html !== _this.oldHtml) {
                        _this.oldHtml = html;
                        return _this.callBack.apply(null);
                    }
                };
            })(this), 200);
        };

        MutationObserver.prototype.disconnect = function() {
            return window.clearInterval(this.interval);
        };

        return MutationObserver;

    })();

    window.MutationObserver = MutationObserver;

}).call(this);

/**
 * Utilerias para verificar tipos
 */
;
(function (window) {
    "use strict";

    WEBC.isFunction = function (element) {
        if (!element)
            return false;
        return typeof (element) === "function";
    };

    WEBC.isHTMLElement = function (element) {
        if (!element)
            return false;
        return (typeof (element) === "object" && element.nodeType);
    };

    WEBC.isRendereable = function (element) {
        return (typeof (element) === "string" || typeof (element) === "number" || typeof (element) === "boolean");
    };

})(window);

/**
 * CustomEvent Polyfill
 */
;
(function () {
    if (typeof window.CustomEvent === "function")
        return false; //If not IE

    function CustomEvent(event, params) {
        params = params || {
            bubbles: false,
            cancelable: false,
            detail: undefined
        };
        var evt = document.createEvent('CustomEvent');
        evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
        return evt;
    }

    CustomEvent.prototype = window.Event.prototype;

    window.CustomEvent = CustomEvent;
})();

/**
 * Polyfill para classList.replace
 */
;
(function () {
    "use strict";
    if(!DOMTokenList.prototype.hasOwnProperty('replace')) {
        DOMTokenList.prototype.replace = function (oldName, newName) {
            this.remove(oldName);
            this.add(newName);
        }
    }

})();


/**
 * remove() Polyfill
 */
;
(function (arr) {
    arr.forEach(function (item) {
        if (item.hasOwnProperty('remove')) {
            return;
        }
        Object.defineProperty(item, 'remove', {
            configurable: true,
            enumerable: true,
            writable: true,
            value: function remove() {
                if (this.parentNode !== null)
                    this.parentNode.removeChild(this);
            }
        });
    });
})([Element.prototype, CharacterData.prototype, DocumentType.prototype]);

;
(function () {
    if (!Element.prototype.matches) {
        Element.prototype.matches =
                Element.prototype.matchesSelector ||
                Element.prototype.mozMatchesSelector ||
                Element.prototype.msMatchesSelector ||
                Element.prototype.oMatchesSelector ||
                Element.prototype.webkitMatchesSelector ||
                function (s) {
                    var matches = (this.document || this.ownerDocument).querySelectorAll(s),
                            i = matches.length;
                    while (--i >= 0 && matches.item(i) !== this) {
                    }
                    return i > -1;
                };
    }
})();

/**
 * Utileria para detectar el resize
 */
;
(function (window, document) {
    "use strict";

    var attachEvent = document.attachEvent;
    var isIE = navigator.userAgent.match(/Trident/);
    var requestFrame = (function () {
        var raf = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame ||
                function (fn) {
                    return window.setTimeout(fn, 20);
                };
        return function (fn) {
            return raf(fn);
        };
    })();

    var cancelFrame = (function () {
        var cancel = window.cancelAnimationFrame || window.mozCancelAnimationFrame || window.webkitCancelAnimationFrame ||
                window.clearTimeout;
        return function (id) {
            return cancel(id);
        };
    })();

    function resizeListener(e) {
        var win = e.target || e.srcElement;
        if (win.__resizeRAF__)
            cancelFrame(win.__resizeRAF__);
        win.__resizeRAF__ = requestFrame(function () {
            var trigger = win.__resizeTrigger__;
            trigger.__resizeListeners__.forEach(function (fn) {
                fn.call(trigger, e);
            });
        });
    }

    function objectLoad(e) {
        this.contentDocument.defaultView.__resizeTrigger__ = this.__resizeElement__;
        this.contentDocument.defaultView.addEventListener('resize', resizeListener);
    }

    window.addResizeListener = function (element, fn) {
        if (!element.__resizeListeners__) {
            element.__resizeListeners__ = [];
            if (attachEvent) {
                element.__resizeTrigger__ = element;
                element.attachEvent('onresize', resizeListener);
            } else {
                if (getComputedStyle(element).position == 'static')
                    element.style.position = 'relative';
                var obj = element.__resizeTrigger__ = document.createElement('object');
                obj.setAttribute('style', 'display: block; position: absolute; top: 0; left: 0; height: 100%; width: 100%; overflow: hidden; pointer-events: none; z-index: -1;');
                obj.__resizeElement__ = element;
                obj.onload = objectLoad;
                obj.type = 'text/html';
                if (isIE)
                    element.appendChild(obj);
                obj.data = 'about:blank';
                if (!isIE)
                    element.appendChild(obj);
            }
        }
        element.__resizeListeners__.push(fn);
    };

    window.removeResizeListener = function (element, fn) {
        element.__resizeListeners__.splice(element.__resizeListeners__.indexOf(fn), 1);
        if (!element.__resizeListeners__.length) {
            if (attachEvent)
                element.detachEvent('onresize', resizeListener);
            else {
                element.__resizeTrigger__.contentDocument.defaultView.removeEventListener('resize', resizeListener);
                element.__resizeTrigger__ = !element.removeChild(element.__resizeTrigger__);
            }
        }
    }

})(window, document);

/**
 * Utileria para construir elementos HTML
 */
;
(function (WEBC, document, uuid) {
    "use strict";

    WEBC.el = _createElement;

    function Builder(el) {
        el.addClasses = _addClasses.bind(el);
        el.removeClasses = _removeClasses.bind(el);
        el.addChildren = _addChildren.bind(el);
        el.addEvent = _addEvents.bind(el);
        el.addAttributes = _addAttributes.bind(el);
        el.removeChildren = _removeChildren.bind(el);
        el.replaceClass = _replaceClass.bind(el);
        el.replaceChildren = _replaceChildren.bind(el);

        return el;
    }

    function _createElement(tagName) {
        return new Builder(document.createElement(tagName));
    }

    function _replaceChildren() {
        var el = this;

        var newChildren = Array.from(arguments);
        el.removeChildren();

        newChildren.forEach(function (child) {
            el.addChildren.bind(el)(child);
        });

        return el;
    }

    function _replaceClass(classToReplace, newClass) {
        var el = this;
        el.classList.replace(classToReplace, newClass);
        return el;
    }

    function _addClasses() {
        var el = this;
        var classes = Array.from(arguments);

        classes = flatClass(classes);

        classes.forEach(function (aClass) {
            el.classList.add(aClass);
        });
        return el;
    }

    function _removeClasses() {
        var el = this;
        var classes = Array.from(arguments);

        classes = flatClass(classes);

        classes.forEach(function (aClass) {
            el.classList.remove(aClass);
        });
        return el;
    }

    function flatClass(classes) {
        var newClasses = [];
        for (var i = 0; i < classes.length; i++) {
            newClasses = newClasses.concat(classes[i].split(" "));
        }
        return newClasses;
    }


    function _addChildren() {
        var el = this;
        var children = Array.from(arguments);
        children.forEach(function (aChild) {
            if (WEBC.isRendereable(aChild)) {
                el.innerHTML += aChild;
            } else {
                if (WEBC.isFunction(aChild)) {
                    var valueChild = aChild();
                    if (valueChild) {
                        if (WEBC.isRendereable(valueChild)) {
                            el.innerHTML += valueChild;
                        } else {
                            if (WEBC.isHTMLElement(valueChild)) {
                                el.appendChild(valueChild);
                            } else {
                                var _uuid = uuid();
                                var spanError = document.createElement("span");
                                spanError.setAttribute("id", _uuid);
                                spanError.style.setProperty("display", "none");
                                spanError.textContent = "Error al agregar este hijo";
                                el.appendChild(spanError);
                                console.error("El resultado de la función devolvio un valor que no es HTMlElement o Rendereable revise el elemento co id: " + _uuid + ": " + (valueChild ? JSON.stringify(valueChild): "" ));
                            }
                        }
                    }
                } else {
                    if (WEBC.isHTMLElement(aChild)) {
                        el.appendChild(aChild);
                    } else {
                        var _uuid = uuid();
                        var spanError = document.createElement("span");
                        spanError.setAttribute("id", _uuid);
                        spanError.style.setProperty("display", "none");
                        spanError.textContent = "Error al agregar este hijo";
                        el.appendChild(spanError);
                        console.error("El elemento que trata de agregar no es HTMlElement o Rendereable revise el elemento con id " + _uuid + ": " + (aChild ? JSON.stringify(aChild): "" ));
                    }
                }
            }
        });
        return el;
    }

    function _addEvents(eventName, fnCallback) {
        var el = this;

        el.addEventListener(eventName, fnCallback.bind(el));

        return el;
    }

    function _addAttributes(attributes) {
        var el = this;
        for (var index in attributes) {
            if (index === "class" || index === "classList") {
                attributes[index].split(" ").forEach(function (clazz) {
                    el.addClasses(clazz);
                });
            } else {
                el.setAttribute(index, attributes[index]);
            }
        }
        return el;
    }

    function _removeChildren() {
        var el = this;
        el.innerHTML = "";
        return el;
    }

})(WEBC, document, WEBC.uuid);


/**
 * Utileria para log
 */
;
(function (window, document, el) {
    "use strict";

    window.logger = {};

    var storeLog = [];

    window.logger.getTrace = getTrace;
    window.logger.display = display;
    ['log', 'warn', 'info', 'error', 'trace'].forEach(function (level) {
        window.logger[level] = commonLogger(level);
    });

    function commonLogger(level) {
        return function () {
            var message;
            var objects;
            var parameters = Array.from(arguments);
            if (parameters.length === 0) {
                window.logger.error(new Error("No se proporciono ningún mensaje en el LOG"));
            }

            message = parameters[0];

            objects = parameters.slice(1, parameters.length);

            objects.forEach(function (object) {
                if (message instanceof Error) {
                    message = {
                        message: message.message.replace("{}", object),
                        objectError: message
                    }
                } else {
                    message = message.replace("{}", object);
                }
            });

            var now = Date.now();

            var dataLog = {
                severity: level,
                timestamp: now,
                localeDate: new Date(now).toLocaleString(),
                message: message instanceof Error ? message.message : message,
                objectError: message.objectError,
                objects: objects
            };

            storeLog.push(dataLog);
            console[ level ](dataLog);
            if (level === "error" || level === "warn") {
                console[level](message);
            }
        }
    }

    function getTrace() {
        return storeLog;
    }

    function display() {
        var externalWindow = window.open("", "_blank");

        var externalContent = el("div").addClasses("log-container");

        getTrace().map(printLog).forEach(function (elLog) {
            externalContent.addChildren(elLog);
        });

        externalWindow.document.body.appendChild(externalContent);
    }

    function printLog(dataLog) {
        return el("div").addClasses("log-element").addChildren(dataLog.message);
    }

})(window, document, WEBC.el);

/**
 * Obtener value de cualquier tipo en modo promesa
 */
;
(function (window) {
    "use strict";

    WEBC.retriveValueOfData = _retriveValueOfData;
    WEBC.retriveValue = _retriveValue;
    WEBC.isPromise = _isPromise;

    function _retriveValueOfData(element, attribute) {
        if (_isPromise(attribute)) {
            return attribute;
        }
        ;

        return new Promise(function (resolve, reject) {
            if (typeof (attribute) === "string") {
                return resolve(element[attribute]);
            } else if (typeof (attribute) === "function") {
                var resultValue = attribute(element);
                if (typeof (resultValue) === "string" || typeof (resultValue) === "number" || typeof (resultValue) === "boolean") {
                    return resolve(resultValue);
                } else if (typeof (resultValue) === "object" && resultValue.then && typeof (resultValue.then) === "function") {
                    return resultValue.then(function (value) {
                        return resolve(value);
                    });
                } else if (resultValue instanceof HTMLElement || resultValue instanceof Element) {
                    return resolve(resultValue);
                } else if(resultValue === null || resultValue === undefined) {
                    return resolve(resultValue);
                }
            }
            return reject(element);
        });
    }

    function _retriveValue(element) {

        if (_isPromise(element)) {
            return element;
        }
        ;

        return new Promise(function (resolve, reject) {
            if (typeof (element) === "string" || typeof (resultValue) === "number" || typeof (resultValue) === "boolean") {
                return resolve(element);
            } else if (typeof (element) === "function") {
                var resultValue = element();
                if (typeof (resultValue) === "string" || typeof (resultValue) === "number" || typeof (resultValue) === "boolean") {
                    return resolve(resultValue);
                } else if (typeof (resultValue) === "object" && resultValue.then && typeof (resultValue.then) === "function") {
                    return resultValue.then(function (value) {
                        return resolve(value);
                    });
                } else if (resultValue instanceof HTMLElement || resultValue instanceof Element) {
                    return resolve(resultValue);
                }
            } else if (element instanceof HTMLElement || element instanceof Element) {
                return resolve(element);
            }
            return reject(element);
        });
    }

    function _isPromise(value) {
        return (typeof (value) === "object" && value.then && typeof (value.then) === "function");
    }

})(window);

/**
 * Comparar elementos de forma profunda
 */
;
(function (WEBC) {
    "use strict";

    WEBC.deepEqual = _deepEqual;

    function _deepEqual(x, y) {
        return (x && y && typeof x === 'object' && typeof y === 'object') ?
                (Object.keys(x).length === Object.keys(y).length) &&
                Object.keys(x).reduce(function (isEqual, key) {
            return isEqual && _deepEqual(x[key], y[key]);
        }, true) : (x === y);
    }


})(WEBC);

/**
 * Clonar elementos
 */
;
(function (WEBC) {
    "use strict";

    WEBC.deepClone = _deepClone;

    function _deepClone(item) {
        if (!item) {
            return item;
        } // null, undefined values check

        var types = [Number, String, Boolean],
                result;

        // normalizing primitives if someone did new String('aaa'), or new Number('444');
        types.forEach(function (type) {
            if (item instanceof type) {
                result = type(item);
            }
        });

        if (typeof result == "undefined") {
            if (Object.prototype.toString.call(item) === "[object Array]") {
                result = [];
                item.forEach(function (child, index, array) {
                    result[index] = _deepClone(child);
                });
            } else if (typeof item == "object") {
                // testing that this is DOM
                if (item.nodeType && typeof item.cloneNode == "function") {
                    result = item.cloneNode(true);
                } else if (!item.prototype) { // check that this is a literal
                    if (item instanceof Date) {
                        result = new Date(item);
                    } else {
                        // it is an object literal
                        result = {};
                        for (var i in item) {
                            result[i] = _deepClone(item[i]);
                        }
                    }
                } else {
                    // depending what you would like here,
                    // just keep the reference, or create new object
                    if (false && item.constructor) {
                        // would not advice to do that, reason? Read below
                        result = new item.constructor();
                    } else {
                        result = item;
                    }
                }
            } else {
                result = item;
            }
        }

        return result;
    }

})(WEBC);

/**
 * Restar array, todos los del arrayFrom que no esten en arrayTo
 */
;
(function (WEBC, deepEqual) {
    "use strict";

    WEBC.substract = function (arrayFrom, arrayTo) {
        return arrayFrom.filter(function (element) {

            var find = false;

            for (var i = 0; i < arrayTo.length; i++) {
                if (deepEqual(arrayTo[i], element)) {
                    find = true;
                    break;
                }
            }

            return !find;

        });
    };

})(WEBC, WEBC.deepEqual);

/**
 * Buscar en una collecion si un elemento existe y retorna su indice
 */
;
(function (WEBC, deepEqual) {
    "use strict";

    WEBC.deepIndexOf = _deepIndexOf;

    function _deepIndexOf(collection, element) {
        for (var i = 0; i < collection.length; i++) {
            if (deepEqual(collection[i], element)) {
                return i;
            }
        }
        return -1;
    }

})(WEBC, WEBC.deepEqual);


/**
 * Busca si una colleccion contiene un elemento
 */
;
(function (WEBC, deepIndexOf) {
    "use strict";

    WEBC.deepContains = _deepContains;

    function _deepContains(collecion, element) {
        return deepIndexOf(collecion, element) !== -1;
    }

})(WEBC, WEBC.deepIndexOf);

/**
 * Detectar hasta que un elemento es montado en el dom
 */
;
(function (document, WEBC) {
    "use strict";
    var MAX_INTENT = 3500;
    var MILISECONDS_TO_WAIT = 50;
    WEBC.whenElementMounted = _whenElementMounted;

    function _whenElementMounted(element, elementParent) {
        var elementParent = elementParent || document.body;

        return new Promise(function (resolve, reject) {
            var intervalKey;
            var actualIntent = 0;

            intervalKey = setInterval(function () {
                if (actualIntent > MAX_INTENT) {
                    clearInterval(intervalKey);
                    if (elementParent.contains(element)) {
                        clearInterval(intervalKey);
                        return resolve(element);
                    }
                    console.debug("No se realizo el montado");
                    reject();
                } else {
                    if (elementParent.contains(element)) {
                        clearInterval(intervalKey);
                        return resolve(element);
                    }
                }
                actualIntent++;
            }, MILISECONDS_TO_WAIT);
        });
    }


})(document, WEBC);

/**
 * Utileria para propagar eventos
 */
;
(function (WEBC) {
    "use strict";

    WEBC.propagateEvent = _propagateEvent;

    function _propagateEvent(eventName, elementFromPropagate, elementToPropagate) {
        elementFromPropagate.addEvent(eventName, function (evt) {
            var newEvt = new CustomEvent(eventName, {
                detail: evt.detail
            });
            elementToPropagate.dispatchEvent(newEvt);
        });
    }

})(WEBC);

/**
 * Bus de eventos
 */
;
(function (WEBC, document) {
    "use strict";

    WEBC.EventBus = _eventBus;

    function _eventBus(parentComponent, events) {
        /**
         * Si el primer elemento es un array se entiende que son los eventos
         */
        events = Array.isArray(parentComponent) ? parentComponent : events;
        parentComponent = Array.isArray(parentComponent) ? document.createElement("div") : parentComponent;

        var bus = document.createElement("div");
        events.forEach((function (event) {

            this["dispatch" + event] = function (detail) {
                return _dispatch(event, detail);
            };

            this["on" + event] = function (cb) {
                return _on(event, cb);
            };

        }).bind(this));

        function _dispatch(eventName, detail) {
            bus.dispatchEvent(new CustomEvent(eventName, {
                detail: detail
            }));
        }

        function _on(eventName, cb) {
            bus.addEventListener(eventName, cb.bind(parentComponent));
        }
    }


})(WEBC, document);


/**
 * Icono
 */
;
(function (el) {
    "use strict";

    WEBC.Icon = _icon;

    function _icon(iconName) {
        return el("span").addClasses("ac-icon", "fas", "fa-" + iconName);
    }

})(WEBC.el);

/**
 * Botón basico
 */
;
(function (el) {
    "use strict";

    WEBC.BasicButton = _basicButton;

    function _basicButton(text, type, isSubmit) {
        type = type || 'default';
        return el("button").addClasses("btn", "btn-" + type).addAttributes({
            type: isSubmit ? "submit" : "button"
        }).addChildren(text);
    }

})(WEBC.el);


/**
 * Boton con icono
 */
;
(function (el, Icon) {
    "use strict";

    WEBC.ButtonIcon = _buttonIcon;

    function _buttonIcon(iconName, contextButton) {
        contextButton = "btn-" + (contextButton || 'default');
        return el("button")
                .addAttributes({
                    type: "button"
                })
                .addClasses("input-button__button", "btn", contextButton)
                .addChildren(
                        new Icon(iconName)
                        );
    }

})(WEBC.el, WEBC.Icon);

/**
 * Boton configurable
 */
;
(function (el, Icon) {
    "use strict";

    WEBC.Button = _button;

    function _button(text, iconName, contextButton) {
        contextButton = "btn-" + (contextButton || 'default');
        var button = el("button")
                .addAttributes({
                    type: "button"
                })
                .addClasses("input-button__button", "btn", contextButton);

        if (iconName) {
            button.addChildren(
                    new Icon(iconName)
                    )
        }

        button.addChildren(text);

        return button;
    }

})(WEBC.el, WEBC.Icon);


/**
 * Input con boton
 */
;
(function (el, ButtonIcon) {
    "use strict";

    WEBC.InputButton = _inputButton;

    function _inputButton(iconName) {
        return el("form")
                .addChildren(
                        el("div").addClasses("input-button", "selector-items__search", "form-group", "row", "mx-auto").addChildren(
                        el("div").addClasses("col-xs-10", "col-sm-10", "col-md-10", "col-lg-10", "no-px").addChildren(
                        el("input").addAttributes({
                    type: "text"
                }).addClasses("input-button__input", "form-control")
                        ),
                        el("div").addClasses("col-xs-2", "col-sm-2", "col-md-2", "col-lg-2", "no-px").addChildren(
                        new ButtonIcon(iconName)
                        )
                        )
                        );
    }

})(WEBC.el, WEBC.ButtonIcon);

/**
 * Un input con un icono
 */
;
(function (WEBC, el) {
    "use strict";
    WEBC.InputIcon = _inputIcon;

    function _inputIcon(iconName, label, config) {
        config = config || {};
        var inputIcon = el("div").addClasses("form-group", "has-feedback");

        if (label) {
            inputIcon.addChildren(
                    el("label").addClasses("control-label").addChildren(label)
                    );
        }

        var input = el("input").addAttributes({
            type: "text"
        }).addClasses("form-control");

        if(config.uppercase) {
            input.style.setProperty("text-transform", "uppercase");
        }

        inputIcon.addChildren(
                input,
                el("span").addClasses("fas", "fa-" + iconName, "form-control-feedback", "no-col", "no-lbl")
                );

        inputIcon.references = {
            input: input
        };

        return inputIcon;
    }

})(WEBC, WEBC.el);


;
(function () {
    "use strict";

    WEBC.T = _t;

    var ac = {
        table: {
            configuration: {
                local: 'Filtro y busqueda local',
                descLocal: 'Realiza el filtro sobre la página y los resultados que esta viendo en este momento.',
                global: 'Filtro y busqueda global',
                descGlobal: 'Realiza el filtro sobre todos los datos, como estos datos se obtienen realizando una nueva consulta require que oprima "Enter".'
            }
        }
    };

    function _t(key) {

        return new Promise(function (resolve, reject) {
            var keys = key.split(".");

            var translation = {
                ac: ac
            };

            for (var i in keys) {
                if (translation === undefined) {
                    return reject(key);
                }
                translation = translation[keys[i]];
            }

            resolve(translation);

        });

    }

})(WEBC);


/**
 * Tooltip
 */
;
(function (document, WEBC, el) {
    "use strict";

    WEBC.ToolTip = _toolTip;

    function _toolTip(elementToMount, elementTooltip) {
        this.tooltip = el("div").addClasses("ac-tooltip__container");
        this.elementTool = el("div").addClasses("ac-tooltip__content").addChildren(elementTooltip);
        this.tooltip.addChildren(elementToMount);

        this.tooltip.show = _show.bind(this);
        this.tooltip.hide = _hide.bind(this);
        this.tooltip.toggle = _toggle.bind(this);

        this.hideOnClickInDocument = _hideOnClickInDocument.bind(this);

        return this.tooltip;
    }

    function _show() {
        this.tooltip.addChildren(this.elementTool);
        document.addEventListener("click", this.hideOnClickInDocument);
    }

    function _hide() {
        this.tooltip.removeChild(this.elementTool);
        document.removeEventListener("click", this.hideOnClickInDocument);
    }

    function _toggle() {
        if (this.tooltip.contains(this.elementTool)) {
            this.tooltip.hide();
        } else {
            this.tooltip.show();
        }
    }

    function _hideOnClickInDocument(evt) {
        if (this.tooltip.contains(evt.target))
            return;
        this.tooltip.hide();
    }


})(document, WEBC, WEBC.el);


/**
 * Elementos flotantes existentes en el dom
 */
;
(function (document, WEBC, el) {
    "use strict";

    WEBC.FloatElement = _floatElement;

    function _floatElement(elementToMount, elementInside) {
        var floatContainer = el("div").addClasses("float-container");

        elementToMount.parentElement.replaceChild(floatContainer, elementToMount);

        floatContainer.addChildren(elementToMount);

        var content = el("div").addClasses("float-content").addChildren(elementInside);

        elementInside.addEventListener("click", function (evt) {
            evt.stopPropagation();
        });

        floatContainer.toggle = function () {
            if (floatContainer.contains(content)) {
                floatContainer.hide();
            } else {
                floatContainer.show();
            }
        };

        floatContainer.show = function () {
            floatContainer.appendChild(content);
            document.addEventListener("click", removeContent);
        };

        floatContainer.hide = function () {
            floatContainer.removeChild(content);
            document.removeEventListener("click", removeContent);
        };

        function removeContent(evt) {
            if (evt.target === elementToMount || elementToMount.contains(evt.target))
                return;
            if (evt.target === content || content.contains(evt.target))
                return;
            floatContainer.hide();
        }

        return floatContainer;
    }

})(document, WEBC, WEBC.el);

;(function () {
    "use strict";

    if(!HTMLElement.prototype.hasOwnProperty("insertAdjacentElement")){
        HTMLElement.prototype.insertAdjacentElement = function (position, elem) {
            let _this = this,
                parent = _this.parentNode,
                node, first, next;

            switch (position.toLowerCase()) {
                case 'beforebegin':
                    while ((node = elem.firstChild)) {
                        parent.insertBefore(node, _this);
                    }
                    break;
                case 'afterbegin':
                    first = _this.firstChild;
                    while ((node = elem.lastChild)) {
                        first = _this.insertBefore(node, first);
                    }
                    break;
                case 'beforeend':
                    while ((node = elem.firstChild)) {
                        _this.appendChild(node);
                    }
                    break;
                case 'afterend':
                    parent.insertBefore(elem, _this.nextSibling);
                    break;
            }
            return elem;
        };
    }

})();

;(function (document, WEBC) {

    WEBC.findParent = function(element, fnFilter) {
        let parentProspect = element.parentElement;
        while(parentProspect && parentProspect !== document.body) {
            if(fnFilter(parentProspect)) {
                return parentProspect;
            }
            parentProspect = parentProspect.parentElement;
        }
    };

})(document, WEBC);

export default WEBC;