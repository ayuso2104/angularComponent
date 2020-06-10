import Common from './../common';

var WEBC = {
    uuid: Common.uuid,
    retriveValueOfData: Common.retriveValueOfData
};
;
(function (window, document, WEBC, uuid, retriveValueOfData, EventBus) {
    "use strict";

    WEBC.SelectorMultiple = _selectorMultiple;

    function _selectorMultiple(options, attribute) {
        var elements = [];

        return el(".select-multiple")((options || []).map(function (option) {
            return _selectorItem(option, attribute);
        })).on("optionChecked", function (evt) {
            elements.push(evt.detail);
            evt.target.dispatchEvent(new CustomEvent("selected-items", {
                detail: elements
            }));
        }).on("optionUnChecked", function (evt) {
            elements.splice( elements.indexOf(evt.detail), 1);
            evt.target.dispatchEvent(new CustomEvent("selected-items", {
                detail: elements
            }));
        });
    }

    function _selectorItem(option, attribute) {
        var _uuid = uuid();

        return el(".select-item-container")([
            el(".select-item.clearfix")([
                el(".select-checkbox-container")([
                    _checkbox(_uuid, option)
                ]),
                el(".select-label-container")([
                    el("label").attr("for", _uuid)([
                        attribute ? retriveValueOfData(option, attribute) : option
                    ])
                ])
            ])
        ]);
    }

    function _checkbox(_uuid, option) {
        return el("input[type='checkbox']").attr("id", _uuid).on("change", function (evt) {
            evt.target.dispatch( evt.target.checked ? "optionChecked": "optionUnChecked", option);
        });
    }

})(window, document, WEBC, WEBC.uuid, WEBC.retriveValueOfData, WEBC.EventBus);

export default WEBC;