(function () {

    'use strict';
    angular.module("mensajes", ["webServices"]).provider('mensajesConfig', _mensajesProvider).factory("Mensajes", mensajes);

    _mensajesProvider.$inject = [];
    /**
     * Provider para la configuracion de mensajes al inicio de la aplicacion
     * @param $window
     * @param WebServices
     * @private
     */
    function _mensajesProvider() {

        this.mensajes = {
            418: ['$window', 'WebServices',function ($window, WebServices) {
                $window.location.href = WebServices.sessionExpirada;
            }],
            400: "Ocurri\u00F3 un error, verifique su informaci\u00F3n",
            401: "Sin roles asociado para el servicio!!",
            403: "Sin roles asociado para el servicio!!",
            404: "El servicio no esta disponible",
            500: "Hubo un problema con el servidor, intente mas tarde",
            default : 'Hubo un problema con el servidor, intente mas tarde'
        };

        this.setMensajes = function (mensajes) {
            this.mensajes = angular.extend({}, this.mensajes, mensajes);
        };

        this.$get = function () {
            return this;
        };
    }

    mensajes.$inject = ["$window", "WebServices", "$rootScope", "$compile",'mensajesConfig','$injector'];

    function mensajes($window, WebServices, $rootScope, $compile,mensajesConfig,$injector) {
        var scope = $rootScope.$new();
        scope.cerrarModal = function () {
            _eliminarResiduosMensajes();
            if (scope.accionCerrar) {
                scope.accionCerrar();
            }
        };

        scope.mostrarDescripcion = function () {
            if(!scope.errorLog) {
                return;
            }
            console.log(scope.errorLog);

            var errorWd = window.open("about:blank", "");
            errorWd.document.write("<pre>" + scope.errorLog + "</pre>");
        };

        function mostrarModal(respuesta) {
            crearModal(respuesta);
        }

        function _eliminarResiduosMensajes() {
            var contenedorMensaje = document.getElementById('contenedorMensajeAlerta');
            if (contenedorMensaje) {
                document.body.removeChild(contenedorMensaje);
            }
        }

        function crearModal(respuesta) {
            _eliminarResiduosMensajes();
            //var colores = ["","info","warning","danger"];
            var colores = ["", "#31708f", "#8a6d3b", "#a94442", "#a94442", "#a94442"];
            var tipos = ["", "Info", "!Advertencia!", "!Error!", "!Error!", "!Error!"];
            var iconos = ["", "glyphicon glyphicon-exclamation-sign", "glyphicon glyphicon-warning-sign", "glyphicon glyphicon-remove-circle"];

            var indice = respuesta.idError;
            var mensaje = respuesta.descError;
            if(!!respuesta.errorLog) {
                scope.errorLog = respuesta.errorLog;
            } else {
                scope.errorLog = '';
            }

            var color = colores[indice];
            var tipo = tipos[indice];
            var icono = iconos[indice];
            var nombreBoton = (new Date()).getTime();
            var template = '<div class="ui-modal-wrapper fadein" id="contenedorMensajeAlerta">' +
                '<div class="ui-modal-container">' +
                '  <div class="ui-modal-header">' +
                '     <span > </span>' +
                '  </div>' +
                '<div class="ui-modal-content">' +
                '	<div class="inner-content">' +
                '	   <div style="margin:5px 10px; padding:10px; background-color:#f7f7f7; color:' + color + '; border-radius:5px;" >' +
                '			   <span class="' + icono + '" style="margin-right: 10px; " ng-click="mostrarDescripcion()"></span>' +
                '         <strong style="margin-right: 3px;">' + tipo + '</strong> ' + mensaje +
                '     </div>' +
                '	   <div class="text-right" style="margin-top:15px">' +
                '         <button ui-button="Aceptar" ng-click="cerrarModal()"  icono=""></button>' +
                '     </div>' +
                '	</div>' +
                '</div>' +
                '</div>';
            //agregar focus al buton
            var templateCompilate = $compile(template)(scope);
            angular.element(document).find('body').append(templateCompilate);

        }

        return {
            success: function (respuesta, accionCerrar) {
                if (!respuesta.idError) {
                    return;
                }
                if (respuesta.idError === 4) {
                    return ($window.location.href = WebServices.sessionExpirada);
                }
                scope.accionCerrar = accionCerrar;
                mostrarModal(respuesta);
            },
            error: function (respuesta, status, accionCerrar) {
                var tmp = mensajesConfig.mensajes[respuesta.status || status];

                var mensaje = tmp !== false ? tmp || mensajesConfig.mensajes.default: tmp;

                if(angular.isFunction(mensaje) || (angular.isArray(mensaje))){
                    mensaje = $injector(mensaje, null, {
                        datos: {
                            respuesta : respuesta
                        }
                    });
                }

                if(typeof mensaje !== 'string'){
                    /** No mostrara mensaje si no fue una cadena **/
                    return;
                }

                var contentType = angular.isFunction(respuesta.headers) ? respuesta.headers('Content-Type') : undefined;

                // Soporte para la version en Spring
                if (contentType && contentType.indexOf('application/json') >= 0) {
                    mensaje = respuesta.data && respuesta.data.descError || mensaje;
                }

                scope.accionCerrar = accionCerrar;

                if(mensaje){
                    mostrarModal({descError: mensaje, idError: 3,  errorLog: respuesta.data.errorLog});
                }

            }
        };
    }
})();
