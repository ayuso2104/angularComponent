;
(function (angular, SelectorMultiple) {
    "use strict";

    angular.module("ac.selectorMultiple", []);

    angular.module("ac.selectorMultiple").directive("acSelectorMultiple", _acSelectorMultiple);

    _acSelectorMultiple.$inject = ["$log"];

    function _acSelectorMultiple($log) {
        return {
            scope: {
                acOptions: "=acOptions",
                acAttribute: "@acAttribute",
                ngModel: "="
            },
            require: "ngModel",
            link: link
        };

        function link($scope, $element, $attrs, $ngModel) {
            var isOpen = false;
            var floatElement;
            var selector = document.createElement("div");
            selector.classList.add("element-selector-container");
            $element[0].insertAdjacentElement("afterend", selector);

            var parentElement = $element[0].parentElement;
            var position = getComputedStyle(parentElement).position;
            if(!position || (position && position === "static")) {
                parentElement.style.setProperty("position", "relative");
            }

            $scope.ngModel = $scope.ngModel || [];

            if ($scope.acOptions) {
                createFloatElement();
            }

            $scope.$watch("acOptions", function () {
                if ($scope.acOptions) {
                    createFloatElement();
                }
            });

            $element[0].addEventListener("click", function (evt) {
                if (!floatElement) return;

                if (isOpen) {
                    floatElement.requestClose();
                } else {
                    floatElement.requestOpen();
                }

                evt.stopPropagation();
            });

            $ngModel.$formatters.push(function (value) {
                $log.debug("$formatter ", value);
                if(!value) return "";

                return value.map(function (item) {
                    return $scope.acAttribute ? item[$scope.acAttribute] : item;
                }).join(",");
            });

            function createFloatElement() {
                selector.innerHTML = "";
                floatElement = FloatElement(SelectorMultiple($scope.acOptions, ($scope.acAttribute || "")).on("selected-items", function (evt) {
                    $scope.$apply(function () {
                        $scope.ngModel = angular.copy(evt.detail);
                    });
                })).on("closed", function () {
                    isOpen = false;
                }).on("opened", function () {
                    isOpen = true;
                }).render(selector);
            }

        }
    }

})(angular, WEBC.SelectorMultiple);