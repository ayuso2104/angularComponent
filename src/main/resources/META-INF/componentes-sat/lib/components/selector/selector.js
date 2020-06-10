import Common from './../common';
import sortBy from 'lodash/sortBy';
import map from 'lodash/map';
import filter from 'lodash/filter';

const el = Common.el;
const InputIcon = Common.InputIcon;
const ButtonIcon = Common.ButtonIcon;
const retriveValueOfData = Common.retriveValueOfData;
const substract = Common.substract;


export default {
    CheckBoxLabel: CheckBoxLabel,
    PanelSearch: PanelSearch,
    SelectorItems: SelectorItems
};


function CheckBoxLabel(labelContent, a_modelValue) {
    var _modelValue = a_modelValue;
    var label = el("span").addClasses("selector-items__list-label");
    var checkbox = el("input").addAttributes({
        type: "checkbox"
    }).addClasses("selector-items__list-check");

    if (labelContent) {
        _setValue(labelContent)
    }

    var checkBoxLabel = el("div").addAttributes({
            draggable: true
        }).addEvent("dragstart", function (evt) {
            evt.dataTransfer.setData("text", JSON.stringify(a_modelValue));
        })
        .addClasses("checkbox", "selector-items__list-item").addChildren(
            el("label").addClasses("break-word").addChildren(
                checkbox,
                label
            )
        );

    checkBoxLabel.setValue = _setValue.bind(checkBoxLabel);
    checkBoxLabel.setModel = _setModel;
    checkBoxLabel.getModel = _getModel;
    checkBoxLabel.isSelected = _isSelected;
    checkBoxLabel.setSelected = _setSelected;
    checkBoxLabel.references = {
        checkbox: checkbox
    };

    return checkBoxLabel;

    function _setValue(labelContent) {
        label.removeChildren();
        label.addChildren(labelContent);
    }

    function _setModel(a_modelValue) {
        _modelValue = a_modelValue;
    }

    function _getModel() {
        return _modelValue;
    }

    function _isSelected() {
        return checkbox.checked;
    }

    function _setSelected(value) {
        checkbox.checked = value;
    }
}

function PanelSearch(elements, attribute, config) {
    config = config || {};
    var selectorAll;
    var containerElements = el("div").addClasses("selector-items__list", "overflow-y-auto", "h-100");
    var fnFilter = function () {
        return 1;
    };
    _addElements();

    var inputSearch = new InputIcon("search", config.label, {
        uppercase: config.uppercase
    });

    inputSearch.addEvent("input", _ajustSearchFilter);
    inputSearch.addEvent("click", _cleanSearchFilter);


    var selectorItems = el("div").addClasses("selector-items__items", "selector-items__items--from", "col-xs-12", "col-sm-5", "col-md-5", "col-lg-5", "b-gray", "p-auto", "mb")
        .addChildren(
            inputSearch,
            el("hr").addClasses("my-1_4")
        );

    selectorItems.addEvent("drop", function (evt) {
            evt.preventDefault();
            var element = JSON.parse(evt.dataTransfer.getData("text"));

            var customEvent = new CustomEvent("elementTransfer", {
                detail: {
                    element: element
                }
            });

            selectorItems.dispatchEvent(customEvent);

        })
        .addEvent("dragover", function (evt) {
            evt.preventDefault();
        });

    if (config.hasAllCheck) {

        selectorAll = new CheckBoxLabel(config.labelAllCheck);
        selectorAll.addClasses("visible");
        selectorAll.querySelector(".selector-items__list-label").classList.add("text-bold");
        selectorItems.addChildren(selectorAll);

        selectorAll.addEvent("change", function (evt) {
            var value = evt.target.checked;
            Array.from(containerElements.children).forEach(function (checkboxLabel) {
                checkboxLabel.setSelected(value);
            });
        });


    }

    selectorItems.addChildren(containerElements);

    selectorItems.getSelectedElements = _getSelectedElements;
    selectorItems.setElements = _setElements;
    selectorItems.appendElements = _appendElements;
    selectorItems.getAllElements = _getAllElements;
    selectorItems.getElementsFiltered = _getElementsFiltered;
    selectorItems.cleanFilter = _cleanSearchFilter;

    return selectorItems;

    function _ajustSearchFilter(evt) {
        var search = inputSearch.references.input.value;
        containerElements.removeChildren();
        fnFilter = function (value) {
            return value.toLowerCase().indexOf(search.toLowerCase())
        };
        _addElements();
    }

    function _cleanSearchFilter() {
        inputSearch.references.input.value = '';
        _ajustSearchFilter();
    }

    function _addElements() {
        _getRetrives().then(_filterElements).then(function (retrives) {
            containerElements.removeChildren();
            retrives.forEach(function (retrive) {
                var checkBoxLabel = new CheckBoxLabel(retrive.value, retrive.element);
                checkBoxLabel.references.checkbox.addEventListener("change", function (evt) {
                    if(selectorAll) {
                        if (!evt.target.checked) {
                            selectorAll.references.checkbox.checked = false;
                        }
                    }
                });
                containerElements.appendChild(checkBoxLabel);
            });

            if(selectorAll) {
                if (retrives.length === 0) {
                    selectorAll.replaceClass("visible", "invisible");
                } else {
                    selectorAll.replaceClass("invisible", "visible");
                }
            }

            if (selectorAll) {
                selectorAll.setSelected(false);
            }

            var customEvent = new CustomEvent("change", {
                detail: {
                    elements: retrives.map(function (retrive) {
                        return retrive.element;
                    })
                }
            });

            selectorItems.dispatchEvent(customEvent);
        }, console.error);
    }

    function _getRetrives() {
        return Promise.all(elements.map(function (element) {
            return retriveValueOfData(element, attribute).then(function (value) {
                if(config.attributeSearch) {
                    return retriveValueOfData(element, config.attributeSearch).then(function (valueSearch) {
                        return {
                            value: value,
                            element: element,
                            searchValue: valueSearch
                        }
                    });
                }
                return {
                    value: value,
                    element: element,
                    searchValue: value
                }
            }, function (err) {
                console.log(`Ocurrió un error al recuperar el retrive`, err);
            });
        }))
    }

    function _filterElements(retrives) {
        console.log(map(sortBy(filter(map(retrives, retrive => ({
            index: fnFilter(retrive.searchValue),
            value: retrive,
            searchValue: retrive.searchValue
        })), it => {
            return it.index !== -1;
        }), ["index", "searchValue"]), it => it.value ));

        return map(sortBy(filter(map(retrives, retrive => ({
            index: fnFilter(retrive.searchValue),
            value: retrive,
            searchValue: retrive.searchValue
        })), it => {
            return it.index !== -1;
        }), ["index", "searchValue"]), it => it.value );
    }

    function _getSelectedElements() {
        return Array.from(containerElements.children).filter(function (checkBoxLabel) {
            return checkBoxLabel.isSelected();
        }).map(function (checkBoxLabel) {
            return checkBoxLabel.getModel();
        });
    }

    function _getElementsFiltered() {
        return new Promise(function (resolve, reject) {
            _getRetrives().then(_filterElements).then(function (retrives) {
                resolve(retrives.map(function (retrive) {
                    return retrive.element;
                }));
            });
        });
    }

    function _setElements(a_elements) {
        elements = a_elements;
        _addElements();
    }

    function _appendElements(a_elements) {
        elements = elements.concat(a_elements);
        _addElements();
    }

    function _getAllElements() {
        return elements;
    }
}

function SelectorItems(elements, attribute, config) {
    var mq = window.matchMedia("(max-width: 767px)");
    mq.addListener(_changeIconsByMedia);

    var leftPanel = new PanelSearch(elements, attribute, {
        label: config.labelFrom,
        labelAllCheck: config.labelAllCheck,
        hasAllCheck: config.hasAllCheck,
        uppercase: config.uppercase
    });
    var rightPanel = new PanelSearch([], attribute, {
        label: config.labelTo,
        labelAllCheck: config.labelAllCheck,
        hasAllCheck: config.hasAllCheck,
        uppercase: config.uppercase
    });


    var buttons = {
        allToRight: {
            sm: _createButton("angle-double-right", _sendAllToRight),
            lg: _createButton("angle-double-down", _sendAllToRight)
        },
        toRight: {
            sm: _createButton("angle-right", _sendToRight),
            lg: _createButton("angle-down", _sendToRight)
        },
        toLeft: {
            sm: _createButton("angle-left", _sendToLeft),
            lg: _createButton("angle-up", _sendToLeft)
        },
        allToLeft: {
            sm: _createButton("angle-double-left", _sendAllToLeft),
            lg: _createButton("angle-double-up", _sendAllToLeft)
        }
    };

    var buttonsContainer = el("div").addClasses("selector-items__controls", "col-xs-12", "col-sm-2", "col-md-2", "col-lg-2", "text-center");

    var selectorItems = el("div").addClasses("selector-items", "w-full", "m-0", "clearfix").addChildren(
        leftPanel,
        buttonsContainer,
        rightPanel
    );

    selectorItems.getSelectedElements = _getSelectedElements;
    selectorItems.setElements = _setElements;
    selectorItems.transferRightToLeft = _transferRightToLeft;
    selectorItems.transferLeftToRight = _transferLeftToRight;

    rightPanel.addEventListener("change", _resultChange);

    leftPanel.addEventListener("elementTransfer", function (evt) {
        _transferRightToLeft([evt.detail.element]);
    });
    rightPanel.addEventListener("elementTransfer", function (evt) {
        _transferLeftToRight([evt.detail.element]);
    });

    _changeIconsByMedia();

    return selectorItems;

    function _changeIconsByMedia() {
        var prefix = mq.matches ? "lg" : "sm";
        buttonsContainer.removeChildren();
        buttonsContainer.addChildren(
            buttons.allToRight[prefix],
            buttons.toRight[prefix],
            buttons.toLeft[prefix],
            buttons.allToLeft[prefix]
        );
    }

    function _createButton(iconName, eventListener) {
        var button = new ButtonIcon(iconName).addEvent("click", eventListener).addClasses("selector-items__controls__button", "mx-auto", "block", "sm-inline", "mb", "sm-mx");
        return button;
    }

    function _transferRightToLeft(elementsSelected) {
        leftPanel.appendElements(elementsSelected);
        rightPanel.setElements(substract(rightPanel.getAllElements(), elementsSelected));
        rightPanel.cleanFilter();
    }

    function _transferLeftToRight(elementsSelected) {
        rightPanel.appendElements(elementsSelected);
        leftPanel.setElements(substract(leftPanel.getAllElements(), elementsSelected));
        leftPanel.cleanFilter();
    }

    function _resultChange(evt) {
        if (!evt.detail) return;
        
        //evt.detail.elements.sort();
        //debugger ;
        var customEvent = new CustomEvent("resultChanges", {
            detail: {
                elements: evt.detail.elements
            }
        });

        selectorItems.dispatchEvent(customEvent);
    }

    function _setElements(elements) {
        leftPanel.setElements(elements);
        rightPanel.setElements([]);
    }

    function _getSelectedElements() {
        return rightPanel.getAllElements();
    }

    function _sendToRight() {
        var elementsSelected = leftPanel.getSelectedElements();
        _transferLeftToRight(elementsSelected);
    }

    function _sendToLeft() {
        var elementsSelected = rightPanel.getSelectedElements();
        _transferRightToLeft(elementsSelected);
    }

    function _sendAllToRight() {
        leftPanel.getElementsFiltered().then(function (values) {
            _transferLeftToRight(values);
        }, console.error);
    }

    function _sendAllToLeft() {
        rightPanel.getElementsFiltered().then(function (values) {
            _transferRightToLeft(values);
        }, console.error);
    }
}