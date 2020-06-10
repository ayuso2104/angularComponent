export default function _accordionTab(content, title, config) {
    var accordionContainer = WEBC.el("div").addClasses("ac-accordion-container");

    config = config || {};
    config.isOpen = config.isOpen === true;
    config.isLockeable = !(config.isLockeable === false);
    config.isLocked = config.isLocked === true;

    title = title || '';

    var eventBus = new WEBC.EventBus(accordionContainer, ["CloseAccordion", "OpenAccordion", "LockAccordion", "UnlockAccordion"]);

    eventBus.onCloseAccordion(close);
    eventBus.onOpenAccordion(open);

    eventBus.onLockAccordion(lock);
    eventBus.onUnlockAccordion(unlock);

    accordionContainer.open = open;
    accordionContainer.close = close;

    accordionContainer.lock = lock;
    accordionContainer.unlock = unlock;

    loadView();
    return accordionContainer;

    function loadView() {
        accordionContainer.removeChildren();
        init(accordionContainer, content, title, config, eventBus);
    }

    function open() {
        config.isOpen = true;
        accordionContainer.dispatchEvent(new CustomEvent("accordion-open"));
        loadView();
    }

    function close() {
        if (config.isLocked) return;
        config.isOpen = false;
        loadView();
    }

    function lock() {
        config.isLocked = true;
        loadView();
    }

    function unlock() {
        config.isLocked = false;
        loadView();
    }
}

function init(accordionContainer, content, title, config, eventBus) {
    return accordionContainer.addChildren(
        accordionView(content, title, config, eventBus)
    );
}

function accordionView(content, title, config, eventBus) {
    return WEBC.el("div").addClasses("ac-accordion__content-container").addChildren(
        createHeader(config, title, eventBus),
        createContent(content, config)
    );
}

function createHeader(config, title, eventBus) {
    var titleContainer = WEBC.el("span").addClasses("ac-accordion__title");

    WEBC.retriveValue(title).then(function (titleText) {
        titleContainer.addChildren(titleText);
    });

    return WEBC.el("div").addClasses("ac-accordion__header", config.isLocked ? 'ac-accordion__header--locked' : 'ac-accordion__header--unlocked').addChildren(
        new WEBC.Icon(config.isOpen ? 'caret-down' : 'caret-right'),
        titleContainer,
        function () {
            if (config.isOpen && config.isLockeable) {
                return new WEBC.Icon(config.isLocked ? 'lock' : 'unlock').addClasses("ac-accordion__right-icon").addEvent("click", function (evt) {
                    evt.stopPropagation();
                    if (config.isLocked) {
                        eventBus.dispatchUnlockAccordion();
                    } else {
                        eventBus.dispatchLockAccordion();
                    }
                });
            }
        }
    ).addEvent("click", function () {
        if (!config.isLocked) {
            if (config.isOpen) {
                eventBus.dispatchCloseAccordion();
            } else {
                eventBus.dispatchOpenAccordion();
            }
        }
    });
}

function createContent(content, config) {
    var accordionBody = WEBC.el("div").addClasses("ac-accordion__body").addChildren(content);

    if (!config.isOpen) {
        accordionBody.addClasses("ac-none");
    }

    return accordionBody;
}