/**
 *   Rub&eacute;n Guzm&aacute;n G&oacute;mez
 *   ruben.guzman@softtek.com
 *   on 10/08/2017.
 */

(function () {
    "use strict";
    angular.module('ac.decorators.uiSelect', []).config(_config);

    _config.$inject = ['$provide'];

    function _config($provide) {
        $provide.decorator('uiSelectDirective', _uiSelectDecorator);

        _uiSelectDecorator.$inject = ['$delegate'];

        function _uiSelectDecorator($delegate) {
            var directive = $delegate[0];

            // No tiene link debemos obtener la funcion directamente ejecutando compile
            var link = directive.compile(angular.element('<div>'), {});

            // El template url que tiene es una funcion asi que se maneja asincrono, y los ciclos de creacion de la
            // directiva cambian, show-errors require un ciclo normal.
            directive.templateUrl = null;
            directive.template = '<div class="ui-select-container ui-select-bootstrap dropdown" ng-class="{open: $select.open}"> <div class="ui-select-match"></div><span ng-show="$select.open && $select.refreshing && $select.spinnerEnabled" class="ui-select-refreshing{{$select.spinnerClass}}"></span> <input type="search" autocomplete="off" tabindex="-1" aria-expanded="true" aria-label="{{$select.baseTitle}}" aria-owns="ui-select-choices-{{$select.generatedId}}" class="form-control ui-select-search" ng-class="{\'ui-select-search-hidden\' : !$select.searchEnabled}" placeholder="{{$select.placeholder}}" ng-model="$select.search" ng-show="$select.open"> <div class="ui-select-choices"></div><div class="ui-select-no-choice"></div></div>';

            directive.compile = function (tElement, tAttrs) {
                /*
                 * Esto esta definido en el compile de la directiva es necesario, ya que se reemplazara
                 */
                // Allow setting ngClass on uiSelect
                var match = /{(.*)}\s*{(.*)}/.exec(tAttrs.ngClass);
                if (match) {
                    var combined = '{' + match[1] + ', ' + match[2] + '}';
                    tAttrs.ngClass = combined;
                    tElement.attr('ng-class', combined);
                }

                //Multiple or Single depending if multiple attribute presence
                if (angular.isDefined(tAttrs.multiple)) {
                    throw Error('Multiple no esta disponible utilice la directiva de uiList');
                } else {
                    tElement.append('<ui-select-single/>');
                }

                if (tAttrs.inputId) {
                    tElement.querySelectorAll('input.ui-select-search')[0].id = tAttrs.inputId;
                }

                return function (scope, element, attrs, ctrls, transcludeFn) {
                    var $select = ctrls[0];
                    var oldClose = $select.close;
                    var PADDING = window.isIE() ? 25 : 5;


                    $select.close = function (skipFocusser) {
                        oldClose.apply(this, arguments);

                        // Agregamos el trigger
                        element.triggerHandler('blur');
                    };

                    scope.$on('uis:activate', function () {
                        var dropdown = angular.element(element).querySelectorAll('.ui-select-dropdown');
                        var bodyWidth = document.body.offsetWidth;
                        var widthCalculado = bodyWidth - Math.trunc(getOffset(element[0]).left) - PADDING;
                        dropdown[0].style.width = 'auto';
                        dropdown[0].style.minWidth = element[0].offsetWidth;
                        dropdown[0].style.maxWidth = widthCalculado;
                    });

                    link.apply(this, arguments);

                    function getOffset(el) {
                        var elemento = el.getBoundingClientRect();
                        var body = document.body.getBoundingClientRect();
                        return {top: elemento.top - body.top, left: elemento.left - body.left};
                    }
                };
            };


            return $delegate;
        }
    }
})();