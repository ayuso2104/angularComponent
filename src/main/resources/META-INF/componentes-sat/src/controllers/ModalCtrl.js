;
(function (document, angular, Modal, el, confirm, message) {
    "use strict";

    angular.module("app").controller("ModalCtrl", ModalCtrl);

    ModalCtrl.$inject = ["$scope", "acModalService"];

    function ModalCtrl($scope, acModalService) {
        var vm = this;
        vm.abrir = _abrir;
        vm.abrirConfirm = _abrirConfirm;
        vm.abrirMessage = _abrirMessage;
        vm.ngAbrir = _ngAbrir;

        var modal;
        $scope.$on("$viewContentLoaded", init);

        function init() {
            modal = new Modal("El titulo es este", el("div").addChildren("Este es el contenido"), [
                {
                    text: "Cerrar",
                    icon: "times",
                    action: function (ctx) {
                        ctx.close();
                    }
                },
                {
                    text: "Enviar",
                    icon: "clone",
                    action: function (ctx) {
                        console.log("Se enviar");
                        ctx.close();
                    }
                }
            ]);

            modal.addEventListener("close-modal", function () {
                console.log("xs");
            });
        }

        function _abrir() {
            init();
            document.body.appendChild(modal);
        }

        function _abrirConfirm() {
            confirm(new Promise(function (resolve) {
                resolve("Seguro de continuar");
            }), new Promise(function (resolve) {
                resolve("Seguro??");
            })).then(function(isConfirmed) {
                console.log(isConfirmed ? "Si continua": "No, cancele");
            });
        }

        function _abrirMessage() {
            message(vm.mensaje, vm.title, {
                type: vm.type,
                icon: 'times-circle'
            });
        }

        function _ngAbrir() {
            acModalService.open("mostrar-mensaje");
        }

    }

})(document, angular, WEBC.Modal, WEBC.el, WEBC.confirm, WEBC.message);