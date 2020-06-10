/**
 * Obtener los datos de los catalogos
 * Javier Solis Guzman
 */

(function() {
    'use strict';
    angular.module('catalogos', ["webServices"]).factory('Catalogos', _catalogos).constant('CATALOGOS', {
        JUSTIFICA_OE: "JUSTIFICA_OE",
        DATOS_GESTION: "DATOS_GESTION",
        ADUANAS: "ADUANAS",
        IDENTIFICACIONES: "IDENTIFICACIONES",
        CONTENEDORES: "CONTENEDORES",
        UNIDAD_MEDIDA: "UNIDAD_MEDIDA",
        ENTIDAD_FEDE: "ENTIDAD_FEDE",
        VEHI_LIGERO: "VEHI_LIGERO",
        TIPO_COMPROBAMTE: "TIPO_COMPROBAMTE",
        PAISES: "PAISES",
        SECCIONES_ADUANA: "SECCIONES_ADUANA",
        DESGLOSE: "DESGLOSE",
        RESPFIRMA: "RESPFIRMA",
        METODOLOGIA_LDA: "METODOLOGIA_LDA",
        FRACCIONES_LDA: "FRACCIONES_LDA",
        DESTINO_REMANENTE: "DESTINO_REMANENTE",
        ANALISTAS_DEPARTAMENTO: "ANALISTAS_DEPARTAMENTO",
        CLASIFICACION_SEGUI: "CLASIFICACION_SEGUI",
        DEPARTAMENTO_LAB_ADU: "DEPARTAMENTO_LAB_ADU",
        MOTIVO_REASIG: "MOTIVO_REASIG",
        DET_GEN_OP: "DET_GEN_OP",
        EMPMENSAJERIA: "EMPMENSAJERIA"
    });
    _catalogos.$inject = ['WebServices', '$http', '$q', 'Mensajes', 'CATALOGOS'];

    function _catalogos(WebServices, $http, $q, Mensajes, URL_CATALOGOS) {
        var _catalogosCargados = {};
        var PREFIJO_URL = WebServices.catalogos;
        var CATALOGOS_SIN_CACHE = {
          ANALISTAS_DEPARTAMENTO: 'sin cache',
          RESPFIRMA: 'sin cache'
        };
        return {
            get: _obtenerDatosCatalogo,
            NOMBRES: _nombresCatalogos(),
            obtenerDescripcionCatalogo: _obtenerDescripcionCatalogo
        };

        /**
         *
         * @param {String} NombreCatalogo es el nombre del catalogo
         * @param {String} identificadorPadre Opcional, si se envia se asume que el catalogo depende de un padre por ejemplo la Seccion Aduanera
         */
        function _obtenerDatosCatalogo(NombreCatalogo, identificadorPadre) {
            if (URL_CATALOGOS.hasOwnProperty(NombreCatalogo)) { // tengo la URL solicitada
                if (_catalogosCargados.hasOwnProperty(NombreCatalogo)) {
                    var _catalogoEncontrado = _catalogosCargados[NombreCatalogo];
                    if (identificadorPadre) { // tiene un padre
                        if (_catalogoEncontrado.hasOwnProperty(identificadorPadre)) {
                            return _promesaCorrecta(angular.copy(_catalogoEncontrado[identificadorPadre]));
                        }
                    } else {
                        return _promesaCorrecta(angular.copy(_catalogoEncontrado));
                    }
                }
                /**no se tienen en los catalogos precargados */
                var urlCatalogo = PREFIJO_URL + "/"+ (URL_CATALOGOS[NombreCatalogo]);
                if ((identificadorPadre)) {
                    urlCatalogo += "/" + identificadorPadre;
                }
                return $http.get(urlCatalogo).then(function(response) {
                    var data = response.data === undefined ? response: response.data;
                    _agregarCatalogo(NombreCatalogo, identificadorPadre, data);
                    return data;
                }, _manejarError);
            } else {
                return $q(function(resolve, reject) {
                    reject({ data: { msge: "No existe el catalogo seleccionado" } });
                });
            }
        }
        /**
         * Metodo para guardar los catalogos ya solicitados
         * @param {String} NombreCatalogo
         * @param {String} identificadorPadre
         * @param {Array} datosCatalogo
         */
        function _agregarCatalogo(NombreCatalogo, identificadorPadre, datosCatalogo) {
            if(CATALOGOS_SIN_CACHE.hasOwnProperty(NombreCatalogo)){
              return;
            }
            if (identificadorPadre) {
                if (!_catalogosCargados.hasOwnProperty(NombreCatalogo)) {
                    _catalogosCargados[NombreCatalogo] = {};
                }
                _catalogosCargados[NombreCatalogo][identificadorPadre] = datosCatalogo;
            } else {
                _catalogosCargados[NombreCatalogo] = datosCatalogo;
            }
        }

        function _promesaCorrecta(respuesta) {
            return $q(function(resolve, reject) {
                resolve(respuesta);
            });
        }

        /**
         * Manejar los errores
         * @param {$http} response
         */
        function _manejarError(response) {
            _mostrarError(response);
            return _promesaCorrecta([]);
        }

        function _nombresCatalogos() {
            var nombres = {};
            for (var nombre in URL_CATALOGOS) {
                if (URL_CATALOGOS.hasOwnProperty(nombre)) {
                    nombres[nombre] = nombre;
                }
            }
            return nombres;
        }
        /**
         * Obtener la descripcion de un catalogo
         * @param {Array} datosCatalogo
         * @param {string} claveBuscada
         */
        function _obtenerDescripcionCatalogo(datosCatalogo, claveBuscada) {
            var descripcion = "";
            datosCatalogo.forEach(function (element) {
                if (element.claveCatalogo === claveBuscada) {
                    descripcion = element.descripcionCatalogo;
                }
            }, this);
            return descripcion;
        }
        /**
         *  Mostrar mensaje de error
         * @param response
         */
        function _mostrarError(response){
          if (response.data && response.data.hasOwnProperty('msge')) {
              Mensajes.success({ idError: 3, descError: response.data.msge });
              return ;
          }
          Mensajes.error(response);
        }
    }
})();
