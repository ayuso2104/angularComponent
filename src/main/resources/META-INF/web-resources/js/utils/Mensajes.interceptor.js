(function () {
    'use strict';

    angular.module('ac.interceptors', []).factory('MensajesInterceptor', _interceptor).provider('MensajesInterceptorConfig', _mensajesInterceptorConfig);

    _interceptor.$inject = ['$injector', '$q','MensajesInterceptorConfig'];

    function _interceptor($injector, $q,MensajesInterceptorConfig) {
        return {
            response: function (response) {
                var defer = $q.defer();
                var configuracion = _getConfiguracion(response,MensajesInterceptorConfig);

                if (!configuracion.isJson || !configuracion.isInterceptorActivado) {
                    return response;
                }

                var contenidoRespuesta = configuracion.data;
                if (!contenidoRespuesta || !contenidoRespuesta.msge) {
                    return contenidoRespuesta;
                }

                var Mensajes = $injector.get('Mensajes');
                var callback = configuracion.isEsperarConfirmacionActivado ? defer.resolve : angular.noop;

                Mensajes.success({
                    idError: 1,
                    descError: contenidoRespuesta.msge
                }, function () {
                    delete contenidoRespuesta.msge;
                    callback(contenidoRespuesta);
                });

                if (!configuracion.isEsperarConfirmacionActivado) {
                    defer.resolve(contenidoRespuesta);
                }

                return defer.promise;

            }, responseError: function (responseError) {
                var defer = $q.defer();
                var configuracion = _getConfiguracion(responseError,MensajesInterceptorConfig);

                var data = configuracion.data;

                if (!configuracion.isJson || !configuracion.isInterceptorActivado) {
                    return $q.reject(responseError);
                }
                var Mensajes = $injector.get('Mensajes');

                var callback = configuracion.isEsperarConfirmacionActivado ? defer.reject : angular.noop;

                if (data && data.msge) {
                    Mensajes.success({idError: 3, descError: data.msge}, function () {
                        callback(data);
                    });
                } else {
                    Mensajes.error(responseError, null, function () {
                        callback(data);
                    });
                }

                if (!configuracion.isEsperarConfirmacionActivado) {
                    defer.reject(data);
                }

                return defer.promise;
            }
        };


        function _getConfiguracion(respuesta, defaultOpts) {
            var interceptor = respuesta.config.interceptor;
            var esperarConfirmacion = respuesta.config.esperarConfirmacion;
            var configuracion = {};
            configuracion.data = respuesta.data;

            var contentType = respuesta.headers('Content-type') || '';
            configuracion.isJson = (contentType.indexOf('application/json') > -1);

            configuracion.isInterceptorActivado = (angular.isDefined(interceptor) && interceptor !== null) ? interceptor : defaultOpts.interceptor;
            configuracion.isEsperarConfirmacionActivado = (angular.isDefined(esperarConfirmacion) && interceptor !== null) ? esperarConfirmacion : defaultOpts.esperarConfirmacion;

            return configuracion;
        }
    }

    _mensajesInterceptorConfig.$inject = [];

    function _mensajesInterceptorConfig(){
        this.interceptor = true;
        this.esperarConfirmacion = true;

        this.$get = function (){
            return this;
        };

    }
})();