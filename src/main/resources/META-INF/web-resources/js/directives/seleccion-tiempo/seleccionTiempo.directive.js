(function () {
    'use strict';
    angular.module('seleccion-tiempo', []).directive('seleccionTiempo', _reloj);

    _reloj.$inject = [];

    function _reloj() {
        return {
            template: '<div class="form-group seleccion-tiempo-container" style="margin-bottom: 0px !important" > <select class="form-control selector" name="selecion-tiempo-select-hora-{{$id}}" ng-required="ngRequired" ng-disabled="ngDisabled" placeholder="00" ng-options="option.horas for option in horas track by option.valor" ng-model="reloj.hora" ng-change="cambio(reloj.hora,reloj.minuto,reloj.meridiano) && ngChange({\'hora\':reloj.hora,\'minuto\':reloj.minuto})" > <option value="" disabled style="color:gray">--</option> </select> <select class="form-control selector" name="selecion-tiempo-select-minuto-{{$id}}" ng-options="option.minutos for option in minutos track by option.valor" ng-model="reloj.minuto" name="minutos" ng-required="ngRequired" ng-disabled="ngDisabled" ng-change="cambio(reloj.hora,reloj.minuto,reloj.meridiano) && ngChange({\'hora\':reloj.hora,\'minuto\':reloj.minuto})" > <option value="" disabled style="color:gray">--</option> </select> <select ng-required="false" class="form-control selector" name="selecion-tiempo-select-meridiano-{{$id}}" ng-disabled="ngDisabled" ng-if="horas.length <=12" ng-options="option for option in meridianos" ng-model="reloj.meridiano" name="horas" ng-disabled="ngDisabled" ng-change="cambio(reloj.hora,reloj.minuto,reloj.meridiano)" > </select></div>',
            //templateUrl: 'recurso/js/directives/seleccion-tiempo/seleccionTiempo.template.html',
            require: 'ngModel',
            scope: {
                ngModel: '=',
                ngChange: '&',
                ngDisabled: '=',
                minHora: '=',
                maxHora: '=',
                ngRequired: '='
            },
            link: function ($scope, $element, $attrs, $ctrl) {
                var _24HRS = [{"valor": 0, "horas": "00"}, {"valor": 1, "horas": "01"}, {
                    "valor": 2,
                    "horas": "02"
                }, {"valor": 3, "horas": "03"}, {"valor": 4, "horas": "04"}, {"valor": 5, "horas": "05"}, {
                    "valor": 6,
                    "horas": "06"
                }, {"valor": 7, "horas": "07"}, {"valor": 8, "horas": "08"}, {"valor": 9, "horas": "09"}, {
                    "valor": 10,
                    "horas": "10"
                }, {"valor": 11, "horas": "11"}, {"valor": 12, "horas": "12"}, {
                    "valor": 13,
                    "horas": "13"
                }, {"valor": 14, "horas": "14"}, {"valor": 15, "horas": "15"}, {
                    "valor": 16,
                    "horas": "16"
                }, {"valor": 17, "horas": "17"}, {"valor": 18, "horas": "18"}, {
                    "valor": 19,
                    "horas": "19"
                }, {"valor": 20, "horas": "20"}, {"valor": 21, "horas": "21"}, {
                    "valor": 22,
                    "horas": "22"
                }, {"valor": 23, "horas": "23"}];
                var _12HRS = [{"valor": 1, "horas": "01"}, {"valor": 2, "horas": "02"}, {
                    "valor": 3,
                    "horas": "03"
                }, {"valor": 4, "horas": "04"}, {"valor": 5, "horas": "05"}, {"valor": 6, "horas": "06"}, {
                    "valor": 7,
                    "horas": "07"
                }, {"valor": 8, "horas": "08"}, {"valor": 9, "horas": "09"}, {"valor": 10, "horas": "10"}, {
                    "valor": 11,
                    "horas": "11"
                }, {"valor": 12, "horas": "12"}];
                var _MINUTOS = [{"valor": 0, "minutos": "00"}, {"valor": 1, "minutos": "01"}, {
                    "valor": 2,
                    "minutos": "02"
                }, {"valor": 3, "minutos": "03"}, {"valor": 4, "minutos": "04"}, {
                    "valor": 5,
                    "minutos": "05"
                }, {"valor": 6, "minutos": "06"}, {"valor": 7, "minutos": "07"}, {
                    "valor": 8,
                    "minutos": "08"
                }, {"valor": 9, "minutos": "09"}, {"valor": 10, "minutos": "10"}, {
                    "valor": 11,
                    "minutos": "11"
                }, {"valor": 12, "minutos": "12"}, {"valor": 13, "minutos": "13"}, {
                    "valor": 14,
                    "minutos": "14"
                }, {"valor": 15, "minutos": "15"}, {"valor": 16, "minutos": "16"}, {
                    "valor": 17,
                    "minutos": "17"
                }, {"valor": 18, "minutos": "18"}, {"valor": 19, "minutos": "19"}, {
                    "valor": 20,
                    "minutos": "20"
                }, {"valor": 21, "minutos": "21"}, {"valor": 22, "minutos": "22"}, {
                    "valor": 23,
                    "minutos": "23"
                }, {"valor": 24, "minutos": "24"}, {"valor": 25, "minutos": "25"}, {
                    "valor": 26,
                    "minutos": "26"
                }, {"valor": 27, "minutos": "27"}, {"valor": 28, "minutos": "28"}, {
                    "valor": 29,
                    "minutos": "29"
                }, {"valor": 30, "minutos": "30"}, {"valor": 31, "minutos": "31"}, {
                    "valor": 32,
                    "minutos": "32"
                }, {"valor": 33, "minutos": "33"}, {"valor": 34, "minutos": "34"}, {
                    "valor": 35,
                    "minutos": "35"
                }, {"valor": 36, "minutos": "36"}, {"valor": 37, "minutos": "37"}, {
                    "valor": 38,
                    "minutos": "38"
                }, {"valor": 39, "minutos": "39"}, {"valor": 40, "minutos": "40"}, {
                    "valor": 41,
                    "minutos": "41"
                }, {"valor": 42, "minutos": "42"}, {"valor": 43, "minutos": "43"}, {
                    "valor": 44,
                    "minutos": "44"
                }, {"valor": 45, "minutos": "45"}, {"valor": 46, "minutos": "46"}, {
                    "valor": 47,
                    "minutos": "47"
                }, {"valor": 48, "minutos": "48"}, {"valor": 49, "minutos": "49"}, {
                    "valor": 50,
                    "minutos": "50"
                }, {"valor": 51, "minutos": "51"}, {"valor": 52, "minutos": "52"}, {
                    "valor": 53,
                    "minutos": "53"
                }, {"valor": 54, "minutos": "54"}, {"valor": 55, "minutos": "55"}, {
                    "valor": 56,
                    "minutos": "56"
                }, {"valor": 57, "minutos": "57"}, {"valor": 58, "minutos": "58"}, {"valor": 59, "minutos": "59"}];
                var _MERIDIANOS = ['AM', 'PM'];
                var DEFAULT_MILISEGUNDOS = 0;
                var DEFAULT_SEGUNDOS = 0;

                $ctrl.$options = $ctrl.$options || {};
                $ctrl.$options.updateOn = 'blur';

                var inputs = [].slice.call($element[0].querySelectorAll('[ng-model]'), 0);
                var childControllers = inputs.map(function (e) {
                    return angular.element(e).controller('ngModel');
                });

                $scope.cambio = _cambio;
                _inicio();


                function _inicio() {
                    $scope.horas = _24HRS;
                    $scope.minutos = _MINUTOS;
                    $scope.meridianos = _MERIDIANOS;
                }

                $ctrl.$validators.maxHour = function (valor) {
                    return (!$scope.maxHora || $scope.maxHora > valor);
                };

                $ctrl.$validators.minHour = function (valor) {
                    return (!$scope.minHora || $scope.minHora < valor);

                };

                $scope.$watch('minHora', function (newValue, oldValue) {
                    if (newValue !== oldValue) {
                        $ctrl.$validate();
                    }
                });

                $scope.$watch('maxHora', function (newValue, oldValue) {
                    if (newValue !== oldValue) {
                        $ctrl.$validate();
                    }
                });

                $ctrl.$formatters.push(function (newValue) {
                    var _formato = $attrs.formato;
                    if (!newValue) {
                        return newValue;
                    }
                    if (!(newValue instanceof Date)) {
                        throw Error(newValue + ': No es un objeto Fecha');
                    }
                    var _hora = newValue.getHours();
                    if ([undefined, null, ''].indexOf(_formato) > -1 || _formato === '24') {
                        $scope.reloj.hora = _24HRS.find(function (item) {
                            return item.valor === parseInt(_hora, 10);
                        });
                    } else {
                        _hora = (_hora > 12) ? (_hora - 12) : _hora;
                        $scope.reloj.hora = _12HRS.find(function (item) {
                            return item.valor === parseInt(_hora, 10);
                        });
                    }
                    var _minuto = newValue.getMinutes();
                    $scope.reloj.minuto = _MINUTOS.find(function (item) {
                        return item.valor === parseInt(_minuto, 10);
                    });
                    newValue.setMilliseconds(DEFAULT_MILISEGUNDOS);
                    newValue.setSeconds(DEFAULT_SEGUNDOS);
                    return newValue;

                });

                $scope.reloj = {meridiano: _MERIDIANOS[0]};


                $attrs.$observe('formato', function (value) {
                    var formato = value;
                    if ([undefined, null, ''].indexOf(formato) > -1 || formato === '24') {
                        $scope.horas = _24HRS;
                    } else if (formato === '12') {
                        $scope.horas = _12HRS;
                    }
                    $scope.reloj.minuto = $scope.reloj.hora = null;
                });


                function _cambio(hora, minuto, meridiano) {

                    var _formato = $attrs.formato;
                    var _minuto = null;
                    var _hora = null;

                    if (null === hora || hora === undefined) {
                        hora = (_formato === '12') ? _12HRS[0] : _24HRS[0];
                        $scope.reloj.hora = hora;
                    }

                    if (null === minuto || minuto === undefined) {
                        minuto = _MINUTOS[0];
                        $scope.reloj.minuto = minuto;
                    }

                    if (_formato === '12') {
                        if (meridiano === _MERIDIANOS[0]) {
                            _hora = (hora.valor === 12) ? 0 : hora.valor; // AM
                        } else {
                            _hora = (hora.valor === 12) ? 12 : (hora.valor + 12); // PM
                        }
                    } else {
                        _hora = hora.valor;
                    }


                    _minuto = minuto.valor;


                    var nuevaFecha = $scope.ngModel ? new Date($scope.ngModel.getTime()) : new Date();

                    nuevaFecha.setHours(_hora, _minuto, DEFAULT_SEGUNDOS, DEFAULT_MILISEGUNDOS);
                    $ctrl.$setViewValue(nuevaFecha, 'blur');
                    $element.triggerHandler('blur');

                    childControllers.forEach(function (controllers) {
                        controllers.$setDirty();
                    });

                }


            }
        };
    }

})();
