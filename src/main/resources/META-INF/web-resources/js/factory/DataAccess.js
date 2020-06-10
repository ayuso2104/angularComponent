(function () {
    'use strict';

    angular.module("dataAccessModule", ["mensajes"]).factory("DataAccess", DataAccess);

    DataAccess.$inject = ["Mensajes", "$http", "$q"];

    function DataAccess(Mensajes, $http, $q) {
        return {
            obtenerDatos: _obtenerDatos,
            obtenerDatosEnvio: _obtenerDatosEnvio
        };

        function _obtenerDatos(url) {
            return $q(function (done, reject) {
                $http.get(url).then(function (res) {
                    if (res.data && res.data.idError) {
                        Mensajes.success(res.data);
                    }
                    if (res.data.idError !== undefined && res.data.idError !== 3) {
                        return done(res.data.objRespuesta);
                    }
                    reject(res.data);
                }, function (err) {
                    Mensajes.error(err);
                    reject(err);
                });
            });
        }

        function _obtenerDatosEnvio(url, datos) {
            return $q(function (done, reject) {
                $http.post(url, datos).then(function (res) {
                    if (res.data && res.data.idError) {
                        Mensajes.success(res.data);
                    }
                    if (res.data.idError !== undefined && res.data.idError !== 3) {
                        return done(res.data.objRespuesta);
                    }
                    reject(res.data);
                }, function (err) {
                    Mensajes.error(err);
                    reject(err);
                });
            });
        }
    }
})();