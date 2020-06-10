import isNil from 'lodash/isNil';

;
(function (angular, SelectorItems) {
    "use strict";

    angular.module("ac.selector", []);

    angular.module("ac.selector").directive("acSelector", _acSelector);

    _acSelector.$inject = ["$timeout"];

    function _acSelector($timeout) {

        return {
            require: 'ngModel',
            link: _link,
            scope: {
                ngModel: '=ngModel',
                acSelected: '=acSelected',
                attribute: '=attribute',
                attributeStr: '@',
                labelFrom: '@labelFrom',
                labelTo: '@labelTo',
                labelAllCheck: '@all',
                resultChanges: '&resultChanges',
                attributeSearch: '@'
            }
        };

        function _link(scope, element, attr) {

            var selector = new SelectorItems( scope.ngModel || [], scope.attribute ? scope.attribute: scope.attributeStr, {
                labelFrom: scope.labelFrom,
                labelTo: scope.labelTo,
                hasAllCheck: !!scope.labelAllCheck,
                labelAllCheck: scope.labelAllCheck,
                uppercase: !isNil(attr.uppercase),
                attributeSearch: scope.attributeSearch
            });

            scope.$watch('ngModel', function () {
                selector.setElements(scope.ngModel || []);
                if(scope.acSelected && scope.acSelected.length > 0) {
                    selector.transferLeftToRight(scope.acSelected);
                }
            });

            selector.addEventListener("resultChanges", function (evt) {
                scope.$apply(function () {
                    scope.acSelected = evt.detail.elements;
                    $timeout(() => {
                        if(scope.resultChanges) {
                            scope.resultChanges();
                        }
                    });
                });
            });

            element.append(selector);
        }
    }


})(angular, WEBC.SelectorItems);