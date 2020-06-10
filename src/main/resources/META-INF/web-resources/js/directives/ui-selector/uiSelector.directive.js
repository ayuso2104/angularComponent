(function () {
    'use strict';
    angular.module("uiSelectorModule", ["primeModule", "ngDrag"]);

    angular.module("uiSelectorModule").filter("not_in", function () {
        return function (input, no_en, personalFilter) {
            return input.filter(function (item) {
                return (!no_en.contains(item));
            }).filter(personalFilter);
        };
    });

    angular.module("uiSelectorModule").filter(
        'unique',
        function () {

            return function (items, filterOn) {

                if (filterOn === false) {
                    return items;
                }

                if ((filterOn || angular.isUndefined(filterOn)) &&
                    angular.isArray(items)) {
                    var hashCheck = {}, newItems = [];

                    var extractValueToCompare = function (item) {
                        if (angular.isObject(item) && angular.isString(filterOn)) {
                            return item[filterOn];
                        } else {
                            return item;
                        }
                    };

                    angular.forEach(items, function (item) {
                        var valueToCheck, isDuplicate = false;

                        for (var i = 0; i < newItems.length; i++) {
                            if (angular.equals(
                                    extractValueToCompare(newItems[i]),
                                    extractValueToCompare(item))) {
                                isDuplicate = true;
                                break;
                            }
                        }
                        if (!isDuplicate) {
                            newItems.push(item);
                        }

                    });
                    items = newItems;
                }
                return items;
            };
        });

    angular.module("uiSelectorModule").directive("uiSelector", uiSelector);

    uiSelector.$inject = [];

    function uiSelector() {
        return {
            scope: {
                model: '=uiSelector',
                titulo_a: '@tituloA',
                titulo_de: '@tituloDe',
                filtro: '@filtro',
                checkbox: '@checkbox'

            },
            link: function (scope, element, attrs) {
                var es_ie = navigator.userAgent.indexOf("MSIE") > -1;
                var seleccionadoArrastrar = "";
                scope.tieneFiltro = scope.filtro !== false;
                scope.sinCheck = scope.checkbox === "false";
                scope.seleccionarCheck = function (lista, item, evt,
                                                   click_en_check) {
                    if (evt) {
                        evt.stopPropagation();
                    }
                    if (!click_en_check) {
                        var seleccionados = 0;
                        if (evt) {
                            if (!evt.ctrlKey) {
                                for (var i = 0; i < lista.length; i++) {
                                    if (lista[i] !== item && lista[i].seleccionado) {
                                        seleccionados++;
                                        lista[i].seleccionado = false;
                                    }
                                }
                            }
                        }
                        if (seleccionados > 0) {
                            item.seleccionado = true;
                        } else {
                            item.seleccionado = !item.seleccionado;
                        }
                    }
                };

                scope.seleccionarCheckDrag = function (lista, item, evt,
                                                       click_en_check) {
                    evt.stopPropagation();
                    if (es_ie) {
                        if (evt.dataTransfer.hasOwnProperty("setData")) {
                            evt.dataTransfer.setData("text/plain", "");
                        }
                    } else {
                        evt.dataTransfer.setData("text/plain", "");
                    }


                    /* Manejando los eventos para que responda el drop */
                    var divA = document.getElementById('divA' + scope.$id);
                    var divDe = document.getElementById('divDe' + scope.$id);
                    // debugger;
                    if (divA !== null || divA !== undefined) {
                        divA.addEventListener('dragover', function (event) {
                            event.preventDefault();
                        }, false);
                    }
                    if (divDe !== null || divDe !== undefined) {
                        divDe.addEventListener('dragover', function (event) {
                            event.preventDefault();
                        }, false);
                    }

                    seleccionadoArrastrar = "de";
                    if (lista !== "lista-de-") {
                        seleccionadoArrastrar = "a";
                    }

                    desSeleccionarTodos(scope.model.listas.a);
                    desSeleccionarTodos(scope.model.listas.de);
                    item.seleccionado = true;

                };
                scope.manejadorDrop = function (accionador) {
                    if (seleccionadoArrastrar === 'a' && accionador === 'a') {
                        return scope.enviarSeleccionados();
                    }
                    if (seleccionadoArrastrar === 'de' && accionador === 'de') {
                        scope.devolverSeleccionados();
                    }
                };
                function cancelarEvento(evt) {
                    evt.preventDefault();
                }

                function seleccionarTodos(lista) {
                    for (var i = 0; i < lista.length; i++) {
                        lista[i].seleccionado = true;
                    }
                }

                function desSeleccionarTodos(lista) {
                    for (var i = 0; i < lista.length; i++) {
                        lista[i].seleccionado = false;
                    }

                }

                scope.enviarSeleccionados = function () {
                    var quieroMover = scope.model.listas.de.filter(function (item) {
                        return item.seleccionado;
                    });
                    if (scope.model.acciones.actualizar(quieroMover)) {
                        for (var i = 0; i < scope.model.listas.de.length; i++) {
                            if (scope.model.listas.de[i].seleccionado) {
                                scope.model.listas.a
                                    .push(scope.model.listas.de[i]);
                                scope.model.listas.de.splice(i, 1);
                                i--;
                            }
                        }
                    }

                };

                scope.enviarTodos = function () {
                    seleccionarTodos(scope.model.listas.de);
                    scope.enviarSeleccionados();
                };

                scope.devolverSeleccionados = function () {
                    var quieroMover = scope.model.listas.a
                        .filter(function (item) {
                            return item.seleccionado;
                        });
                    if (scope.model.acciones.devolver(quieroMover)) {
                        for (var i = 0; i < scope.model.listas.a.length; i++) {
                            if (scope.model.listas.a[i].seleccionado) {
                                scope.model.listas.a[i].seleccionado = false;
                                var vuelta = scope.model.listas.a.splice(i, 1)[0];
                                if (!scope.model.listas.de.contains(vuelta)) {
                                    scope.model.listas.de.push(vuelta);
                                }
                                i--;
                            }
                        }
                    }

                };

                scope.devolverTodos = function () {
                    seleccionarTodos(scope.model.listas.a);
                    scope.devolverSeleccionados();
                };

            },// fin del link
            template: '<div class="ui-selector" ng-init="busqueda_de={};busqueda_a={}"> <div class="ui-selector-area ui-selector-from"> <div class="search" ng-if="tieneFiltro"> <input type="text" class="form-control" ng-model="busqueda_de[model.atributo]"> <span class="ui-icon ui-icon-search"></span> </div> <div class="area"> <div class="header" ng-if="titulo_de"> {{ titulo_de }} </div> <div ng-drop="manejadorDrop(\'de\')" id="divDe{{ $id }}" > <ul id="lista-de-{{ $id }}" > <li ng-repeat="item in model.listas.de | orderBy: model.atributo | unique: model.atributo | filter:busqueda_de | not_in:model.listas.a:model.filtros.de track by $index " ng-class="{\'it_selected\': item.seleccionado}"> <div class="row contenedor-selector" > <div class="col-xs-1 col-sm-1 col-md-1" ng-class="{\'invisible\':sinCheck}"> <input type="checkbox" ng-model="item.seleccionado" id="check-lista-de-{{$id}}-{{ item[model.atributo] }}" > <label for="check-lista-de-{{$id}}-{{ item[model.atributo] }}" class="imitation-check ui-state-hover" ng-init="item.seleccionado=false" > <span class="ui-icon ui-chkbox-icon ui-icon-check" ng-if="item.seleccionado"></span> </label> </div> <div class="col-xs-11 col-sm-11 col-md-11" ng-class="{\'ancho-maximo\':sinCheck}" ng-click="seleccionarCheck(model.listas.de, item, $event, false)" draggable="true" ng-dragstart="seleccionarCheckDrag(\'lista-a-\', item, $event, false)" > <div class="nombre_lista">{{ model.atributo ? item[model.atributo]: item }}</div> </div> </li> </ul> </div> </div> </div> <div class="botonera"> <button ui-button type="button" icono="ui-icon-arrow-1-e" ng-click="enviarSeleccionados()"></button> <button ui-button type="button" icono="ui-icon-arrowstop-1-e" ng-click="enviarTodos()"></button> <button ui-button type="button" icono="ui-icon-arrow-1-w" ng-click="devolverSeleccionados()"></button> <button ui-button type="button" icono="ui-icon-arrowstop-1-w" ng-click="devolverTodos()"></button> </div> <div class="ui-selector-area ui-selector-to" ng-init="checks_lista_a=[]"> <div class="search" ng-if="tieneFiltro"> <input type="text" class="form-control" ng-model="busqueda_a[model.atributo]"> <span class="ui-icon ui-icon-search"></span> </div> <div class="area"> <div class="header" ng-if="titulo_a"> {{ titulo_a }} </div> <div ng-drop="manejadorDrop(\'a\')" id="divA{{ $id }}" > <ul id="lista-a-{{ $id }}" > <li ng-repeat="item in model.listas.a | orderBy: model.atributo | unique:model.atributo | filter:busqueda_a track by $index" ng-class="{\'it_selected\': item.seleccionado}"> <div class="row contenedor-selector" > <div class="col-xs-1 col-sm-1 col-md-1" ng-class="{\'invisible\':sinCheck}"> <input type="checkbox" ng-model="item.seleccionado" id="check-lista-a-{{$id}}-{{ item[item.atributo] }}" ng-model="busqueda[atributo]" > <label for="check-lista-a-{{$id}}-{{ item[item.atributo] }}" class="imitation-check ui-state-hover" ng-init="item.seleccionado=false" > <span class="ui-icon ui-chkbox-icon ui-icon-check" ng-if="item.seleccionado"></span> </label> </div> <div class="col-xs-11 col-sm-11 col-md-11" ng-class="{\'ancho-maximo\':sinCheck}" ng-click="seleccionarCheck(model.listas.a, item, $event, false)" draggable="true" ng-dragstart="seleccionarCheckDrag(\'lista-de-\', item, $event, false)" > <div class="nombre_lista" >{{ model.atributo ? item[model.atributo]: item }}</div> </div> </div> </li> </ul> </div> </div> </div> </div> '
            //templateUrl : 'recurso/js/directives/ui-selector/uiSelector.directive.template.html'
        };
    }

    angular.module("uiSelectorModule").factory("ModeloSelector",
        uiSelectorModel);

    uiSelectorModel.$inject = [];

    function uiSelectorModel() {
        return function () {
            return {
                listas: {
                    de: [],
                    a: []
                },
                acciones: {
                    actualizar: function () {
                        return true;
                    },
                    devolver: function () {
                        return true;
                    }
                },
                filtros: {
                    de: function (item) {
                        return true;
                    }
                }
            };
        };
    }

})();
