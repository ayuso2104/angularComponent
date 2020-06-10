;
(function (window) {
    "use strict";

    window.el = function (plainComponentDefinition) {
        var cfn = function (children) {
            cfn.children = children;
            return cfn;
        };

        cfn.tagName = extractTagName(plainComponentDefinition);
        cfn.classes = extractClasses(plainComponentDefinition);
        cfn.id = extractId(plainComponentDefinition);
        cfn.attributes = extractAttributes(plainComponentDefinition);
        cfn.events = {};
        cfn.children = [];
        cfn.actions = {};
        cfn.render = function (parent) {
            return render(parent, cfn);
        };

        cfn.on = function (eventName, fn) {
            cfn.events[eventName] = fn;
            return cfn;
        };

        cfn.action = function (actionName, actionFn) {
            cfn.actions[actionName] = actionFn;
            return cfn;
        };

        cfn.add = function (classList) {
            if (Array.isArray(classList)) {
                cfn.classes = cfn.classes.concat(classList);
            } else {
                cfn.classes = cfn.classes.concat(extractClasses(classList))
            }
            return cfn;
        };

        cfn.attr = function (attributeName, value) {
            cfn.attributes[attributeName] = value;
            return cfn;
        };

        cfn.attrs = function (attributes) {
            cfn.attributes = Object.assign(cfn.attributes, attributes);
            return cfn;
        }

        return cfn;
    };

    function render(parent, cfn) {
        var element = document.createElement(cfn.tagName);
        
        element.propagate = function (eventName, evt) {
            if(cfn.events.hasOwnProperty(eventName)) {
                element.dispatchEvent(evt);
            };
            if(parent.propagate) {
                parent.propagate(eventName, evt);
            }
        };


        cfn.classes.forEach(function (clazz) {
            element.classList.add(clazz);
        });

        for (var index in cfn.attributes) {
            var realObject;
            var attributeValue = cfn.attributes[index];
            if (attributeValue instanceof RepresentationValue) {
                realObject = attributeValue.getValue();
            } else {
                realObject = attributeValue;
            }
            if (realObject !== null) {
                element.setAttribute(index, realObject);
            }
        }

        Object.keys(cfn.events).forEach(function (key) {
            element.addEventListener(key, function (evt) {
                evt.target.dispatch = function (eventName, data) {
                    element.propagate( eventName, new CustomEvent(eventName, { detail: data}) );
                };
                cfn.events[key](evt);
            });
        });

        if (cfn.id) {
            element.setAttribute("id", cfn.id);
        }

        if (cfn.children) {
            cfn.children.forEach(addChild);
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
            if (child instanceof Promise) {
                return child.then(function (val) {
                    addChild(val);
                });
            }
            if (typeof (child) === "function") {
                return addChild(child());
            }
            if (Array.isArray(child)) {
                return child.forEach(function (a_child) {
                    addChild(a_child);
                });
            }
            throw new Error("El tipo de node no esta permitido", child);
        }

        Object.keys(cfn.actions).forEach(function (actionName) {
            element[actionName] = function () {
                cfn.actions[actionName](element, cfn);
            };
        });

        parent.appendChild(element);

        element.dispatchEvent(new CustomEvent("render", {
            detail: {
                cfn: cfn,
                parent: parent
            }
        }));

        return element;
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

            if (find) {
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



})(window);


/**
 * Elemento flotante
 */
;
(function (window, document) {
    "use strict";

    window.FloatElement = function (content) {
        return el(".ac-float-container.ac-none")([
            el(".ac-float-content")(
                [ content ] 
            )
        ]).on("render", function (evt) {
            var floatContainer = evt.target;
            var elementContainer = evt.detail.parent;

            var position = getComputedStyle(elementContainer).position;
            if(!position || (position && position === "static")) {
                elementContainer.style.setProperty("position", "absolute");
            }

            document.addEventListener("click", function (evtDocument) {
                if(evtDocument.target === elementContainer || evtDocument.target === floatContainer || floatContainer.contains(evtDocument.target) ) {
                    return;
                }
                floatContainer.requestClose();
            });
        }).action("requestClose", function (self) {
            self.classList.add("ac-none");
            self.classList.remove("ac-block");
            self.dispatchEvent(new CustomEvent("closed"));
        }).action("requestOpen", function (self) {
            self.classList.add("ac-block");
            self.classList.remove("ac-none");
            self.dispatchEvent(new CustomEvent("opened"))
        });
    }

})(window, document);