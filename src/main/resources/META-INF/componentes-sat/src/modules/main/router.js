;
(function (angular) {
    "use strict";

    angular.module("app").config(_routeConfig);

    _routeConfig.$inject = ["$stateProvider", "$urlRouterProvider"];

    function _routeConfig($stateProvider, $urlRouterProvider) {

        $urlRouterProvider.otherwise("/app/principal");

        var baseApp = {
            name: "base-app",
            url: "/app",
            templateUrl: "src/templates/base/base-app.html",
            abstract: true
        };

        var vistaPrincipal = {
            name: "base-app.principal",
            url: "/principal",
            templateUrl: "src/templates/principal/principal.html"
        };

        var vistaSelector = {
            name: "base-app.selector",
            url: "/selector-items",
            templateUrl: "src/templates/componentes/selector-items.html",
            controller: "MainCtrl",
            controllerAs: "vm"
        };

        var vistaTabla = {
            name: "base-app.tabla",
            url: "/table",
            templateUrl: "src/templates/componentes/tabla.html",
            controller: "TablaCtrl",
            controllerAs: "vm"
        };

        var vistaMenu = {
            name: "base-app.menu",
            url: "/menu-contextual",
            templateUrl: "src/templates/componentes/menu.html",
            controller: "MenuCtrl",
            controllerAs: "vm"
        };

        var vistaCalendar = {
            name: "base-app.calendario",
            url: "/calendario",
            templateUrl: "src/templates/componentes/calendario.html",
            controller: "CalendarioCtrl",
            controllerAs: "vm"
        };

        var vistaModal = {
            name: "base-app.modal",
            url: "/modal",
            templateUrl: "src/templates/componentes/modal.html",
            controller: "ModalCtrl",
            controllerAs: "vm"
        };

        var vistaAccordion = {
            name: "base-app.accordion",
            url: "/acordeon",
            templateUrl: "src/templates/componentes/acordeon.html",
            controller: "AcordeonCtrl",
            controllerAs: "vm"
        };

        var vistaAccordion = {
            name: "base-app.selectorMultiple",
            url: "/selector-multiple",
            templateUrl: "src/templates/componentes/selector-multiple.html",
            controller: "SelectorMultipleCtrl",
            controllerAs: "vm"
        };

        $stateProvider
            .state(baseApp)
            .state(vistaPrincipal)
            .state(vistaSelector)
            .state(vistaTabla)
            .state(vistaMenu)
            .state(vistaCalendar)
            .state(vistaModal)
            .state(vistaAccordion);
    }

})(angular);