;
(function () {

    angular.module("httpInterceptor", []).factory("HttpInterceptor", HttpInterceptor);

    HttpInterceptor.$inject = ["$log", "$q", "$injector"];

    function HttpInterceptor($log, $q, $injector) {

        return {
            request: _interceptorRequest,
            requestError: _interceptorRequestError,
            response: _interceptorResponse,
            responseError: _interceptorResponseError
        };

        function _interceptorRequest(config) {
            $log.info("Petición realizada: " + config.url);
            return config;
        }

        function _interceptorResponse(response) {
            $log.info("Se obtuvo la respuesta");
            _procesarWarn(response);
            return response;
        }

        function _interceptorRequestError(rejection) {
            var defer = $q.defer();
            $log.info("Al realizar la petición ocurrió un error");
            _processError(rejection);
            defer.reject(rejection);
            return defer.promise;
        }

        function _interceptorResponseError(rejection) {
            var defer = $q.defer();
            $log.info("Ocurrió un error al obtener la respuesta");
            _processError(rejection);
            defer.reject(rejection);
            return defer.promise;
        }
        
        function _procesarWarn(response) {
            if(response.headers) {
                var warn = response.headers()['warn'];
                if(warn) {
                    var Mensajes = $injector.get("Mensajes");
                    return Mensajes.success({
                        idError: 2,
                        descError: warn
                    });
                }
            }
        }

        function _processError(err) {
            var Mensajes = $injector.get("Mensajes");

            if (err.status === 404) {
                return Mensajes.success({
                    idError: 3,
                    descError: "No se encontró el servicio solicitado"
                });
            }

            if (err.status >= 400 && err.status <= 599) {

                if (err.headers("content-type") && err.headers("content-type").toLowerCase().contains("json")) {
                    return Mensajes.success({
                        idError: 3,
                        descError: err.data.mensaje,
                        errorLog: err.data.detalle
                    });

                }

                return Mensajes.success({
                    idError: 3,
                    descError: "Ocurrió un error en el servidor"
                });
            }
        }

    }

})();