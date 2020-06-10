(function () {
    'use strict';
    angular.module('numeros', []).directive('flotante', function () {
        var regexp = /(^\d+(\.\d+)?$)/;
        return {
            require: 'ngModel',
            link: function (scope, element, attrs, modelCtrl) {

                element.bind('blur', function () {

                    if (attrs.min !== undefined || attrs.min !== null) {
                        if (parseInt(element[0].value) < parseInt(attrs.min)) {
                            modelCtrl.$setViewValue(attrs.min);
                            //element[0].value = parseInt(attrs.min);
                        }
                    }
                    if (attrs.max !== undefined || attrs.max !== null) {
                        if (parseInt(element[0].value) > parseInt(attrs.max)) {
                            modelCtrl.$setViewValue(attrs.max);
                        }
                    }

                    modelCtrl.$render();

                });

                modelCtrl.$parsers.push(function (inputValue) {
                    // this next if is necessary for when using ng-required on your input.
                    // In such cases, when a letter is typed first, this parser will be called
                    // again, and the 2nd time, the value will be undefined
                    if (inputValue === undefined || inputValue === null) {
                        return '';
                    }
                    var coincidencia = regexp.exec(inputValue);
                    var prueba = regexp.test(inputValue);
                    var transformedInput = coincidencia ? coincidencia[0] : '';
                    if (!prueba) {
                        if (inputValue.indexOf('.') === inputValue.length - 1) {
                            return inputValue;
                        }
                        modelCtrl.$setViewValue(transformedInput);
                        modelCtrl.$render();
                    }

                    return transformedInput;
                });
            }
        };
    });

    angular.module('numeros').directive('entero', function () {
        var regexp = /(^\d+(\.\d+)?$)/;
        return {
            require: 'ngModel',
            link: function (scope, element, attrs, modelCtrl) {
                console.warn('La directiva "entero" esta drepecada utilize ac-numerico');

                element.bind('blur', function () {

                    if (attrs.min !== undefined || attrs.min !== null) {
                        if (parseInt(element[0].value) < parseInt(attrs.min)) {
                            modelCtrl.$setViewValue(attrs.min);
                        }
                    }
                    if (attrs.max !== undefined || attrs.max !== null) {
                        if (parseInt(element[0].value) > parseInt(attrs.max)) {
                            modelCtrl.$setViewValue(attrs.max);
                        }
                    }

                    modelCtrl.$render();

                });

                modelCtrl.$parsers.push(function (inputValue) {
                    var transformedInput = inputValue ? inputValue.replace(/[^\d]/g, '') : null;

                    if (transformedInput !== inputValue) {
                        modelCtrl.$setViewValue(transformedInput);
                        modelCtrl.$render();
                    }

                    return transformedInput;
                });
            }
        };
    });

    angular.module('numeros').directive('acNumerico', _acNumerico);
    _acNumerico.$inject = [];
    function _acNumerico() {
        return {
            require: 'ngModel',
            restrict: 'A',
            link: _link
        };

        function _link($scope, $element, $attrs, $modelCtrl) {

            $modelCtrl.$formatters.push(function (modelValue) {
                var cadenaLimpia = modelValue ? (""+modelValue.replace(/[^0-9]/g, '')) : null;
                return cadenaLimpia;
            });

            $modelCtrl.$parsers.push(function (viewValue) {
                var cadenaLimpia = viewValue ? (""+viewValue.replace(/[^0-9]/g, '')) : null;
                if (cadenaLimpia !== viewValue) {
                    $modelCtrl.$setViewValue(cadenaLimpia);
                    $modelCtrl.$render();
                }
                return cadenaLimpia;
            });
        }
    }

    /**
     * Verifica si una entrada es un entero válido.
     * Tambien puede verificar si el numero se encuentra dentro de un rango con los atributos min y max
     * si la entrada es mayor o menor que los atributos especificados esta asignará el valor de los atributos min y max
     * sea el caso.
     *
     * Se puede usar con "limitTo" para que no se asigne el max como defeault.
     *
     */
    angular.module('numeros').directive('acEntero', _acEntero);
    _acEntero.$inject = [];
    function _acEntero() {
        return {
            require: 'ngModel',
            restrict: 'A',
            link: _link
        };

        function _link($scope, $element, $attrs, $modelCtrl) {

            $modelCtrl.$formatters.push(function (modelValue) {
                var entero = (modelValue && angular.isString(modelValue)) ? modelValue.replace(/[^0-9]/g, '') : modelValue;
                entero = parseInt(entero, 10);
                return !isNaN(entero) ? _verificaRango(entero) : null;
            });

            $modelCtrl.$parsers.push(function (viewValue) {

                var entero = (viewValue && angular.isString(viewValue)) ? viewValue.replace(/[^0-9]/g, '') : viewValue;
                entero = parseInt(entero, 10);
                entero = !isNaN(entero) ? _verificaRango(entero) : null;
                if (entero !== viewValue) {
                    $modelCtrl.$setViewValue(entero);
                    $modelCtrl.$render();
                }
                return entero;
            });

            function _verificaRango(entero) {
                var MIN = $attrs.min ? parseInt($attrs.min, 10) : null;
                var MAX = $attrs.max ? parseInt($attrs.max, 10) : null;

                if (entero === null || entero === undefined) {
                    return entero;
                }
                if (MAX !== null && entero > MAX) {
                    return MAX;
                }
                if (MIN !== null && entero < MIN) {
                    return MIN;
                }
                return entero;
            }
        }
    }




})();
