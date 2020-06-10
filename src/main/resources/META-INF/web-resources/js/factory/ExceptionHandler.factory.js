/**
 *   Rub&eacute;n Guzm&aacute;n G&oacute;mez
 *   ruben.guzman@softtek.com
 *   on 18/08/2017.
 */
(function () {
    "use strict";
    angular.module('ac.exceptionHandler', [])
        .factory('$exceptionHandler', ['$log', '$injector', 'exceptionHandlerConfig', function ($log, $injector, exceptionHandlerConfig) {
            return function myExceptionHandler(exception, cause) {
                if (!exceptionHandlerConfig.log) {
                    $log.warn('No se ha configurado el logueo de errores');
                } else {
                    $injector.invoke(exceptionHandlerConfig.log, null, {
                        exception: exception,
                        cause: cause
                    });
                }
                $log.error(exception, cause);
            };
        }]).provider('exceptionHandlerConfig', [function () {
            this.log = null;

            this.$get = function () {
                return this;
            };
    }]);

})
();