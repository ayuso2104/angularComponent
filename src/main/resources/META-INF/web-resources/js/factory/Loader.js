(function () {
    'use strict';
    angular.module("LoaderModule", ["contextPath"]).factory("Loader", Loader);

    Loader.$inject = ["$compile", "contextPath"];

    function Loader($compile, contextPath) {

        var conteo = 0;

        var self = {};

        self.mostrar = function () {
            conteo++;
            if (conteo > 1) {
                return;
            }
            
            var valorDefecto = "recurso";
            var loaderPath = document.querySelector("meta[name='loader-path']");
            
            if(loaderPath) {
                valorDefecto = loaderPath.getAttribute("value");
            }
            
            var wrapper = angular.element(
                "<div id='unique-loader-component' class='loader-wrapper'> " +
                "<div class='loader-content panel panel-primary'><div class='panel-heading cabezera'>Procesando</div>" +
                "<div class='loader-message panel-body'><img src='./" + valorDefecto +"/images/ajaxloading.gif'></img></div></div></div>");
            angular.element(document.querySelector("body")).append(wrapper);
        };

        self.quitar = function () {
            conteo--;
            if (conteo <= 0) {
                angular.element(document.getElementById("unique-loader-component")).remove();
            }
        };

        return self;

    }


})();
