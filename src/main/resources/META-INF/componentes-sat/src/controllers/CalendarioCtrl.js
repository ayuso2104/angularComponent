;
(function (angular, document, Calendar, FloatElement, formatDate) {
    "use strict";

    angular.module("app").controller("CalendarioCtrl", _calendarioCtrl);

    _calendarioCtrl.$inject = ["$scope"];

    function _calendarioCtrl($scope) {

        $scope.$on("$viewContentLoaded", _init);

        function _init() {
            var calendar = new Calendar();
            document.getElementById("calendar").appendChild(calendar);

            calendar.addEventListener("date-selected", function (evt) {
                console.log("Fecha seleccionada: ", evt.detail);
            });


            var button = document.getElementById("calendar-action");

            var otherCalendar = new Calendar();
            var floatElement = new FloatElement(button, otherCalendar);
            
            button.addEventListener("click", function () {
                floatElement.toggle();
            });

            otherCalendar.addEventListener("date-selected", function () {
                floatElement.hide();
            });



            var input = document.getElementById("calendar-input");

            var otherCalendar2 = new Calendar();
            var floatElement2 = new FloatElement(input, otherCalendar2);
            
            input.addEventListener("click", function () {
                floatElement2.toggle();
            });

            otherCalendar2.addEventListener("date-selected", function (evt) {
                floatElement2.hide();

                input.setAttribute("value", formatDate(evt.detail, 'yyyy-MM-dd'));
            });


        }

    }

})(angular, document, WEBC.Calendar, WEBC.FloatElement, WEBC.formatDate);