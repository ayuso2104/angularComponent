;
(function (document, angular, AccordionTab, el) {
    "use strict";

    angular.module("app").controller("AcordeonCtrl", AcordeonCtrl);

    AcordeonCtrl.$inject = ["$log", "$scope"];

    function AcordeonCtrl($log, $scope) {

        var vm = this;
        vm.valor = "Este es el valor";
    
        $scope.$on("$viewContentLoaded", function () {

            $log.log("Mensajito desde el controller con este dato {} y este otro {}", 98, 90);
            var accordion = new AccordionTab(
                el("div").addChildren("Contenido")
            );
            
            document.getElementById("accordion-1").appendChild(accordion);
        });

    }

    angular.module("app").controller("SubAccordionCtrl", SubAccordionCtrl);

    SubAccordionCtrl.$inject = ["$log"];

    function SubAccordionCtrl($log) {

        var vm = this;
        vm.otroMensaje = "Otro mensaje";

        vm.accion = function () {
            $log.debug("Se produjo el evento");
        };

    }

})(document, angular, WEBC.AccordionTab, WEBC.el);