/**
 * Manejar los ingresos prohibidos a la
 * aplicacion.
 */
(function () {
    'use strict';

    angular
        .module('sessionExpirada', ['LocalStorageModule'])
        .controller('sessionExpiradaController', sessionExpiradaController);

    sessionExpiradaController.$inject = ['localStorageService'];
    function sessionExpiradaController(localStorageService) {
        var vm = this;
        vm.error = "";

        _init();

        function _init() {
            console.log("init del sessionExpiradaController");
            if (localStorage.getItem('sesionFake')){
                console.warn("deberia usar el localStorageService");
                vm.error = localStorage.getItem('errorSession') || 'Sesi\u00F3n Expirada';
                vm.crearSession = localStorage.getItem('sesionFake') === "true";
            }else{
                vm.error = localStorageService.get('errorSession') || 'Sesi\u00F3n Expirada';
                vm.crearSession = localStorageService.get('sesionFake') === "true";
            }
        }
    }
})();
