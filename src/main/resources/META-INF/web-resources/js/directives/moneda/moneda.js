(function () {
    'use strict';
    angular.module('moneda', []).directive('moneda', _moneda);
    _moneda.$inject = ['$filter', '$locale'];

    function _moneda($filter, $locale) {
        return {
            require: 'ngModel',
            link: function (scope, element, attrs, controller) {
                var min, max, currencySymbol, ngRequired;
                var hardCap = true;
                var active = true;
                var fraction = 2;

                attrs.$observe('moneda', function (value) {
                    active = (value !== 'false');
                    if (active) {
                        reformat();
                    } else {
                        controller.$viewValue = controller.$$rawModelValue;
                        controller.$render();
                    }
                });
                attrs.$observe('hardCap', function (value) {
                    hardCap = (value === 'true');
                    revalidate();
                });
                attrs.$observe('min', function (value) {
                    min = value ? Number(value) : undefined;
                    revalidate();
                });
                attrs.$observe('max', function (value) {
                    max = value ? Number(value) : undefined;
                    revalidate();
                });
                attrs.$observe('simbolo', function (value) {
                    currencySymbol = value;
                    reformat();
                });
                attrs.$observe('ngRequired', function (value) {
                    ngRequired = value;
                    revalidate();
                });
                attrs.$observe('fraction', function (value) {
                    fraction = value !== null ? value : 2;
                    reformat();
                    revalidate();
                });


                controller.$parsers.push(function (value) {
                    if (active && [undefined, null, ''].indexOf(value) === -1) {
                        var tempString = keepZeros(String(value));
                        if (tempString) {
                            value = tempString;
                        } else {
                            value = Number(clearValue(value));
                            if (!isValid(value)) {
                                value = controller.$$rawModelValue;
                            }
                        }

                    }
                    controller.$setViewValue(value);
                    controller.$render();
                    return value;
                });

                controller.$formatters.push(function (value) {
                    if (active && [undefined, null, ''].indexOf(value) === -1) {
                        return $filter('currency')(value, getCurrencySymbol(), getCurrentFraction(value));
                    }
                    return value;
                });

                controller.$validators.min = function (value) {
                    if (!ngRequired && ([undefined, null, ''].indexOf(value) !== -1 || isNaN(value))) {
                        return true;
                    }
                    return !active || [undefined, null].indexOf(min) !== -1 || isNaN(min) ||
                        value >= min;
                };

                controller.$validators.max = function (value) {
                    if (!ngRequired && ([undefined, null, ''].indexOf(value) !== -1 || isNaN(value))) {
                        return true;
                    }
                    return !active || [undefined, null].indexOf(max) !== -1 || isNaN(max) ||
                        value <= max;
                };

                controller.$validators.fraction = function (value) {
                    return !active || !value || !isNaN(value);
                };

                function reformat() {
                    if (active) {
                        var value;
                        if (controller.$options && controller.$options.updateOn === 'blur') {
                            value = controller.$viewValue;
                            for (i = controller.$parsers.length - 1; i >= 0; i--) {
                                value = controller.$parsers[i](value);
                            }
                        } else {
                            value = controller.$$rawModelValue;
                        }
                        for (var i = controller.$formatters.length - 1; i >= 0; i--) {
                            value = controller.$formatters[i](value);
                        }
                        controller.$viewValue = value;
                        controller.$render();
                    }
                }

                function revalidate() {
                    controller.$validate();
                    if (active) {
                        var value = keepInRange(controller.$$rawModelValue);
                        if (value !== controller.$$rawModelValue) {
                            controller.$setViewValue(value.toFixed(fraction));
                            controller.$commitViewValue();
                            reformat();
                        }
                    }
                }

                function keepInRange(value) {
                    if (hardCap) {
                        if (max !== undefined && value > max) {
                            value = max;
                        } else if (min !== undefined && value < min) {
                            value = min;
                        }
                    }
                    return value;
                }

                function isValid(value) {
                    if (max !== undefined && value > max) {
                        return false;
                    } else if (min !== undefined && value < min) {
                        return false;
                    }
                    return true;
                }

                scope.$on('currencyRedraw', function () {
                    revalidate();
                    reformat();
                });

                element.bind('focus', function () {
                    if (active) {
                        var groupRegex = new RegExp($locale.NUMBER_FORMATS.GROUP_SEP, 'g');
                        var value = [undefined, null, ''].indexOf(controller.$$rawModelValue) === -1 ? $filter('number')(controller.$$rawModelValue, getCurrentFraction(controller.$$rawModelValue)).replace(groupRegex, '') : controller.$$rawModelValue;
                        if (controller.$viewValue !== value) {
                            controller.$viewValue = value;
                            controller.$render();
                            element.triggerHandler('focus');
                        }
                    }
                });

                element.bind('blur', reformat);

                // TODO: Rewrite this parsing logic to more readable.

                function decimalRex(dChar) {
                    return RegExp('\\d|\\-|\\' + dChar, 'g');
                }

                function clearRex(dChar) {
                    return RegExp('\\-{0,1}((\\' + dChar + ')|([0-9]{1,}\\' + dChar + '?))&?[0-9]{0,' + fraction + '}', 'g');
                }

                function clearValue(value) {
                    value = String(value);
                    var dSeparator = $locale.NUMBER_FORMATS.DECIMAL_SEP;
                    var cleared = null;

                    // Replace negative pattern to minus sign (-)
                    var neg_dummy = $filter('currency')('-1', getCurrencySymbol(), fraction);
                    var neg_regexp = RegExp('[0-9.' + $locale.NUMBER_FORMATS.DECIMAL_SEP + $locale.NUMBER_FORMATS.GROUP_SEP + ']+');
                    var neg_dummy_txt = neg_dummy.replace(neg_regexp.exec(neg_dummy), '');
                    var value_dummy_txt = value.replace(neg_regexp.exec(value), '');

                    // If is negative
                    if (neg_dummy_txt === value_dummy_txt) {
                        value = '-' + neg_regexp.exec(value);
                    }

                    if (RegExp('^-[\\s]*$', 'g').test(value)) {
                        value = '-0';
                    }

                    if (decimalRex(dSeparator).test(value)) {
                        cleared = value.match(decimalRex(dSeparator))
                            .join('').match(clearRex(dSeparator));
                        cleared = cleared ? cleared[0].replace(dSeparator, '.') : null;
                    }

                    return cleared;
                }

                function getCurrencySymbol() {
                    return currencySymbol === undefined ? $locale.NUMBER_FORMATS.CURRENCY_SYM : currencySymbol;
                }

                function getCurrentFraction(value) {
                    var tempFraction = value.toString().split($locale.NUMBER_FORMATS.DECIMAL_SEP)[1] || "";
                    return (tempFraction && tempFraction.length > fraction) ? fraction : tempFraction.length;
                }

                function keepZeros(tempString) {
                    var parts = tempString.split($locale.NUMBER_FORMATS.DECIMAL_SEP);
                    if (parts.length < 2) {
                        return false;
                    }
                    parts[1] = parts[1].replace(/[^0-9]/g,'').substring(0, fraction);
                    return parts[0] + $locale.NUMBER_FORMATS.DECIMAL_SEP + parts[1];

                }
            }
        };
    }

})();
