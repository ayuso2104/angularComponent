(function () {
    'use strict';
    angular.module("uiListModule", []);

    angular.module("uiListModule").directive("uiList", uiList);

    uiList.$inject = [];

    function uiList() {

        return {
            scope: {
                ngModel: '=',
                atributo: '@atributo',
                nombre: '@nombre',
                titulo: '@',
                llaveActivacion: '=',
                habilitado: '=ngDisabled'
            },
            require: 'ngModel',
            restrict: "E",
            link: _link,
            /**
             * Se ha movido a template, ya que se utiliza junto con show-errors, pero al tener un templateUrl la compilacion
             * y el link se ejecutan en orden diferente segun https://github.com/angular/angular.js/issues/8877, entonces
             * showErrors no agregar el evento al elemento compilado, si no solo a la directiva, por tal motivo cuando el
             * elemento lanza el blur, no es el registrado por en showErrors y no se mostrará el error la primera vez, esto ocurre
             * solo en la primera vez, pero no es el comportamiento correcto
             */
            template: '<div class="ui-list"> <div ng-click="invert($event)" id="{{$id}}" class="search" title="{{vm.titulo}}"> <div class="titulo"> <span class="contenido">{{vm.titulo}}</span> <span class="tri-icon ui-icon ui-icon-triangle-1-s pull-right"></span> </div></div><div ng-click="$event.stopPropagation()" class="ui-list-list" ng-class="{\'activo\': activo, \'inactivo\': !activo}"> <div class="ui-list-header"> <input type="checkbox" ng-model="todas" ng-change="setTodasA(todas)" title="Seleccionar/Deseleccionar todos"/> <input type="text" ng-model="busqueda[atributo]" class="busqueda"/> <div class="cancel-button"> <div class="ui-selectcheckboxmenu-close ui-corner-all"> <span class="ui-icon close-button ui-icon-circle-close" ng-click="cerrar()"></span> </div></div></div><div class="repeat-wrapper form-horizontal" style="margin-left: 15px"> <div class="form-group" ng-repeat="item in ngModel | filter:busqueda"> <div class="checkbox"> <label for="ui-list-id-{{$index}}-{{$id}}" class="black" style="width:auto"> <input id="ui-list-id-{{$index}}-{{$id}}" ng-model="item[LLAVE_ACTIVACION]" ng-disabled="item.$$disabled" ng-readonly="item.$$disabled" ng-change="onCambioOpcion(item)" type="checkbox">{{item[atributo]}}</label> </div></div></div></div></div>'
            //templateUrl: 'recurso/js/directives/ui-list/ui-list.template.html',

        };
        //var _template = '<div class="ui-list form-control"> <div data-ng-click="activo=!activo" class=" text-center"> <div class="titulo">{{(seleccionados.length > 0) ? (seleccionados | mostrarContenido : \'-\': \'nombre\'):( nombre ? nombre : \'-Seleccione-\')}}</div><span class="tri-icon ui-icon ui-icon-triangle-1-s pull-right"></span> </div><div class="ui-list-list" ng-class="{activo: activo, inactivo: !activo}"> <div class="ui-list-header"> <input type="checkbox" ng-model="todas" ng-change="setTodasA(todas)"/> <input type="text" ng-model="busqueda[atributo]"/> <div class="cancel-button"> <div class="ui-selectcheckboxmenu-close ui-corner-all"> <span class="ui-icon ui-icon-circle-close" ng-click="activo=false"></span> </div></div></div><div class="repeat-wrapper form-horizontal" style="margin-left: 15px"> <div class="form-group" ng-repeat="item in lista | filter:busqueda"> <div class="checkbox"> <label for="ui-list-id-{{$index}}" style="width:auto"><input id="ui-list-id-{{$index}}" ng-model="item.activo" ng-change="onCambioOpcion(item)" type="checkbox">{{ item.activo ? "si":"no"}}{{item[atributo]}}</label> </div></div></div></div></div>';


        function _link(scope, element, attrs, ngModelCtrl) {
            element.addClass("ui-list-wrapper");
            var DEFAULT_LLAVE_ACTIVACION = 'activo';
            scope.LLAVE_ACTIVACION = scope.llaveActivacion || DEFAULT_LLAVE_ACTIVACION;
            scope.activo = false;
            scope.todas = false;
            scope.vm = {};
            scope.titulo = scope.titulo || '-Seleccione-';
            var totalSeleccionadas = 0;

            if (attrs.elementos) {
                throw new Error('elementos no esta disponible utilize ngModel');
            }

            ngModelCtrl.$options = {allowInvalid: true, updateOn: 'blur'};

            ngModelCtrl.$isEmpty = function () {
                return totalSeleccionadas === 0;
            };

            ngModelCtrl.$parsers.push(function (valor) {
                _cargarFuncion(valor);
                _formatoTitulo(valor);
                return valor;
            });

            ngModelCtrl.$formatters.push(function (valor) {
                _cargarFuncion(valor);
                _formatoTitulo(valor);
                return valor;
            });


            function _cargarFuncion(el) {
                if (!el || angular.isFunction(el.getSeleccionados)) {
                    return;
                }

                el.getSeleccionados = function (filtro) {
                    var sel = angular.copy(this.filter(function (it) {
                        return it[filtro || DEFAULT_LLAVE_ACTIVACION];
                    }));
                    if (scope.LLAVE_ACTIVACION === DEFAULT_LLAVE_ACTIVACION) {
                        for (var i = 0; i < sel.length; i++) {
                            delete sel[i].activo;
                        }
                    }
                    return sel;
                };
            }

            function _formatoTitulo(elementos) {
                var seleccionados = elementos && elementos.getSeleccionados(scope.LLAVE_ACTIVACION);
                totalSeleccionadas = (seleccionados && seleccionados.length) || 0;
                scope.todas = elementos ? elementos.length === totalSeleccionadas : false;
                scope.vm.titulo = totalSeleccionadas ? _mostrarContenido(seleccionados, ',', scope.atributo) : scope.titulo;
            }

            scope.invert = function (event) {
                event.idUiList = scope.$id;
                if (scope.habilitado) {
                    return;
                }
                scope.activo = !scope.activo;
            };

            scope.cerrar = function () {
                ngModelCtrl.$setTouched();
                var elementos = scope.ngModel;
                /**
                 * Dispara ng-change y el $parser para formatear el titulo, necesario cambiar la referencia del obj
                 */
                if(elementos){
                    ngModelCtrl.$setViewValue(elementos.concat([]));
                }
                element.triggerHandler('blur');
                scope.activo = false;
            };

            angular.element(document).on("click", function (event) {
                if (event.idUiList === scope.$id && scope.activo) {
                    return;
                }
                if (scope.activo) {
                    setTimeout(function () {
                        scope.$apply(scope.cerrar);
                    }, 0);
                }
            });

            scope.setTodasA = function (b_check) {
                var elementos = scope.ngModel;
                angular.forEach(elementos, function (item) {
                    if (!item.$$disabled) {
                        item[scope.LLAVE_ACTIVACION] = b_check;
                    }
                });
            };


            scope.onCambioOpcion = function (item) {
                scope.todas = true;
                var elementos = scope.ngModel;
                _formatoTitulo(elementos);
            };


            scope.seleccionados = function () {
                if (!scope.ngModel) {
                    return [];
                }
                return scope.ngModel.filter(function (it) {
                    return it[scope.LLAVE_ACTIVACION];
                });
            };

            function _mostrarContenido(input, separador, atributo, limite) {
                input = input || [];

                limite = (limite !== null || limite !== undefined) ? limite : 30;
                separador = separador || ',';
                var out = '';
                if (atributo) {
                    out = input.map(function (elemento) {
                        return elemento[atributo];
                    }).join(separador);
                } else {
                    out = input.join(separador);
                }
                if (limite === 0) {
                    return out;
                }
                return (out.length > limite ? out.substring(0, limite) + "..." : out);
            }

        }


    }

})();
