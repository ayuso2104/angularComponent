/**
 * @ngdoc module
 * @name panelModule
 *
 * @description
 * Modulo que contiene las directivas para el "acordeon" de las vistas principales
 */
(function () {
    'use strict';
    angular.module("panelModule", [])
    /**
     * @ngdoc directive
     * @name acAcordeon
     * @restrict EA
     * @version 2.0.1
     * @since 1.0.0
     *
     * @description
     * Directiva que controla la apertura de los diferentes paneles que contenga, por default solo un panel
     * se puede abrir al mismo tiempo
     *
     * @param {boolean} multiple Permite la apertura de los paneles de manera simultanea.
     *
     * @example
     * # ACORDEON
     * <ac-acordeon>
     *      <html><html>
     * </ac-acordeon>
     *
     * * @example
     * # ACORDEON
     * <div ac-acordeon>
     *      <html><html>
     * </div>
     *
     */
        .directive("acAcordeon", ['$q', function ($q) {
            return {
                restrict: 'EA',
                transclude: true,
                controller: ['$scope', '$attrs', function ($scope, $attrs) {
                    var _pilaSeleccionado = [];

                    this.select = _select;
                    this.removeIndice = _removeIndice;

                    this.isBloqueable = $scope.$eval($attrs.bloqueable);

                    function _select(panel) {
                        return _cerrarPaneles().then(function () {
                            panel.seleccionado = true;
                            return _pilaSeleccionado.push(panel);
                        });
                    }

                    var _success = function (panel) {
                        return function (success) {
                            panel.seleccionado = false;
                            return success;
                        };
                    };

                    var _error = function (panel) {
                        return function (error) {
                            _pilaSeleccionado.push(panel);
                            return $q.reject(error);
                        };
                    };

                    function _cerrarPaneles() {
                        var promises = [];
                        if ($attrs.multiple) {
                            return $q.when();
                        }

                        while (_pilaSeleccionado.length > 0) {
                            var panelAbierto = _pilaSeleccionado.pop();
                            if(panelAbierto.isDesbloqueado) {
                                promises.push($q
                                    .when(panelAbierto.onCerrar ? panelAbierto.onCerrar() : true)
                                    .then(_success(panelAbierto))
                                    .catch(_error(panelAbierto)));
                            }
                        }

                        return $q.all(promises);
                    }

                    function _removeIndice(indice) {
                        _pilaSeleccionado.splice(indice - 1, 1);
                    }
                }],
                template: '<div class="panel-body"><div class="panel-group"> <ng-transclude></ng-transclude></div></div>'
            };
        }])
        /**
         * @ngdoc directive
         * @name panel
         * @restrict EA
         * @version 2.0.1
         * @since 1.0.0
         *
         * @description
         * Contiene el controlador y la vista de cada panel, cada vez que se realice clic sobre el panel este se abrira
         * o cerrara dependiendo de su estado actual.
         * Permite manipularse desde el controlador que se asigne.
         * Contiene 3 funciones que se permiten ejecutar desde el controlador que se le asigne.
         *
         * init - funcion que se ejecutara la primera vez que se abra el panel
         * onAbrir - funcion que se ejecutara cada vez que se abra el panel
         * onCerrar - funcion que se ejecutara cada vez que se cierre el panel, este metodo soporta la resolucion de un
         *             valor o una promesa y dependiendo de la promesa, si esa se resolvio se cerraran los paneles de la
         *             manera por defecto, si se rechazo no se cerrará ni abrirá nada.
         *
         * @param {string}  panel       Permite la asignacion de un nombre al panel.
         * @param {string}  plantilla   La ruta donde se encuentra el html a utilizar, se utiliza a traves de ng-include.
         * @param {boolean} abierto     Permite la apertura o cierre del panel a traves de una 2da bandera y no solo al
         *                              hacer clic sobre de el.
         * @param {String}  numero      Muestra un (contador) utilizado normalmente para mostrar el numero de registros
         *                              que contiene alguna tabla que se encuentre dentro del panel.
         * @param {String}  sufijo      Muestra un numero delante del parametro numero.
         * @param {boolean} once        Por defecto para ocultar el contenido del panel se utiliza el ng-if, si la
         *                              bandera esta encendida solo se utlizara una vez ng-if y de ahi en adelante se
         *                              utilizara ng-show
         * @param {string} panelcolor   Muestra la fuente del panel en negro por defecto, si se pasa en texto el color en ingles 
         *                              como se define en los estilos se pintara el titulo
         * @param {object} obj          Objeto para enviar datos cuando se ejecuta onAbrir e init
         *
         * @example
         *     <div panel="panelEjemplo"
         *          plantilla="resources/js/modules/administracionServicios/views/administracionServicios.view.html"
         *          controller="controllerEjemplo as vm">
         *     </div>
         *     <script>
         *         angular.controller('controllerEjemplo', ['$scope',function($scope){
         *              var vm = this;
         *              $scope.init = function(){};
         *              $scope.onAbrir = function(){};
         *              $scope.onCerrar = function(){};
         *
         *         ]);
         *     </script>
         *
         *
         *
         **/
        .directive("panel", function () {

            return {
                transclude: true,
                require: '^acAcordeon',
                restrict: 'AE',
                scope: {
                    'nombre': '@panel',
                    'plantilla': '@plantilla',
                    'estadoI': '=?abierto',
                    'numero': '=?numero',
                    'panelColor':'=?panelcolor',
                    'sufijo': '=?sufijo',
                    'eventToOpen': '@event',
                    'once': '=',                         //Solo aplicará una vez el ng-if y de ahi utilizara ng-show
                    'pintarNumero': '@pintarNumero',
                    'titulo': '@tituloDerecha',
                    'obj': '=obj'
                },
                link: function (scope, element, attr, $ctrl) {

                    var _init = false;
                    var indice = null;

                    scope.isBloqueable = !!$ctrl.isBloqueable;
                    scope.isDesbloqueado = true;

                    scope.bloquearPestania = _bloquearPestania;
                    scope.desbloquearPestania = _desbloquearPestania;

                    if(scope.titulo) {
                        scope.$on(scope.titulo, function (event, tituloDerecha) {
                            scope.tituloDerecha = tituloDerecha;
                        });
                    }
                    
                    if(scope.pintarNumero && scope.pintarNumero === 'false') {
                    	scope.pintarNumero = false;
                    } else {
                    	scope.pintarNumero = true;
                    }
                    
                    if(scope.eventToOpen) {
                        scope.$on(scope.eventToOpen, function() {
                            scope.mostrar();
                        });
                    }
                    
                    scope.$watch("panelColor", function (newValue,oldValue) {
                        if (newValue!==oldValue) {
                            scope.color = {'background-color': scope.panelColor, 'padding-top': '2px',
                            'padding-bottom': '1px'};
                            scope.padd = { 'padding': 0};
                        }

                    });

                    
                    scope.mostrar = function () {
                        if(scope.isDesbloqueado) {
                            if (scope.seleccionado) {
                                return _cerrar();
                            }
                            _abrir();
                        }
                    };

                    scope.$watch("estadoI", function (estado) {
                        if (estado === false) {
                            return _cerrar();
                        } else if (estado === true) {
                            _abrir();
                        }

                    });

                    function _bloquearPestania($event) {
                        $event.stopPropagation();
                        scope.isDesbloqueado =false;
                        console.log("Voy a bloquear esta pestania");
                    }

                    function _desbloquearPestania($event) {
                        $event.stopPropagation();
                        scope.isDesbloqueado = true;
                        console.log("Voy a desbloquear esta pestania");
                    }

                    function _cerrar() {

                        if (scope.onCerrar && scope.onCerrar() === false) {
                            return;
                        }
                        $ctrl.removeIndice(indice);
                        scope.seleccionado = false;
                    }

                    function _abrir() {
                        indice = $ctrl.select(scope).then(function () {
                            if (!scope.seleccionado) {
                                return;
                            }
                            if (!_init && scope.init) {
                                scope.init(scope.obj);
                                _init = true;
                            }
                            if (scope.onAbrir) {
                                scope.onAbrir(scope.obj);
                            }
                            scope.abierto = true;
                        });
                    }
                    /**Pintar el numero en los panels */
                    if (scope.onAbrir && scope.pintarNumero) {
                        scope.onAbrir(scope.obj);
                    }

                },
                template: "<div class='ui-panel-header'  ng-class='{ui_panel_active: seleccionado}' ng-style='padd'><div ng-click='mostrar()' ng-style='color'>" +
                "<span class='ui-icon ui-icon-triangle-1-e' ng-if='!seleccionado'></span>" +
                "<span class='ui-icon ui-icon-triangle-1-s' ng-if='seleccionado'></span><div class='panel-name'  >{{ nombre  }}" +
                "<span ng-if='numero!==undefined'> ({{ numero }})</span> <span ng-if='sufijo'>({{ sufijo }})</span></div>" +
                "<span class='ui-icon ui-icon-unlocked panel-candado' ng-if='isBloqueable && seleccionado && isDesbloqueado' ng-click='bloquearPestania($event)'></span>" +
                "<span class='ui-icon ui-icon-locked panel-candado' ng-if='isBloqueable && seleccionado && !isDesbloqueado' ng-click='desbloquearPestania($event)'></span>" +
                "<span class='panel-titulo-derecha' ng-if='tituloDerecha && seleccionado'>{{ tituloDerecha }}</span>" +
                "</div>" +
                "<div class='ui-panel-content' ng-if='(once && abierto) || seleccionado' ng-show='seleccionado'><ng-include src='plantilla'></ng-include>" +
                "<ng-transclude></ng-transclude></div></div>",
                controller: '@',
                name: 'controller'
            };

        });


})();
