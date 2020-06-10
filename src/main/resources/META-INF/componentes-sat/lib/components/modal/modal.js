import Common from './../common';
var WEBC = {
    el: Common.el,
    EventBus: Common.EventBus,
    uuid: Common.uuid,
    retriveValue: Common.retriveValue,
    Icon: Common.Icon,
    Button: Common.Button
};

const ESCAPE = 27;
const ENTER = 13;

;
(function (window, document, WEBC, el, EventBus, Icon, Button, retriveValue, uuid) {
    "use strict";

    WEBC.Modal = _modal;

    function _modal(title, content, footerButtons, config) {
        var modalContainer = el("div").addClasses("ac-modal-container");
        var eventBus = new EventBus(modalContainer, ["CloseModal", "ExpandModal", "CompressModal"]);

        config = config || {};
        config.showCloseButton = config.showCloseButton === false ? false: true;
        config.showExpandButton = config.showExpandButton === false ? false: true;

        title = title || "";
        content = content || el("div");
        footerButtons = footerButtons || [];

        init(modalContainer, title, content, footerButtons, config, eventBus);
        modalContainer.eventBus = eventBus;
        return modalContainer;
    }

    function init(modalContainer, title, content, footerButtons, config,  eventBus) {
        var contentView = createContentView(title, content, footerButtons, config, eventBus);
        modalContainer.addChildren(contentView);

        var closeOnEventModal = function (evt) {
            if(evt.keyCode === ESCAPE) {
                eventBus.dispatchCloseModal();
            }
        };

        if(config.showCloseButton) {
            document.addEventListener("keydown", closeOnEventModal);
        }

        modalContainer.addEvent("mousedown", function (evt) {
            if(!config.showCloseButton) {
                return;
            }
            if (evt.target !== modalContainer) {
                return;
            }
            if(config.closeOnContainerClick === false) {
                return;
            }
            eventBus.dispatchCloseModal();
        });

        modalContainer.addEvent("dragover", function (evt) {
            evt.preventDefault();
        });

        modalContainer.addEvent("drop", function (evt) {
            evt.preventDefault();
            var data = JSON.parse(evt.dataTransfer.getData("text"));

            var contentContainer = document.getElementById(data.id);

            var height = (evt.clientY - data.heightToAdd) + "px";
            var width = (evt.clientX - data.widthToAdd) + "px";

            contentContainer.style.setProperty("top", height);
            contentContainer.style.setProperty("left", width);
        });

        eventBus.onCloseModal(function (evt) {
            closeModal(modalContainer, evt.detail);
        });

        eventBus.onExpandModal(expandModal);
        eventBus.onCompressModal(compressModal);

        modalContainer.expandModal = expandModal;
        modalContainer.compressModal = compressModal;

        function expandModal() {
            contentView.style.removeProperty("top");
            contentView.style.removeProperty("left");
            contentView.addClasses("expand-modal");
        }

        function compressModal() {
            contentView.removeClasses("expand-modal");
        }

        function closeModal(modalContainer, detail) {
            document.removeEventListener("keydown", closeOnEventModal);
            modalContainer.remove();
            modalContainer.dispatchEvent(new CustomEvent("close-modal", {
                detail: detail
            }));
        }
    }

    function pxToNumber(value) {
        if (!value)
            return 0;
        return Number(value.replace("px", ""));
    }

    function createContentView(title, content, footerButtons, config, eventBus) {
        var idContentContainer = uuid();
        var headerView = createHeader(title, config, eventBus);

        var cbody = createBody(content, config);
        var cfooter = createFooter(footerButtons, eventBus);

        var contentView = el("div").addClasses("ac-modal-content-container").addChildren(
            headerView,
            cbody,
            cfooter
        ).addAttributes({
            "id": idContentContainer,
            "draggable": true
        });

        cbody.addEventListener("mouseenter", function () {
            contentView.removeAttribute("draggable");
        });

        cbody.addEventListener("mouseleave", function () {
            contentView.addAttributes({"draggable": true});
        });

        cfooter.addEventListener("mouseenter", function () {
            contentView.removeAttribute("draggable");
        });

        cfooter.addEventListener("mouseleave", function () {
            contentView.addAttributes({"draggable": true});
        });

        contentView.references = {
            'header': headerView
        };

        var targetInModal;

        contentView.addEvent("mousedown", function (evt) {
            targetInModal = evt.target;
        });

        contentView.addEvent("dragstart", function (evt) {

            if (targetInModal && (targetInModal.matches(".ac-modal-header") || targetInModal.matches(".ac-modal__title"))) {

                var computedStyles = window.getComputedStyle(contentView);

                evt.dataTransfer.setData("text", JSON.stringify({
                    "id": idContentContainer,
                    "widthToAdd": evt.clientX - pxToNumber(computedStyles.left),
                    "heightToAdd": evt.clientY - pxToNumber(computedStyles.top)
                }));
            } else {
                evt.preventDefault();
            }
        });

        return contentView;
    }

    function createHeader(title, config, eventBus) {
        var modalTitle = el("div").addClasses("ac-modal__title");

        retriveValue(title).then(function (titleText) {
            modalTitle.addChildren(titleText);
        });

        var expandButton = new Icon("expand-arrows-alt").addClasses("ac-modal__button").addEvent("click", function (evt) {
            if (evt.target.classList.contains("fa-expand-arrows-alt")) {
                evt.target.classList.replace("fa-expand-arrows-alt", "fa-compress-arrows-alt");
                eventBus.dispatchExpandModal();
            } else {
                evt.target.classList.replace("fa-compress-arrows-alt", "fa-expand-arrows-alt");
                eventBus.dispatchCompressModal();
            }
        });

        var closeButton = new Icon("times").addClasses("ac-modal__button").addEvent("click", eventBus.dispatchCloseModal);

        var header = el("div").addClasses("ac-modal-header").addChildren(modalTitle);

        if(config.showExpandButton) {
            header.addChildren(expandButton)
        }

        if(config.showCloseButton) {
            header.addChildren(closeButton);
        }

        return header;
    }

    function createBody(content) {
        return el("div").addClasses("ac-modal-body").addChildren(
            createContent(content)
        );
    }

    function createFooter(footerButtons, eventBus) {
        var footer = el("div").addClasses("ac-modal-footer");

        footerButtons.forEach(function (button) {
            createButton(footer, button, eventBus);
        });

        return footer;
    }

    function createButton(footer, button, eventBus) {
        if (button.text) {
            retriveValue(button.text).then(function (textRetrive) {
                createButtonRetrives(textRetrive, button, footer, eventBus);
            });
        } else {
            createButtonRetrives(undefined, button, footer, eventBus);
        }
    }

    function createButtonRetrives(text, button, footer, eventBus) {
        let buttonDOM = new Button(text, button.icon, button.context).addEvent("click", function () {
            if (button.action) {
                button.action({
                    close: function () {
                        eventBus.dispatchCloseModal(button);
                    }
                })
            } else {
                throw new Error("No hay action definida");
            }
        });
        if(button.disabled && button.disabled()) {
            buttonDOM.addAttributes({'disabled': true});
        }
        footer.addChildren(
            buttonDOM
        )
    }

    function createContent(content) {
        var contentElement = el("div").addClasses("ac-modal-content");

        retriveValue(content).then(function (contentText) {
            contentElement.addChildren(contentText);
        });

        return contentElement;
    }


})(window, document, WEBC, WEBC.el, WEBC.EventBus, WEBC.Icon, WEBC.Button, WEBC.retriveValue, WEBC.uuid);

/**
 * Cuadro de confirmación, y mensaje
 *
 */
;
(function (document, WEBC, Modal, el, retriveValue, Icon) {
    "use strict";

    WEBC.ConfirmModal = _confirmModal;
    WEBC.MessageModal = _messageModal;
    WEBC.confirm = _confirmHelper;
    WEBC.message = _messageHelper;
    WEBC.messageError = _messageError;

    function _messageModal(message, title, config) {
        config = config || {};
        config.showContinueButton = config.showContinueButton === false ? false: true;
        message = message || "";
        title = title || "";
        var textToConfirm = config.textToConfirm || "Continuar";
        var type = config.type || "bg-default";

        return new Promise(function (resolve) {

            var buttonConfirm = {
                text: textToConfirm,
                action: function (ctx) {
                    ctx.close();
                }
            };

            var messageContainer = el("div").addClasses(type, "ac-message");

            if (config.icon) {
                var icon = new Icon(config.icon).addClasses("ac-modal-icon");
                messageContainer.addEvent("click", function (evt) {
                    if(evt.target.matches(".ac-modal-icon")) {
                        (config.onClickOnIcon || function () {})(evt);
                    }
                });
                messageContainer.addChildren(icon);
            }

            retriveValue(message).then(function (messageRetrive) {
                messageContainer.addChildren(messageRetrive);
            });

            var addButtons = config.showContinueButton ? [ buttonConfirm ] : []

            let elementToAppend = messageContainer;
            if(config.extraInfo) {
                elementToAppend = el("div").addChildren(
                    messageContainer.addClasses("mb"),
                    el("div").addClasses("ac-modal-extra-info").addChildren(config.extraInfo)
                );
            }

            var modal = new Modal(title, elementToAppend, addButtons, config);

            modal.addEvent("close-modal", function (evt) {
                resolve();
            });

            document.body.appendChild(modal);
        });
    }

    function _confirmModal(message, title, config) {
        config = config || {};
        message = message || "";
        title = title || "¿Esta seguro?";
        var textToCancel = config.textToCancel || "Cancelar";
        var textToConfirm = config.textToConfirm || "Continuar";
        var type = config.type || "bg-default";

        return new Promise(function (resolve) {

            var buttonCancel = {
                text: textToCancel,
                action: function (ctx) {
                    ctx.close();
                }
            };
            var buttonConfirm = {
                text: textToConfirm,
                action: function (ctx) {
                    ctx.close();
                }
            };

            var messageContainer = el("div").addClasses(type, "ac-message");

            if (config.icon) {
                var icon = new Icon(config.icon).addClasses("ac-modal-icon");
                messageContainer.addEvent("click", function (evt) {
                    if(evt.target.matches(".ac-modal-icon")) {
                        (config.onClickOnIcon || function () {})(evt);
                    }
                });
                messageContainer.addChildren(icon);
            }

            retriveValue(message).then(function (messageRetrive) {
                messageContainer.addChildren(messageRetrive);
            });

            var modal = new Modal(title, messageContainer, [
                buttonCancel,
                buttonConfirm
            ]);

            modal.addEvent("close-modal", function (evt) {
                resolve(evt.detail === buttonConfirm);
            });

            document.body.appendChild(modal);
        });
    }

    function _confirmHelper(message, title, config) {
        return new WEBC.ConfirmModal(message, title, config);
    }

    function _messageHelper(message, title, config) {
        return new WEBC.MessageModal(message, title, config);
    }

    function _messageError(message, title, config) {
        config = config || {};
        return new WEBC.MessageModal(message, title, Object.assign(config,{
            type: "bg-danger",
            icon: "times"
        }));
    }

})(document, WEBC, WEBC.Modal, WEBC.el, WEBC.retriveValue, WEBC.Icon);

export default WEBC;