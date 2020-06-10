const PLANTILLA = require("./selectSearch.html");

/** @ngInject */
export default ($compile, $rootScope, $window, $timeout) => {

    let link = ($scope, $element, $attrs, $ngModel, $transclude) => {
        $scope.isOpen = false;
        $element.addClass("select-search");
        $element.addClass("pointer");

        let insideElement = document.createElement("div");
        insideElement.classList.add("select-search__inside");
        let changeModelView = () => {
            angular.element(insideElement).empty();
            angular.element(insideElement).append(modelView());
        };

        $scope.$watch('ngModel', () => changeModelView());

        let span = document.createElement("span");
        span.classList.add("fas", "fa-caret-down", "form-control-feedback", "form-control-feedback-no-label", "no-col", "pointer");
        span.addEventListener("click", _process);

        let spanClose = document.createElement("span");
        spanClose.classList.add("fas", "fa-times", "form-control-feedback", "form-control-feedback-no-label", "no-col", "pointer");
        spanClose.addEventListener("click", () => {
            $scope.$apply( () => {
                $scope.ngModel = undefined;
            });
        });

        let modelView = () => {
            if(!$scope.ngModel) {
                if($element[0].parentElement.contains(spanClose)) {
                    spanClose.remove();
                }
                $element[0].insertAdjacentElement('afterend', span);
                return $scope.default;
            }
            if($element[0].parentElement.contains(span)) {
                span.remove();
            }
            $element[0].insertAdjacentElement('afterend', spanClose);
            return ($scope.attributeStr || "").split(",").map( it => $scope.ngModel[it.trim()]).join(" - ")
        };

        $element[0].parentElement.classList.add("has-feedback");
        $element[0].classList.add("pointer");

        insideElement.addEventListener("click", _process);

        $element.append(insideElement);

        function joinValues(str, ctx) {
            return str.split(",").map( it => ctx[it.trim()]).join(" - ");
        }

        function  _process() {
                if($scope.ngDisabled) {
                    return;
                }

                if($element.children().length > 1) {
                    return;
                }

                let $newScope = $scope.$new();
                Object.assign($newScope, {
                    options: $scope.options,
                    key: $scope.key,
                    label: $scope.label,
                    evalute: ctx => {
                        return joinValues($scope.attributeStr || "", ctx);
                    },
                    setModel: item => {
                        $scope.ngModel = item;
                        closeSelector();
                    },
                    attributeFilter: item => {
                        let value = joinValues($scope.attributeSearch || $scope.attributeStr || "", item);
                        return {
                            index: value.toUpperCase().indexOf(($newScope.valueToSearch || "").toUpperCase()),
                            valueStr: value
                        };
                    },
                    cleanFilter: ($event) => {
                        $event.stopPropagation();
                        $newScope.valueToSearch = undefined;
                    }
                });
                let result = $compile(PLANTILLA)($newScope);

                let closeSelector = () => {
                    let $newElement = document.getElementById("select-search-" + $newScope.$id);
                    if(!$newElement) return;
                    $newElement.remove();
                    $window.removeEventListener("click", fnClose);
                    document.body.removeEventListener("keydown", fnCloseKey);
                    $scope.isOpen = false;
                };

                let fnClose = evt => {
                    let $newElement = document.getElementById("select-search-" + $newScope.$id);
                    if(!$newElement) {
                        return;
                    }
                    if(!$newElement.contains(evt.target) && evt.target !== $element[0]) {
                        closeSelector();
                    }
                };

                let fnCloseKey = evt => {
                    if(evt.keyCode === 27) {
                        closeSelector();
                    }
                };

                $timeout(() => {
                    result[0].setAttribute("id", "select-search-" + $newScope.$id);
                    $element[0].appendChild(result[0]);
                    $window.addEventListener("click", fnClose);
                    document.body.addEventListener("keydown", fnCloseKey);
                    $scope.isOpen = true;
                });
        }

    };

    return {
        link,
        restrict: 'E',
        require: 'ngModel',
        scope: {
            options: '=',
            key: '@',
            attributeStr: '@',
            attributeSearch: '@',
            default: '@',
            ngModel: '=',
            isOpen: '=?',
            ngDisabled: '=?'
        },
        transclude: true
    }
}