;
(function (window, document) {

    if (window.el) {
        throw new Error("Ya existe un elemento 'el' en el entorno global, por favor verificar existencias");
    }

    window.el = createComponentDefinition;
    window.append = createAppender;
    window.dispatch = createDispatcher;

    function createComponentDefinition(plainComponentDefinition, attributes, children, events) {
        var componentDefinition = {
            tagName: extractTagName(plainComponentDefinition),
            classes: extractClasses(plainComponentDefinition),
            id: extractId(plainComponentDefinition),
            attributes: Object.assign(extractAttributes(plainComponentDefinition), (attributes ? attributes : {})),
            children: children,
            attr: attr,
            events: events || {}
        };

        componentDefinition.render = createRenderFn(componentDefinition, children);

        return componentDefinition;

        function attr(key, value) {
            componentDefinition.attributes[key] = value;
            return componentDefinition;
        }
    }

    function createRenderFn(componentDefinition, children) {
        return function render(parent) {
            var element = document.createElement(componentDefinition.tagName);
            componentDefinition.classes.forEach(function (clazz) {
                element.classList.add(clazz);
            });

            for (var index in componentDefinition.attributes) {
                var realObject;
                var attributeValue = componentDefinition.attributes[index];
                if (attributeValue instanceof RepresentationValue) {
                    realObject = attributeValue.getValue();
                } else {
                    realObject = attributeValue;
                }
                if (realObject !== null) {
                    element.setAttribute(index, realObject);
                }
            }

            Object.keys(componentDefinition.events).forEach(function (key) {
                element.addEventListener(key, componentDefinition.events[key]);
            });

            if (componentDefinition.id) {
                element.setAttribute("id", componentDefinition.id);
            }

            if (children) {
                children.forEach(addChild);
            }

            function addChild(child) {
                if (!child) {
                    throw new Error("No existe un hijo");
                }
                if (child.render) {
                    return child.render(element);
                }
                if (typeof (child) === "string") {
                    return element.appendChild(document.createTextNode(child));
                }
                if(child instanceof Promise) {
                    return child.then(function (val) {
                        addChild(val);
                    });
                }
                if(typeof (child) === "function") {
                    return addChild(child());
                }
                if(Array.isArray(child)) {
                    return child.forEach( function (a_child) {
                        addChild(a_child);
                    });
                }
                throw new Error("El tipo de node no esta permitido", child);
            }

            parent.appendChild(element);
            return element;
        }
    }

    function createDispatcher( element, name ) {
        return function (detail) {
            var customEvent = new CustomEvent( name, { detail: detail });
            element.dispatchEvent(customEvent);
        }
    }

    function createAppender(realObject) {
        return new RepresentationValue(realObject);
    }

    function RepresentationValue(obj) {
        var self = this;
        var conditionsWhen = [];

        self.when = function (condition) {
            if (typeof (condition) === "function") {
                conditionsWhen.push(condition);
            } else {
                conditionsWhen.push(function () {
                    return condition;
                });
            }
            return self;
        };

        self.getValue = function () {
            var returnValue = conditionsWhen.map(function (fnCondition) {
                return fnCondition();
            }).reduce(function (currentValue, nextValue) {
                return (currentValue && nextValue);
            });
            return returnValue ? obj : null;
        }
    }

    function extractTagName(plainComponentDefinition) {
        var result = walk(plainComponentDefinition).untilFind(".", "#", "[").first();
        return result ? result : "div";
    }

    function extractClasses(plainComponentDefinition) {
        return walk(plainComponentDefinition).from(".").untilFind(".", "#", "[").all().filter(function (clazz) {
            return clazz;
        });
    }

    function extractId(plainComponentDefinition) {
        var result = walk(plainComponentDefinition).from("#").untilFind(".", "#", "[").first();
        return result ? result : null;
    }

    function extractAttributes(plainComponentDefinition) {
        return walk(plainComponentDefinition).from("[").untilFind("]").without('"', "'").all().map(function (attributeDeclaration) {
            return attributeDeclaration.split(",").map(constructObjectFromPair).reduce(flat);
        }).reduce(flat);
    }

    function constructObjectFromPair(pair) {
        if (!pair) {
            return {};
        }
        var obj = {};
        var parts = pair.split("=");
        obj[parts[0]] = parts[1];
        return obj;
    }

    function flat(currentObj, otherObject) {
        return Object.assign(currentObj, otherObject);
    }

    function walk(strToWalk) {
        var charactersToEnd = [];
        var charactersToStart = [];
        var removesForOutput = [];

        var methods = {
            untilFind: _untilFind.bind(this),
            first: _first,
            from: _from,
            without: _without,
            all: _all
        }

        return methods;

        function _untilFind() {
            charactersToEnd = Array.from(arguments);
            return methods;
        }

        function _without() {
            removesForOutput = Array.from(arguments);
            return methods;
        }

        function _from() {
            charactersToStart = Array.from(arguments);
            return methods;
        }

        function _first() {
            return process(strToWalk).accumulated;
        }

        function _all() {
            var findArray = [];
            var find = process(strToWalk);

            do {
                findArray.push(find.accumulated);
                find = process(find.rest);
            } while (find.rest);
            
            if(find) {
                findArray.push(find.accumulated);
            }

            return findArray;
        }

        function process(_strToWalk) {
            var accumulated = "";
            var shouldAccumulate = charactersToStart.length === 0;

            var i;
            for (i = 0; i < _strToWalk.length; i++) {
                if (shouldAccumulate) {
                    if (charactersToEnd.indexOf(_strToWalk[i]) === -1) {
                        accumulated += _strToWalk[i];
                    } else {
                        break;
                    }
                } else {
                    if (charactersToStart.indexOf(_strToWalk[i]) !== -1) {
                        shouldAccumulate = true;
                    }
                }
            }

            removesForOutput.forEach(function (toRemove) {
                accumulated = accumulated.replace(new RegExp(toRemove, "g"), "");
            });

            return {
                accumulated: accumulated,
                rest: _strToWalk.substring(i)
            };
        }
    }



})(window, document);
