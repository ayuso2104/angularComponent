(function () {
    'use strict';
    angular.module("listaModule", [])
        .directive("lista", lista)
        .factory("ModeloLista", ModeloLista)
        .filter("sanitize", ['$sce', function ($sce) {
            return function (htmlCode) {
                return $sce.trustAsHtml(htmlCode);
            };
        }]);

    lista.$inject = ["$filter"];
    function lista($filter) {

        function link(scope, element, attrs) {

            scope.seleccionado = function (index) {
                return scope.modeloLista.seleccionado(index);
            };
            scope.seleccionado_mouse = function (index) {
                return scope.modeloLista.seleccionado_mouse(index);
            };
            scope.es_seleccionado_mouse = function (index) {
                return index === scope.seleccionado_mouse() && index !== scope.seleccionado();
            };

            scope.$watch(function () {
                return scope.modeloLista.datos();
            }, function (datos) {
                scope.datos = datos;
            });


        }

        return {
            transclude: true,
            template: '<ul class="lista-prime"><div ng-repeat = "elemento in datos track by $index"><li ng-class = "{\'lista-seleccionado\':($index ==seleccionado()),\'lista-mouse\':es_seleccionado_mouse($index)}" ng-click="seleccionado($index)" ng-mouseenter="seleccionado_mouse($index)"ng-mouseleave="seleccionado_mouse(-1)">{{elemento}}</li></div></ul>',
            scope: {
                modeloLista: '=modelo'
            },
            link: link
        };
    }

    ModeloLista.$inject = ['$filter'];
    function ModeloLista($filter) {
        var ModeloListaFactory = function () {
            var self = {};
            self._mensaje = $filter('translate')('infmerc-tab_sin-info');
            self._datos = [];
            self._nueva = true;
            self._datos.push(self._mensaje);
            self._seleccionado = -1;
            self._seleccionado_mouse = -1;
            self.limpia = function () {
                self._datos = [];
                self._datos.push(self._mensaje);
                self._nueva = true;
            };
            self.seleccionado_mouse = function (_seleccionado_mouse) {
                if ((_seleccionado_mouse === null || _seleccionado_mouse === undefined)) {
                    return self._seleccionado_mouse;
                }

                self._seleccionado_mouse = _seleccionado_mouse;
            };
            self.seleccionado = function (_seleccionado) {
                if (self._nueva) {
                    return -1;
                }
                if (_seleccionado === null || _seleccionado === undefined) {
                    return self._seleccionado;
                }
                self._nueva = false;
                self._seleccionado = _seleccionado;

            };
            self.datos = function (a_datos) {

                if (!a_datos) {

                    return self._datos;
                }

                self._datos = a_datos;

            };
            return self;
        };
        return ModeloListaFactory;
    }

    angular.module("listaModule")
        .run(["$templateCache", function ($templateCache) {
            $templateCache.remove("lista.directive.template.html");
        }]);

})();
