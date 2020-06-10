(function () {
    'use strict';
    var attachEvent = document.attachEvent;
    var isIE = navigator.userAgent.match(/Trident/);
    var requestFrame = (function () {
        var raf = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame ||
            function (fn) {
                return window.setTimeout(fn, 20);
            };
        return function (fn) {
            return raf(fn);
        };
    })();

    var cancelFrame = (function () {
        var cancel = window.cancelAnimationFrame || window.mozCancelAnimationFrame || window.webkitCancelAnimationFrame ||
            window.clearTimeout;
        return function (id) {
            return cancel(id);
        };
    })();

    function resizeListener(e) {
        var win = e.target || e.srcElement;
        if (win.__resizeRAF__) {
            cancelFrame(win.__resizeRAF__);
        }
        win.__resizeRAF__ = requestFrame(function () {
            var trigger = win.__resizeTrigger__;
            trigger.__resizeListeners__.forEach(function (fn) {
                fn.call(trigger, e);
            });
        });
    }

    function objectLoad(e) {
        this.contentDocument.defaultView.__resizeTrigger__ = this.__resizeElement__;
        this.contentDocument.defaultView.addEventListener('resize', resizeListener);
    }

    window.addResizeListener = function (element, fn) {
        if (!element.__resizeListeners__) {
            element.__resizeListeners__ = [];
            if (attachEvent) {
                element.__resizeTrigger__ = element;
                element.attachEvent('onresize', resizeListener);
            } else {
                if (getComputedStyle(element).position === 'static') {
                    element.style.position = 'relative';
                }
                var obj = element.__resizeTrigger__ = document.createElement('object');
                obj.setAttribute('style', 'display: block; position: absolute; top: 0; left: 0; height: 100%; width: 100%; overflow: hidden; pointer-events: none; z-index: -1;');
                obj.__resizeElement__ = element;
                obj.onload = objectLoad;
                obj.type = 'text/html';
                if (isIE) {
                    element.appendChild(obj);
                }
                obj.data = 'about:blank';
                if (!isIE) {
                    element.appendChild(obj);
                }
            }
        }
        element.__resizeListeners__.push(fn);
    };

    window.removeResizeListener = function (element, fn) {
        element.__resizeListeners__.splice(element.__resizeListeners__.indexOf(fn), 1);
        if (!element.__resizeListeners__.length) {
            if (attachEvent) {
                element.detachEvent('onresize', resizeListener);
            } else {
                element.__resizeTrigger__.contentDocument.defaultView.removeEventListener('resize', resizeListener);
                element.__resizeTrigger__ = !element.removeChild(element.__resizeTrigger__);
            }
        }
    };
})();

function isFunction(object) {
    'use strict';
    return object && (typeof object === 'function');
}

(function () {
    'use strict';
    angular.module("primeModule", []);

    /* uiTime */
    angular.module("primeModule").directive("uiTimer", uiTimer);

    uiTimer.$inject = ['$interval'];

    function uiTimer($interval) {
        return {
            scope: {
                dia: '@',
                hora: '@',
                tiempoAduana: '@',
                iniciar: '@',
                tiempoInicial: '@'
            },
            restrict: "E",
            link: function (scope, element, attr, ngModel) {
                var fechaInicio, fechaActual, html, minutos, mes, recargar;
                var colores = ["green", "orange", "red", "black", "blue"];
                mes = parseInt(scope.dia.substring(5, 7)) - 1;
                fechaInicio = new Date(scope.dia.substring(0, 4), mes, scope.dia.substring(8, 10), scope.hora.substring(0, 2), scope.hora.substring(3, 5));
                scope.arrancarTimer = (scope.iniciar === 'true');
                _actualizar();

                function _actualizar() {
                    fechaActual = new Date();
                    minutos = minutosEntreFecha(fechaActual, fechaInicio);
                    if (scope.tiempoInicial !== undefined) {
                        minutos += parseInt(scope.tiempoInicial);
                        if (!scope.arrancarTimer) {
                            minutos = parseInt(scope.tiempoInicial);
                        }
                    }
                    if (minutos < 0) {
                        minutos = 0;
                    }


                    html = _colorTiempoTranscurrido(minutos, scope.tiempoAduana);
                    element.html(html);
                }

                function _colorTiempoTranscurrido(minutos, tiempoTotalAduana) {
                    var horas = minutosAHoras(minutos);
                    if (scope.tiempoAduana === undefined || scope.tiempoAduana === null) {
                        return "<span style='font-weight: bold; color:" + colores[3] + "; '>" + horas + "</span>";
                    }
                    var terceraParteTiempo = tiempoTotalAduana / 3;

                    var color = "";
                    if (!scope.arrancarTimer) {
                        color = colores[3];
                    } else {
                        if (minutos < terceraParteTiempo) {
                            color = colores[0];
                        }
                        if (minutos >= terceraParteTiempo && minutos < (terceraParteTiempo * 2)) {
                            color = colores[1];
                        }
                        if (minutos >= (terceraParteTiempo * 2)) {
                            color = colores[2];
                        }
                    }
                    return "<span style='font-weight: bold; color:" + color + "; '>" + horas + "</span>";

                }

                if (scope.arrancarTimer) {
                    recargar = $interval(_actualizar, (58 * 1000));
                }
                scope.$on('$destroy', function () {
                    $interval.cancel(recargar);
                });
            }
        };
    }

    /* uiTime para el tablero de actas pemdientes por autorizar */
    angular.module("primeModule").directive("uiTimerActas", uiTimerActas);
    uiTimerActas.$inject = ['$interval'];

    function uiTimerActas($interval) {
        return {
            scope: {
                dia: '@',
                hora: '@',
                tiempoAduana: '@',
                iniciar: '@',
                tiempoInicial: '@',
                tiempoMax: '@'
            },
            restrict: "E",
            link: function (scope, element, attr, ngModel) {
                var fechaInicio, fechaActual, html, minutos, mes, recargar;
                var colores = ["green", "#F2D200", "red", "black", "blue"];
                mes = parseInt(scope.dia.substring(5, 7)) - 1;
                fechaInicio = new Date(scope.dia.substring(0, 4), mes, scope.dia.substring(8, 10), scope.hora.substring(0, 2), scope.hora.substring(3, 5));
                scope.arrancarTimer = (scope.iniciar === 'true');
                _actualizar();

                function _actualizar() {
                    fechaActual = new Date();
                    minutos = minutosEntreFecha(fechaActual, fechaInicio);
                    if (scope.tiempoInicial !== undefined) {
                        minutos += parseInt(scope.tiempoInicial);
                        if (!scope.arrancarTimer) {
                            minutos = parseInt(scope.tiempoInicial);
                        }
                    }
                    if (minutos < 0) {
                        minutos = 0;
                    }

                    html = _colorTiempoTranscurrido(minutos, scope.tiempoMax);
                    element.html(html);
                }

                /**
                 *
                 * @param minutos
                 * @param tiempoTotalAduana
                 * @returns {string}
                 * @private
                 */
                function _colorTiempoTranscurrido(minutos, tiempoTotalAduana) {
                    var horas = minutosAHoras(minutos);
                    if (scope.tiempoAduana === undefined || scope.tiempoAduana === null || parseInt(tiempoTotalAduana, 10) === 0) {
                        return "<span style='font-weight: bold; color:" + colores[3] + "; '>" + horas + "</span>";
                    }
                    var terceraParteTiempo = tiempoTotalAduana / 3;

                    var color = "";
                    if (!scope.arrancarTimer) {
                        color = colores[3];
                    } else {
                        if (minutos < terceraParteTiempo) {
                            color = colores[0];
                        }
                        if (minutos > terceraParteTiempo && minutos < (terceraParteTiempo * 2)) {
                            color = colores[1];
                        }
                        if (minutos > (terceraParteTiempo * 2)) {
                            color = colores[2];
                        }
                    }
                    return "<span style='font-weight: bold; color:" + color + "; '>" + horas + "</span>";

                }

                if (scope.arrancarTimer) {
                    recargar = $interval(_actualizar, (58 * 1000));
                }
                scope.$on('$destroy', function () {
                    $interval.cancel(recargar);
                });
            }
        };
    }


    /* uiTime Reverse Filtro */
    angular.module("primeModule").filter('numberFixedLen', function () {
        return function (n, len) {
            var num = parseInt(n, 10);
            len = parseInt(len, 10);
            if (isNaN(num) || isNaN(len)) {
                return n;
            }
            num = '' + num;
            while (num.length < len) {
                num = '0' + num;
            }
            return num;
        };
    });

    /* uiTime Reverse */
    angular.module("primeModule").directive("uiTimerReverse", uiTimerReverse);

    uiTimerReverse.$inject = ["$interval"];

    function uiTimerReverse($interval) {
        return {
            scope: {
                tiempoMaximo: '@tiempoMaximo',
                fechaFinal: '@fechaFinal'
            },
            link: _link,
            template: "<span style='color: {{ ui_reverse_color }};'>{{ horas | numberFixedLen: 2 }}:{{ minutos | numberFixedLen: 2}}</span>"
        };

        function _link(scope, element, attr) {

            actualizar();

            var intervalo = $interval(actualizar, 30 * 1000);   

            function actualizar() {

                var fechaActual = new Date();
                var fechaFinal = new Date(parseInt(scope.fechaFinal));


                var tiempo_restante_minutos = ((fechaFinal.getTime() - fechaActual.getTime()) / 1000) / 60;
                if (tiempo_restante_minutos > 0) {
                    scope.horas = Math.floor(tiempo_restante_minutos / 60);
                    scope.minutos = tiempo_restante_minutos - (scope.horas * 60);
                } else {
                    scope.horas = 0;
                    scope.minutos = 0;
                    $interval.cancel(intervalo);
                }
                scope.ui_reverse_color = determinarColor(scope.tiempoMaximo, Math.floor(tiempo_restante_minutos));
            }

            function determinarColor(tiempo_total, tiempo_restante) {
                var seccion_quinta = tiempo_total / 5;
                var primer_bloque = seccion_quinta;
                var segundo_bloque = seccion_quinta * 3;
                if (tiempo_restante <= primer_bloque) {
                    return "red";
                } else if (tiempo_restante <= segundo_bloque) {
                    return "orange";
                } else {
                    return "green";
                }
            }

        }
    }


    /* uiSeccion */
    angular.module("primeModule").directive("uiSeccion", uiSeccion);

    function uiSeccion() {
        return {
            transclude: true,
            scope: {
                uiSeccion: '@uiSeccion'
            },
            link: function (scope, element, attr) {
                element.addClass("ui-section");
            },
            template: '<div class="panel panel-primary"> <div class="panel-heading">{{ uiSeccion }}</div> <div class="panel-body"><ng-transclude></ng-transclude></div></div>'
        };
    }


    /* uiButton */
    angular.module("primeModule").directive("uiButton", uiButton);

    uiButton.$inject = [];

    function uiButton() {
        return {
            transclude: true,
            scope: {
                icono: '@icono',
                uiButton: '@uiButton',
                title: '@title'
            },
            link: function (scope, element, attrs) {
                element.addClass("ui-button").addClass("ui-widget").addClass("ui-state-default").addClass("ui-corner-all").addClass("ui-button-text-icon-left");
                if (!scope.uiButton) {
                    element.addClass("no-text");
                }

                element.bind("mouseenter", function () {
                    element.addClass("ui-state-hover");
                });
                element.bind("mouseleave", function () {
                    element.removeClass("ui-state-hover");
                });
            },
            template: '<span class="ui-button-icon-left ui-icon ui-c {{ icono }}" ng-if="icono"></span><span class="ui-button-text ui-c" ng-class="{\'no-icon\': !icono}">{{ uiButton }}</span>'
        };
    }

    /* uiLegend */
    angular.module("primeModule").directive("uiLegend", uiLegend);

    uiLegend.$inject = ["$timeout"];

    function uiLegend($timeout) {
        return {
            transclude: true,
            scope: {
                uiLegend: '@uiLegend',
                uiLegendClose: '=?close',
                closed: '=closed',
                onOpen: '=',
                onAbrir: '=',
                onCerrar: '='
            },
            link: function (scope, element, attrs) {

                scope.click = function () {

                    if (scope.closed) {
                        return;
                    }


                    scope.uiLegendClose = !scope.uiLegendClose;
                    if (scope.onOpen) {
                        scope.onOpen()(!scope.uiLegendClose);
                    }

                };
                if (scope.uiLegendClose === undefined) {
                    scope.uiLegendClose = scope.$eval(attrs.initClose);
                }

                scope.$watch("uiLegendClose", function (val) {
                    if (!val) {
                        if (scope.onAbrir) {
                            scope.onAbrir();
                        }
                    } else {
                        if (scope.onCerrar) {
                            scope.onCerrar();
                        }
                    }
                });


                element.addClass("ui-legend");
            },
            template: '<fieldset class="ui-fieldset ui-fieldset ui-widget ui-widget-content ui-corner-all ui-hidden-container ui-fieldset-toggleable">' +
            '<legend class="ui-fieldset-legend ui-corner-all ui-state-default ui-state-active" ng-click="click()">' +
            '<span class="ui-fieldset-toggler ui-icon" ng-class="{\'ui-icon-minusthick\': !uiLegendClose, \'ui-icon-plusthick\': uiLegendClose}"></span>{{ uiLegend }}</legend> <div ng-transclude ng-show="!uiLegendClose"></div></fieldset>'
        };
    }

    /* uiConfirm */

    angular.module("primeModule").directive("uiConfirm", uiConfirm);

    uiConfirm.$inject = [];

    function uiConfirm() {
        return {
            scope: {
                confirm: '&confirm',
                cancel: '&cancel',
                title: '@titulo'
            },
            link: function (scope, element, attrs) {
                scope.cerrar_dialog = function () {
                    angular.element(document.getElementById("ui-modal-id-" + scope.modal_id)).addClass("ui-modal-hide").removeClass('fadein');
                };

                scope.$parent.modal_id = scope.modal_id;

                var con_cerrar = angular.element(element.find("span")[1]).parent();

                scope.over = function () {
                    con_cerrar.removeClass('ui-widget-header');
                    con_cerrar.addClass('ui-state-hover');
                };

                scope.leave = function () {
                    con_cerrar.addClass('ui-widget-header');
                    con_cerrar.removeClass('ui-state-hover');
                };
            },
            template: ""
        };
    }

    angular.module("primeModule").factory("uiConfirm", ["$compile", "$rootScope", function ($compile, $rootScope) {

        function _abrir(titulo, cuerpo, confirm, cancel, cerrar) {

            var scope = $rootScope.$new();
            scope.confirm = function () {
                if (isFunction(confirm)) {
                    confirm();
                }
                scope.cerrar_dialog();
            };
            scope.cancel = function () {
                if (isFunction(cancel)) {
                    cancel();
                }
                scope.cerrar_dialog();
            };

            scope.cerrar = function () {
                if (isFunction(cerrar)) {
                    cerrar();
                }
                scope.cerrar_dialog();
            };

            scope.titulo = titulo;
            scope.cuerpo = cuerpo;

            scope.cerrar_dialog = function () {
                angular.element(document.getElementById("ui-id-" + scope.$id)).remove();
            };
            angular.element(document.body).append($compile("<div class='ui-modal-wrapper' id='ui-id-{{ $id }}'><div class='ui-modal-container'><div class='ui-modal-header'><span>{{ titulo }}</span> " +
                " <div class='cerrar ui-widget-header' ng-mouseover='over()' ng-mouseleave='leave()' ng-click='cerrar()'><span class='ui-icon ui-icon-closethick'></span></div></div>" +
                "<div class='ui-modal-content'><div class='inner-content'><span class='ui-icon ui-icon-alert ui-confirm-dialog-severity'></span>" + cuerpo + "</div>" +
                "<div class='bottom-content'><button ui-button='Si' ng-click='confirm()'></button><button ui-button='No' ng-click='cancel()'></button></div></div></div></div>")(scope));

        }

        return {
            abrir: _abrir
        };

    }]);


    /* uiModal */

    angular.module("primeModule").directive("uiModal", uiModal);

    uiModal.$inject = ["uiModal"];

    function uiModal(uiModal) {


        return {
            transclude: true,
            scope: {
                modal_id: '@nombre',
                titulo: '@titulo',
                tamanio: '@tamanio'
            },
            link: function (scope, element, attrs) {
                scope.cerrar_dialog = function () {
                    angular.element(document.getElementById("ui-modal-id-" + scope.modal_id)).addClass("ui-modal-hide").removeClass('fadein');
                    uiModal.cerrar(scope.modal_id);
                };

                scope.cancelar_dialog = function () {
                    angular.element(document.getElementById("ui-modal-id-" + scope.modal_id)).addClass("ui-modal-hide").removeClass('fadein');
                    uiModal.cancelar(scope.modal_id);
                };

                scope.$parent.modal_id = scope.modal_id;

                var con_cerrar = angular.element(element.find("span")[1]).parent();

                scope.over = function () {
                    con_cerrar.removeClass('ui-widget-header');
                    con_cerrar.addClass('ui-state-hover');
                };

                scope.leave = function () {
                    con_cerrar.addClass('ui-widget-header');
                    con_cerrar.removeClass('ui-state-hover');
                };


                var contenedor = element.children().children()[0];
                var WIDTH_INICIAL = null;


                if (!isIE()) {
                    addResizeListener(contenedor, function () {


                        //console.log(contenedor.getBoundingClientRect().height + "px");

                        // contenedor.getElementsByClassName("ui-modal-content")[0].style.height
                        // = (contenedor.getBoundingClientRect().height - 25) + "px";

                    });

                    addEvent(window, 'resize', function () {

                        var clases = angular.element(contenedor).parent()[0].className;
                        if (clases && clases.match(/ui-modal-hide/)) {
                            return;
                        }
                        //console.log('WITH = contenedor.getBoundingClientRect().width', contenedor.getBoundingClientRect().width);
                        if (WIDTH_INICIAL === null || WIDTH_INICIAL === undefined) {
                            WIDTH_INICIAL = contenedor.getBoundingClientRect().width;
                        }
                        //console.debug('[uiModal width]', WIDTH_INICIAL);

                        var width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;

                        if (width > WIDTH_INICIAL) {
                            contenedor.style.width = WIDTH_INICIAL;
                            return;
                        }

                        contenedor.style.width = (width - 20) + 'px';

                    });


                }

                var header = contenedor.children[0];

                var move = {};

                var dragX = 0,
                    dragY = 0;


                header.addEventListener("dragstart", function (event) {
                    move.y = event.screenY - contenedor.getBoundingClientRect().top;
                    move.x = event.screenX - contenedor.getBoundingClientRect().left;
                    event.dataTransfer.setData("text/plain", "");
                });

                header.addEventListener("dragover", function (event) {
                    event.preventDefault();
                });

                header.addEventListener("dragend", function (event) {
                    contenedor.style.position = "absolute";
                    contenedor.style.top = (dragY - move.y) + "px";
                    contenedor.style.left = (dragX - move.x) + "px";
                });

                header.addEventListener("drag", function (event) {
                    contenedor.style.position = "absolute";
                    contenedor.style.top = (dragY - move.y) + "px";
                    contenedor.style.left = (dragX - move.x) + "px";
                });

                document.addEventListener("dragover", function (event) {
                    dragX = event.screenX;
                    dragY = event.screenY;
                });

                scope.direcciones = ['rigth', 'bottom'];


            },
            template: "<div class='ui-modal-wrapper ui-modal-hide' id='ui-modal-id-{{modal_id}}'><div class=" + "\"ui-modal-class-id ui-modal-main ui-modal-container{{tamanio?('-'+tamanio):('')}}\"" + " id='ui-modal-draggable-{{ $id }}' resizablet r-directions='direcciones'><div class='ui-modal-header' draggable='true'><span>{{ titulo }}</span> " +
            " <div class='cerrar ui-widget-header' ng-mouseover='over()' ng-mouseleave='leave()' ng-click='cancelar_dialog()'><span class='ui-icon ui-icon-closethick'></span></div></div>" +
            "<div class='ui-modal-content'><div class='inner-content'><div ng-transclude></div></div></div></div></div>",

        };

    }

    angular.module("primeModule").factory('uiModal', ['$q', function ($q) {
        var shared = {};
        var fn_callbacks = {};
        var fn_start = {};
        var resolvers = {};

        return {
            abrir: function (nombre) {
                var el = document.getElementById("ui-modal-id-" + nombre);
                angular.element(el).removeClass("ui-modal-hide").addClass('fadein');
                document.body.style.overflow = 'hidden';

                var uiContainer = el.getElementsByClassName("ui-modal-class-id")[0];
                var contenedor = uiContainer.getBoundingClientRect();

                if (!shared[nombre]) {
                    shared[nombre] = {WIDTH_INICIAL: contenedor.width};
                }


                var width = window.innerWidth ||
                    document.documentElement.clientWidth ||
                    document.body.clientWidth;

                console.debug('Contenedor', shared[nombre]);


                width = width > shared[nombre].WIDTH_INICIAL ? shared[nombre].WIDTH_INICIAL : width;

                uiContainer.style.width = (width - 20) + 'px';

                if (isFunction(fn_start[nombre])) {
                    fn_start[nombre]();
                }

                resolvers["ui-modal-id-" + nombre] = $q.defer();
                return resolvers["ui-modal-id-" + nombre].promise;

            },
            cerrar: function (nombre) {
                document.body.style.overflow = 'auto';
                if (nombre) {
                    angular.element(document.getElementById("ui-modal-id-" + nombre)).addClass('ui-modal-hide').removeClass('fadein');
                    if (isFunction(fn_callbacks[nombre])) {
                        fn_callbacks[nombre]();
                    }
                    resolvers["ui-modal-id-" + nombre].resolve();
                    return;
                }
                angular.element(document.querySelectorAll('.ui-modal-wrapper')).addClass('ui-modal-hide').removeClass('fadein');
                for (var i in fn_callbacks) {
                    if (fn_callbacks.hasOwnProperty(i) && isFunction(fn_callbacks[i])) {
                        fn_callbacks[i]();
                        resolvers[i].resolve();
                    }
                }
            },
            cancelar: function (nombre) {
                document.body.style.overflow = 'auto';
                if (nombre) {
                    angular.element(document.getElementById("ui-modal-id-" + nombre)).addClass('ui-modal-hide').removeClass('fadein');
                    if (isFunction(fn_callbacks[nombre])) {
                        fn_callbacks[nombre]();
                    }
                    resolvers["ui-modal-id-" + nombre].reject();
                    return;
                }
                angular.element(document.querySelectorAll('.ui-modal-wrapper')).addClass('ui-modal-hide').removeClass('fadein');
                for (var i in fn_callbacks) {
                    if (fn_callbacks.hasOwnProperty(i) && isFunction(fn_callbacks[i])) {
                        fn_callbacks[i]();
                        resolvers[i].reject();
                    }
                }
            },
            set: function (name, key) {
                shared[name] = angular.copy(key);
            },
            get: function (name) {
                return shared[name];
            },

            /**
             * @deprecated
             */
            onClose: function (name, fn) {
                console.warn('ui-modal - OnClose: Se recomienda el uso de la promesa');

                fn_callbacks[name] = fn;
            },
            onOpen: function (name, fn) {
                fn_start[name] = fn;
            }
        };
    }]);

    angular.module("primeModule").directive("limitTo", function () {
        return {
            restrict: "A",
            require: "^ngModel",
            scope: false,
            link: function (scope, elem, attrs, modelCtrl) {
                var limit = parseInt(attrs.limitTo);
                /*console.log("Limite; " + limit);
                 scope.$watch("model", function(newVal){
                 debugger;
                 if(newVal && newVal.length >= limit) {
                 scope.model = scope.model.substring(0, limit);
                 }
                 });*/
                modelCtrl.$parsers.push(function (inputValue) {
                    if (!inputValue) {
                        return '';
                    }
                    var transformedInput = inputValue;
                    if (inputValue.length >= limit) {
                        transformedInput = inputValue.substring(0, limit);
                    }
                    if (transformedInput !== inputValue) {
                        modelCtrl.$setViewValue(transformedInput);
                        modelCtrl.$render();
                    }
                    return transformedInput;
                });
            }
        };
    });

    angular.module('primeModule').directive('uppercased', function () {
        return {
            require: 'ngModel',
            link: function (scope, element, attrs, modelCtrl) {
                modelCtrl.$parsers.push(function (input) {
                    return input ? input.toUpperCase() : '';
                });
                element.css("text-transform", "uppercase");
            }
        };
    });

    angular.module('primeModule').directive('onlyDigits', function () {

        return {
            restrict: 'A',
            require: '?ngModel',
            link: function (scope, element, attrs, modelCtrl) {
                modelCtrl.$parsers.push(function (inputValue) {
                    if (!inputValue) {
                        return '';
                    }
                    var transformedInput = inputValue.replace(/[^0-9]/g, '');
                    if (transformedInput !== inputValue) {
                        modelCtrl.$setViewValue(transformedInput);
                        modelCtrl.$render();
                    }
                    return transformedInput;
                });
            }
        };
    });


    angular.module('primeModule').directive('onlyMoney', function () {

        return {
            restrict: 'A',
            require: '?ngModel',
            link: function (scope, element, attrs, modelCtrl) {
                modelCtrl.$parsers.push(function (inputValue) {
                    if (!inputValue) {
                        return '';
                    }
                    var transformedInput = inputValue.replace(/[^0-9\.]/g, '');
                    if (transformedInput !== inputValue) {
                        modelCtrl.$setViewValue(transformedInput);
                        modelCtrl.$render();
                    }
                    return transformedInput;
                });
            }
        };
    });

    angular.module('primeModule').directive('format', ['$filter', function ($filter) {
        return {
            require: '?ngModel',
            restrict: 'A',
            link: function (scope, elem, attrs, ctrl) {
                if (!ctrl) {
                    return;
                }

                ctrl.$formatters.unshift(function (a) {
                    return $filter(attrs.format)(ctrl.$modelValue);
                });

                elem.bind('blur', function (event) {
                    var plainNumber = elem.val().replace(/[^\d|\-+|\.+]/g, '');
                    elem.val($filter(attrs.format)(plainNumber));
                });
            }
        };
    }]);

    angular.module('primeModule').directive('botonFooter', function () {
        return {
            restrict: 'E',
            template: '<div style="display: inline-block"> <button ui-button style="margin: auto; display: block" icono="{{icono}}" ng-click="ngClick" ng-disabled="ngDisabled"> </button> <label style="margin: auto">{{titulo}}</label></div>',
            scope: {
                icono: '@',
                titulo: '@',
                ngClick: '&',
                ngDisabled: '='
            }
        };
    });


    angular.module('primeModule').directive('uiArea', uiArea);

    uiArea.$inject = ["$filter"];
    function uiArea($filter) {
        return {
            scope: _scope(),
            require: ['?ngModel', '?limitTo'],
            restrict: 'A',
            link: _link,
            template: ""
        };

        function _scope() {
            return {
                ngModel: '=',
                limitTo: '='
            };
        }

        function _link(scope, element, attrs, ngModelCtrl) {
            var span = document.createElement("div");

            if (!scope.limitTo) {
                throw new Error("El atributo limit-to es obligatorio para ui-area");
            }

            _onChange();
            scope.$watch('limitTo', _onChange);
            scope.$watch('ngModel', _onChange);

            function _onChange(newVal, oldVal) {
                span.textContent = $filter("translate")("gen_carac") + ": " + (scope.limitTo - (scope.ngModel ? scope.ngModel.length : 0));
            }

            element.parent().append(span);

        }

    }

    angular.module('primeModule').directive('uiFraccion', uiFraccion);

    uiFraccion.$inject = ["$filter"];

    function uiFraccion($filter) {
        return {
            scope: _scope(),
            require: '?ngModel',
            restrict: 'A',
            link: _link,
            template: ""
        };

        function _scope() {
            return {
                ngModel: '='
            };
        }

        function _link(scope, element, attrs, ngModelCtrl) {
            var fraccionPattern = /^[0-9]{4}(\.[0-9]{2}(\.[0-9]{2}(\.[0-9]{2})?)?)?$/g;

            ngModelCtrl.$validators.pattern = function (modelValue, viewValue) {
                var value = modelValue || viewValue;
                var isValido = fraccionPattern.test(value);
                fraccionPattern.lastIndex = 0;
                return isValido;
            };

            ngModelCtrl.$parsers.push(_crearFraccion);
            ngModelCtrl.$formatters.push(_crearFraccion);

            function _crearFraccion(inputValue) {
                if (!inputValue) {
                    return '';
                }
                var transformedInput = inputValue.replace(/[^0-9]|\./g, '').substring(0, 10);

                transformedInput = $filter('fraccion')(transformedInput);

                ngModelCtrl.$setViewValue(transformedInput);
                ngModelCtrl.$render();

                return transformedInput;
            }
        }

    }

    angular
        .module('primeModule')
        .directive('input', FixIEClearButton);

    FixIEClearButton.$inject = ['$timeout', '$sniffer'];

    function FixIEClearButton($timeout, $sniffer) {
        var directive = {
            restrict: 'E',
            require: '?ngModel',
            link: Link,
            controller: function () {
            }
        };

        return directive;

        function Link(scope, elem, attr, controller) {
            var type = elem[0].type;
            //ie11 doesn't seem to support the input event, at least according to angular
            if (type !== 'text' || !controller || $sniffer.hasEvent('input')) {
                return;
            }

            elem.on("mouseup", function (event) {
                var oldValue = elem.val();
                if (!oldValue || oldValue === "") {
                    return;
                }

                $timeout(function () {
                    var newValue = elem.val();
                    if (newValue !== oldValue) {
                        elem.val(oldValue);
                        elem.triggerHandler('keydown');
                        elem.val(newValue);
                        elem.triggerHandler('focus');
                    }
                }, 0, false);
            });

            scope.$on('$destroy', destroy);
            elem.on('$destroy', destroy);

            function destroy() {
                elem.off('mouseup');
            }
        }
    }
    
    angular.module("primeModule").directive("selectorFechas", selectorFechas);

        selectorFechas.$inject = [];

        function selectorFechas() {

            var template = ['<input type="text" ng-model="model" ng-class="sin-botones" uib-datepicker-popup="dd/MM/yyyy"' +
                'class="form-control" is-open="b_fecha_de" datepicker-options="{ showWeeks: false }" name="nombre"' +
                'ng-required="requerido" ui-mask="99/99/9999" model-view-value="true" />' +
                '<span class="input-group-btn">' +
                '<button ui-button icono="ui-icon-calendar" type="button" ng-click="b_fecha_de=!b_fecha_de"></button>' +
                '</span>'
            ].join();

            return {
                template: template,
                scope: {
                    model: '=ngModel',
                    requerido: '=ngRequired',
                    nombre: '=name'
                },
                require: ['ngModel']
            };
        }



})();