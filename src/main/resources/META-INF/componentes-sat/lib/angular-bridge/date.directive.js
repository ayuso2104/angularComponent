;
(function (angular, Calendar, FloatElement) {
    "use strict";

    angular.module("ac.date", []);

    angular.module("ac.date").service("acOpenerDate", _acOpenerDate);

    _acOpenerDate.$inject = [];

    function _acOpenerDate() {
        var vm = this;

        vm.register = _register;
        vm.open = _open;

        var calendars = {};

        function _register(name, floatElement) {
            if(calendars.hasOwnProperty(name)) {
                throw new Error("Ya existe un calendario con este nombre");
            }

            calendars[name] = floatElement;
        }

        function _open(name) {
            return calendars[name].toggle();
        }
    }

    angular.module("ac.date").directive("acDate", _acDate);
    _acDate.$inject = ["$filter", "acOpenerDate"];

    function _acDate($filter, acOpenerDate) {

        return {
            restrict: 'A',
            require: 'ngModel',
            scope: {
                'format': '@format',
                'ngModel': '=',
                'nameDate': '@acDate',
                'before': '=before',
                'after': '=after',
                'acRef': '=?acRef',
                'ngChange': '=?ngChange'
            },
            link: link
        };

        function link(scope, element, attrs, ngModel) {

            scope.format = scope.format || "dd-MM-yyyy";

            var calendar = new Calendar();
            scope.acRef = calendar;

            scope.$watch('before', updateLimits);
            scope.$watch('after', updateLimits);
            actualiza();

            function updateLimits(newValue, oldValue) {

                if(!oldValue && !newValue) {
                    return;
                }

                actualiza();
            }

            function actualiza() {
                calendar.setLimits({
                    before: scope.before,
                    after: scope.after
                });
            }

            calendar.classList.add("ac-calendar--float");
            var floatElement = new FloatElement(element[0], calendar);

            element[0].classList.add("pointer");
            element[0].setAttribute('readonly', true);
            element[0].addEventListener("click", function () {
                floatElement.toggle();
            });

            calendar.addEventListener("date-selected", function (evt) {
                floatElement.hide();
                scope.$apply(function () {
                    scope.ngModel = angular.copy(evt.detail);
                    if(scope.ngChange) {
                        scope.$eval(scope.ngChange);
                    }
                });
            });
            
            ngModel.$formatters.push(function (value) {
                if(!value) return;

                return $filter('date')(value, scope.format);
            });

            if(scope.nameDate) {
                acOpenerDate.register(scope.nameDate, floatElement);
            }
        }
    }


    angular.module("ac.date").directive("acOpenDateFor", _acOpenDateFor);

    _acOpenDateFor.$inject = ["acOpenerDate"];
    function _acOpenDateFor(acOpenerDate) {
        return {
            link: link,
            scope: {
                'nameDate': '@acOpenDateFor'
            }
        };


        function link(scope, element, attrs) {
            element[0].addEventListener("click", function (evt) {
                acOpenerDate.open(scope.nameDate);
                evt.stopPropagation();
            });
        }
    }

})(angular, WEBC.Calendar, WEBC.FloatElement);