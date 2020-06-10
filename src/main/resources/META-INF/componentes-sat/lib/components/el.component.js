/**
 * Utilerias
 */

function promesify(value) {
    if (isPromise(value)) return value;

    return new Promise(function (resolve) {
        return resolve(value);
    });
}

function print(value) {
    console.log(value);
    return promesify(value);
}

function nothing() {}

function identity(value) {
    return value;
}

function fnfy(fn) {
    return isFunction(fn) ? fn : nothing;
}

function isPrimitive(value) {
    return typeof (value) === "number" || typeof (value) === "string" || typeof (value) === "boolean";
}

function isFunction(value) {
    return typeof (value) === "function";
}

function isPromise(value) {
    return value instanceof Promise;
}

function exec(fn) {
    return fn();
}

function exists(value) {
    return value !== undefined && value !== null;
}

function notExists(value) {
    return !exists(value);
}

var isEqual = function (value, other) {

    // Get the value type
    var type = Object.prototype.toString.call(value);

    // If the two objects are not the same type, return false
    if (type !== Object.prototype.toString.call(other)) return false;

    // If items are not an object or array, return false
    if (['[object Array]', '[object Object]'].indexOf(type) < 0) return false;

    // Compare the length of the length of the two items
    var valueLen = type === '[object Array]' ? value.length : Object.keys(value).length;
    var otherLen = type === '[object Array]' ? other.length : Object.keys(other).length;
    if (valueLen !== otherLen) return false;

    // Compare two items
    var compare = function (item1, item2) {

        // Get the object type
        var itemType = Object.prototype.toString.call(item1);

        // If an object or array, compare recursively
        if (['[object Array]', '[object Object]'].indexOf(itemType) >= 0) {
            if (!isEqual(item1, item2)) return false;
        }

        // Otherwise, do a simple comparison
        else {

            // If the two items are not the same type, return false
            if (itemType !== Object.prototype.toString.call(item2)) return false;

            // Else if it's a function, convert to a string and compare
            // Otherwise, just compare
            if (itemType === '[object Function]') {
                if (item1.toString() !== item2.toString()) return false;
            } else {
                if (item1 !== item2) return false;
            }

        }
    };

    // Compare properties
    if (type === '[object Array]') {
        for (var i = 0; i < valueLen; i++) {
            if (compare(value[i], other[i]) === false) return false;
        }
    } else {
        for (var key in value) {
            if (value.hasOwnProperty(key)) {
                if (compare(value[key], other[key]) === false) return false;
            }
        }
    }

    // If nothing failed, return true
    return true;

};

/**
 * Utilerias de FP
 */
;
(function (window) {
    "use strict";

    function compose(fns) {
        return function (value) {
            return fns.reduce(function (value, fn) {
                return fn(value);
            }, value);
        }
    }

    window.F = {
        compose: compose
    };

})(window);

/**
 * Ports
 */
;
(function (window) {
    "use strict";

    window.Port = {
        retrive: retrive
    };

    function retrive(value) {
        var configRetrive = [{
                fn: isPrimitive,
                then: promesify
            },
            {
                fn: isFunction,
                then: F.compose([exec, promesify])
            },
            {
                fn: isPromise,
                then: identity
            }
        ];

        var defaultRetrive = {
            fn: identity(false),
            then: promesify
        };

        return configRetrive.reduce(function (currentAction, nextAction) {
            return nextAction.fn(value) ? nextAction : currentAction;
        }, defaultRetrive).then(value);
    };




})(window);


/**
 * Construccion de la definición de componentes
 */
;
(function (window) {
    "use strict";

    window.WC = {
        createDefinitionComponent: createDefinitionComponent,
    };

    function createDefinitionComponent(config) {
        return {
            config: config
        };
    }

})(window);


/**
 * Sistema de render
 */
;
(function () {
    "use strict";

    window.WCDOM = {
        render: render
    };

    function render(componentDefinition, parent, previousDefinition) {
        createResolveDefinition(componentDefinition, parent).then(function (resolveDefinition) {
            renderDOM(resolveDefinition, parent, componentDefinition, previousDefinition, parent.children[0]);
        });
    }

    function createResolveDefinition(componentDefinition, parent) {
        if (isPrimitive(componentDefinition)) {
            return promesify(componentDefinition);
        }
        console.log(componentDefinition);
        return Promise.all([
            Port.retrive(componentDefinition.config.tagName || "div"),
            Port.retrive(componentDefinition.config.attributes || {}),
            Port.retrive(componentDefinition.config.events || {}),
            Port.retrive(componentDefinition.config.props || {}),
            Port.retrive(componentDefinition.config.state || {}),
            Port.retrive(componentDefinition.config.children || [])
        ]).then(function (result) {
            var resolvedValue = {
                tagName: result[0],
                attributes: result[1],
                events: result[2],
                props: result[3],
                state: result[4],
                children: []
            };

            return new Promise(function (resolve) {
                Promise.all(result[5].map(promesify)).then(function (resolvedChild) {
                    Promise.all(resolvedChild.map(function (childOrFn) {
                        var childOrFn = isFunction(childOrFn) ? childOrFn(resolvedValue.props, resolvedValue.state) : childOrFn;
                        return createResolveDefinition(childOrFn);
                    })).then(function (resolvedChildComponent) {
                        resolvedValue.children = resolvedChildComponent;
                        return resolve(resolvedValue);
                    });
                });
            });

        });
    }

    function interactiveEvent(evt, resolvedComponent, parent, componentDefinition) {
        evt.ctx = {
            dispatch: function (eventName, data) {
                parent.dispatchEvent(new CustomEvent('attend-or-propagate', {
                    detail: {
                        eventName: eventName,
                        data: data
                    }
                }));
            },
            setState: function (fnOrState) {
                var newState = isFunction(fnOrState) ? fnOrState(resolvedComponent.state) : fnOrState;
                componentDefinition.config.state = newState;
                render(componentDefinition, parent, resolvedComponent);
            }
        };
        return evt;
    }

    function renderDOM(resolvedComponent, parent, componentDefinition, previousDefinition, $node) {
        return createElement(resolvedComponent, parent, componentDefinition, previousDefinition, $node);
    }

    function sameCurrentDefinitionObject(previousDefinition, resolvedComponent) {
        return (
            previousDefinition.tagName === resolvedComponent.tagName ||
            isEqual(previousDefinition.attributes, resolvedComponent.attributes)
        );
    }

    function createElement(resolvedComponent, parent, componentDefinition, previousDefinition, $node) {
        var $el;
        if (notExists(previousDefinition)) {

            if (exists(resolvedComponent)) {
                if (isPrimitive(resolvedComponent)) {
                    $el = document.createTextNode(resolvedComponent);
                } else {
                    $el = document.createElement(resolvedComponent.tagName);

                    Object.keys(resolvedComponent.attributes).forEach(function (attributeName) {
                        $el.setAttribute(attributeName, resolvedComponent.attributes[attributeName])
                    });

                    Object.keys(resolvedComponent.events).forEach(function (eventName) {
                        $el.addEventListener(eventName, function (evt) {
                            resolvedComponent.events[eventName](interactiveEvent(evt, resolvedComponent, parent, componentDefinition));
                        });
                    });

                    $el.addEventListener('attend-or-propagate', function (evt) {
                        var newEvt = interactiveEvent(evt, resolvedComponent, parent, componentDefinition);
                        if (resolvedComponent.events.hasOwnProperty(evt.detail.eventName)) {
                            resolvedComponent.events[evt.detail.eventName](newEvt);
                        }
                        newEvt.ctx.dispatch(evt.detail.eventName, evt.detail.data);
                    });

                    resolvedComponent.children.forEach(function (child) {
                        renderDOM(child, $el);
                    });
                }
                parent.appendChild($el);

            } else {

            }

        } else {

            if (exists(resolvedComponent)) {
                if(isPrimitive(resolvedComponent) && isPrimitive(previousDefinition)) {
                    if(resolvedComponent === previousDefinition) {
                        parent.replaceElement($node, document.createTextNode(resolvedComponent));
                    }
                    return;
                }
            } else {

            }


        }
        return $el;
    }

    /*function createDomComponent(componentDefinition, parent) {
        var $el;
        if (isPrimitive(componentDefinition)) {
            $el = document.createTextNode(componentDefinition);
        } else {    
            var config = componentDefinition.config;

            $el = document.createElement(config.tagName);

            Object.keys(config.attributes || {}).forEach(function (key) {
                $el.setAttribute(key, config.attributes[key]);
            });

            var ctx = {
                setState: function (newStateDefinition) {
                    var newState;
                    if (isFunction(newStateDefinition)) {
                        newState = newStateDefinition(config.state);
                    }
                    componentDefinition.config.state = newState;
                    render(componentDefinition, parent);
                },
                dispatch: function (eventName, data) {
                    parent.dispatchEvent(new CustomEvent("attention-or-propagate", {
                        detail: {
                            eventName: eventName,
                            data: data
                        }
                    }));
                }
            };

            Object.keys(config.events || {}).forEach(function (key) {
                $el.addEventListener(key, function (evt) {
                    evt.ctx = ctx;
                    return config.events[key](evt);
                });
            });

            $el.addEventListener("attention-or-propagate", function (evt) {
                if ((config.events || {})[evt.detail.eventName]) {
                    evt.ctx = ctx;
                    config.events[evt.detail.eventName](evt);
                }
            });

            (config.children || []).forEach(function (childComponentDefinition) {
                render(isFunction(childComponentDefinition) ? childComponentDefinition( config.props || {}, config.state || {}): childComponentDefinition, $el);
            });

        }
        return $el;
    }*/


})();