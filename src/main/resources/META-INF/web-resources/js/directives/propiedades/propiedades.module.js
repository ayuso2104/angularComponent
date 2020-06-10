;(function () {
    "use strict";

    var URL_BASE = "rest/dev/propiedades/";
    var LISTA = "lista-propiedades";
    var PROPIEDADES = "bean/";
    var RESTAURAR = "restaurar";

    angular.module("propiedadesModule", []);

    angular.module("propiedadesModule").directive("propiedades", _propiedadesDirective);

    _propiedadesDirective.$inject = ["$log", "ContextPath", "$http", "Mensajes"];
    function _propiedadesDirective($log, ContextPath, $http, Mensajes) {
        return {
            template: _template(),
            link: function (scope) {
                scope.mostrar = false;
                scope.beans = null;
                scope.beanSeleccionado = null;
                scope.propiedades = null;
                scope.mostrarPropiedades = _mostrarPropiedades;
                scope.cambiarPropiedad = _cambiarPropiedad;
                scope.restaurar = _restaurar;
                scope.volver = _volver;
                scope.salir = _salir;

                window.props = function () {

                    var url = ContextPath + URL_BASE + LISTA;

                    $http.get(url).then(function (res) {

                        scope.beans = res.data.objRespuesta;

                    }, Mensajes.error);

                    scope.$apply(function() {
                        scope.mostrar = true;
                    });
                }

                function _mostrarPropiedades(bean) {
                    var url = ContextPath + URL_BASE + PROPIEDADES + bean;
                    $http.get(url).then(function (propiedades) {
                        scope.beanSeleccionado = bean;
                        scope.propiedades = propiedades.data.objRespuesta;
                    }, Mensajes.error);
                }

                function _cambiarPropiedad(cve, prop, $event) {
                    if($event.which === 13) {
                        var url = ContextPath + URL_BASE;
                        $http.post(url, {
                            clave: cve, valor: prop, beanName: scope.beanSeleccionado
                        }).then(function (res) {
                            Mensajes.success({
                                idError: 1,
                                descError: res.data.objRespuesta
                            });
                        }, Mensajes.error);
                    }
                }

                function _salir() {
                    scope.beans = null;
                    scope.mostrar = false;
                }

                function _volver() {
                    scope.beanSeleccionado = null;
                    scope.propiedades = null;
                }

                function _restaurar() {
                    var url = ContextPath + URL_BASE + RESTAURAR;
                    $http.post(url, {}).then(function (res) {
                        Mensajes.success({
                            idError: 1,
                            descError: res.data.objRespuesta
                        });
                    }, Mensajes.error);
                }
            }
        }
    }

    function _template() {
        return "<div ng-if='mostrar' class='propiedad'>" + _estilos() +
                "<div ng-if='beanSeleccionado===null'>" +
                    "<a href='javascript:void(0)' ng-click='salir()'>Salir</a><br/>" +
                    "<a href='javascript:void(0)' ng-click='restaurar()'>Restaurar</a><hr/>" +
                    "<div ng-repeat='bean in beans'>" +
                        "<a href='javascript:void(0)' ng-bind='bean' ng-click='mostrarPropiedades(bean)'></a>" +
                    "</div>" +
                "</div>" +
                "<div ng-if='beanSeleccionado!==null'>" +
                    "<a href='javascript:void(0)' ng-click='volver()'>Volver</a><hr/>" +
                    "<div ng-repeat='(cve, prop) in propiedades'>" +
                        "<label>{{cve}}:</label>" +
                        "<input ng-model='prop' ng-keypress='cambiarPropiedad(cve, prop, $event)'/>" +
                    "</div>" +
                "</div>" +
            "</div>";
    }

    function _estilos() {
        return "<style type='text/css' rel='stylesheet'>" +
                    ".propiedad { min-height: 100vh; top: 0; left: 0; width: 100vw; margin: 0; padding: 15px; position: absolute; background-color: whitesmoke; }" +
                "</style>";
    }

})();