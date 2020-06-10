(function () {
    'use strict';
    var showErrorsModule;

    showErrorsModule = angular.module('ui.bootstrap.showErrors', []);

    showErrorsModule.directive('showErrors', [
        '$timeout', 'showErrorsConfig', '$interpolate',
        function ($timeout, showErrorsConfig, $interpolate) {
            var getShowSuccess, getTrigger, linkFn;
            var ERRORES = {
                required: 'El campo es requerido',
                minlength: 'El campo debe tener al menos {0} elemento(s)',
            };
            getTrigger = function (options) {
                var trigger;
                trigger = showErrorsConfig.trigger;
                if (options && options.trigger) {
                    trigger = options.trigger;
                }
                return trigger;
            };
            getShowSuccess = function (options) {
                var showSuccess;
                showSuccess = showErrorsConfig.showSuccess;
                if (options && options.showSuccess) {
                    showSuccess = options.showSuccess;
                }
                return showSuccess;
            };
            linkFn = function (scope, el, attrs, formCtrl) {
                var blurred, inputEl, inputName, inputNgEl, options, showSuccess, toggleClasses, trigger;
                blurred = false;
                options = scope.$eval(attrs.showErrors) || {};
                showSuccess = getShowSuccess(options);
                trigger = getTrigger(options);
                inputEl = el[0].querySelector('.form-control[name]');
                inputNgEl = angular.element(inputEl);
                inputName = $interpolate(inputNgEl.attr('name') || '')(scope);


                if (!inputName) {
                    throw "show-errors element has no child input elements with a 'name' attribute and a 'form-control' class";
                }

                _setTrigger(inputNgEl);


                scope.$watch(function () {
                    return formCtrl[inputName] && formCtrl[inputName].$invalid;
                }, function (invalid) {
                    if (!blurred) {
                        return;
                    }
                    return toggleClasses(invalid);
                });
                scope.$on('show-errors-check-validity', function () {
                    return toggleClasses(formCtrl[inputName].$invalid);
                });
                scope.$on('show-errors-reset', function () {
                    return $timeout(function () {
                        el.removeClass('has-error');
                        el.removeClass('has-success');
                        blurred = false;
                    }, 0, false);
                });

                function _setTrigger(elemento) {
                    elemento.bind(trigger, function () {
                        blurred = true;
                        return toggleClasses(formCtrl[inputName].$invalid);
                    });
                }

                toggleClasses = function (invalid) {

                    var mensaje = '';
                    var errores = formCtrl[inputName].$error;

                    var minVal = inputNgEl.attr('ng-minlength') || inputNgEl.attr('minlength') || 0;

                    ERRORES.minlength = ERRORES.minlength.format(minVal);
                    for (var error in errores) {
                        if (errores.hasOwnProperty(error)) {
                            mensaje = ERRORES[error];
                            break;
                        }
                    }
                    el.attr('title', invalid ? mensaje : '');


                    el.toggleClass('has-error', invalid);
                    if (showSuccess) {
                        return el.toggleClass('has-success', !invalid);
                    }
                };
            };
            return {
                restrict: 'A',
                require: '^form',
                compile: function (elem, attrs) {
                    if (attrs.showErrors.indexOf('skipFormGroupCheck') === -1) {
                        if (!(elem.hasClass('form-group') || elem.hasClass('input-group'))) {
                            throw "show-errors element does not have the 'form-group' or 'input-group' class";
                        }
                    }
                    return linkFn;
                }
            };
        }
    ]);

    showErrorsModule.provider('showErrorsConfig', function () {
        var _showSuccess, _trigger;
        _showSuccess = false;
        _trigger = 'blur';
        this.showSuccess = function (showSuccess) {
            _showSuccess = showSuccess;
        };
        this.trigger = function (trigger) {
            _trigger = trigger;
        };
        this.$get = function () {
            return {
                showSuccess: _showSuccess,
                trigger: _trigger
            };
        };
    });

}).call(this);
