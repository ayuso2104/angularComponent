import Common from './../common';

var WEBC = {};
;
(function (WEBC, el, retriveValueOfData, isPromise) {
    "use strict";

    WEBC.MenuItem = _menuItem;

    function _menuItem(eventBus, menuItemDefinition, elementData) {
        var menuItem = el("li").addClasses("contextual-menu-item");
        init(eventBus, menuItem, menuItemDefinition, elementData);
        return menuItem;
    }

    function init(eventBus, menuItem, menuItemDefinition, elementData) {
        retriveConfig(menuItemDefinition, elementData).then(function (config) {
            if (config.show) {
                createMenuItemContent(menuItem, menuItemDefinition, elementData, config);
                if (config.active) {
                    addListener(eventBus, menuItem, menuItemDefinition, elementData);
                }
            } else {
                menuItem.addClasses("contextual-menu-item--hide");
            }
        });
    }

    function retriveConfig(menuItemDefinition, elementData) {

        return Promise.all([
            retriveValueOfData(elementData, getFn(menuItemDefinition.active)),
            retriveValueOfData(elementData, getFn(menuItemDefinition.show))
        ]).then(function (config) {
            return {
                active: config[0],
                show: config[1]
            };
        }, function (err) {
            console.error("Es active: ", menuItemDefinition, ", Data: ", elementData, "Err: ", err);
        });

        function getFn(fnConfig) {
            if (fnConfig === undefined) {
                return function () {
                    return true;
                }
            }
            if (typeof (fnConfig) === "boolean") {
                return function () {
                    return fnConfig;
                }
            }

            return fnConfig;

        }
    }

    function addListener(eventBus, menuItem, menuItemDefinition, elementData) {
        menuItem.addEvent("click", function (evt) {
            evt.stopPropagation();
            eventBus.dispatchMenuItemAction({
                menuItemDefinition: menuItemDefinition,
                elementData: elementData
            });
        });
    }

    function createMenuItemContent(menuItem, menuItemDefinition, elementData, config) {
        var menuItemContent = el("div").addClasses("contextual-menu-item-container");

        getValue(elementData, menuItemDefinition.name).then(function (nameValue) {
            if(menuItemDefinition.icon) {
                menuItemContent.addChildren(el("span").addClasses(menuItemDefinition.icon));
            }

            menuItemContent.addChildren(
                el("span").addClasses("contextual-menu-item-label").addChildren(nameValue)
            );
        }, console.error);

        if (menuItemDefinition.description) {
            getValue(elementData, menuItemDefinition.description).then(function (descriptionValue) {
                menuItemContent.addAttributes({
                    title: descriptionValue
                });
            }, console.error);
        }

        if (!config.active) {
            menuItem.addAttributes({
                disabled: true
            }).addClasses("disabled");
        }

        menuItem.addChildren(menuItemContent);
        return menuItem;
    }

    function getValue(elementData, value) {
        return retriveValueOfData(elementData, getDefaultFn(value));
    }

    function getDefaultFn(value) {
        if (typeof (value) === "function") {
            return value;
        } else {
            if (typeof (value) === "object" && value.then && typeof (value.then) === "function") {
                return value;
            }
            return function () {
                return value;
            };
        }
    }

})(WEBC, Common.el, Common.retriveValueOfData, Common.isPromise);

/**
 * Menu container
 */
;
(function (window, document, WEBC, el, EventBus, MenuItem) {
    "use strict";

    WEBC.ContextualMenu = _contextualMenu;

    function _contextualMenu(parentElement, menuDefinition, elementData) {
        var menuContainer = el("div").addClasses("contextual-menu-container");
        var eventBus = new EventBus(menuContainer, ["MenuItemAction"]);

        init(eventBus, menuDefinition, menuContainer, parentElement, elementData);
        return menuContainer;
    }

    function init(eventBus, menuDefinition, menuContainer, parentElement, elementData) {
        addPosition(document.body);

        window.addEventListener("contextmenu", function (evt) {
            if (evt.target === parentElement || parentElement.contains(evt.target)) {
                evt.preventDefault();
                removeCurrentMenu();
                menuContainer.replaceChildren(createMenuItems(eventBus, menuDefinition, elementData));
                addMenuAsChildren(menuContainer, parentElement, evt);
            }
        });

        eventBus.onMenuItemAction(function (evt) {
            evt.detail.menuItemDefinition.action(evt.detail.elementData);
            if (!(evt.detail.menuItemDefinition.closeAfterAction === false)) {
                removeCurrentMenu();
            }
        });
    }

    function removeCurrentMenu() {
        document.dispatchEvent(new Event("click"));
    }

    function createMenuItems(eventBus, menuDefinition, elementData) {
        var listMenuItem = el("ul").addClasses("contextual-menu-list-item");

        menuDefinition.forEach(function (menuItemDefinition) {
            listMenuItem.addChildren(new MenuItem(eventBus, menuItemDefinition, elementData));
        });

        return listMenuItem;
    }

    function addPosition(parentElement) {
        if (window.getComputedStyle(parentElement).position === "static" || window.getComputedStyle(parentElement).position === "") {
            parentElement.style.setProperty("position", "relative");
        }
    }

    function addMenuAsChildren(menuContainer, parentElement, evt) {
        document.body.appendChild(menuContainer);
        menuContainer.style.setProperty("top", `${evt.pageY}px`);
        menuContainer.style.setProperty("left", `${evt.pageX}px`);

        document.addEventListener("click", removeMenuFromParent);

        function removeMenuFromParent(evt) {
            if (evt.target === menuContainer || menuContainer.contains(evt.target)) return;
            menuContainer.remove();
            document.removeEventListener("click", removeMenuFromParent);
        }
    }


})(window, document, WEBC, Common.el, Common.EventBus, WEBC.MenuItem);

export default WEBC;