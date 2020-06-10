;
(function (angular, SelectorMultiple) {
    "use strict";

    angular.module("app").controller("SelectorMultipleCtrl", SelectorMultipleCtrl);

    SelectorMultipleCtrl.$inject = ["$scope"];

    function SelectorMultipleCtrl($scope) {
        var vm = this;

        $scope.$on("$viewContentLoaded", function () {

            vm.options = [{ ref: 'XS' }, { ref: "REF"}];

            FloatElement(SelectorMultiple([{
                name: "a value"
            }, {
                name: new Promise(function (resolve) {
                    resolve("Nuevo val prom")
                })
            }, {
                name: function () {
                    return "XS funct";
                }
            }], 'name')).render(document.getElementById("selector-multiple"));
        });
    }

})(angular, WEBC.SelectorMultiple);