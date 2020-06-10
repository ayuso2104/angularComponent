(function () {
    'use strict';
    String.prototype.replaceAll = function (search, replacement) {
        var target = this;
        return target.split(search).join(replacement);
    };

    angular.module('ac.archivos', []).factory('ArchivosUtils', _utils);

    _utils.$inject = [];

    function _utils() {
        return {
            blobToFile: _blobToFile,
            descargarArchivo: _descargarArchivo,
            descargarArrayBuffer: _descargarArrayBuffer,
            makeQueryParams: _makeQueryParams,
            jsonToForm: _jsonToForm
        };

        /**
         * Convierte un bloob en un archivo para asignar el nombre
         * @param blob
         * @param fileName
         * @returns {*}
         * @private
         */
        function _blobToFile(blob, fileName) {
            var f = blob;
            f.lastModifiedDate = new Date();
            f.name = fileName;
            return f;
        }

        /**
         * Descarga un arreglo de bytes a un archivo específico
         * @param properties Objeto acon las propiedades para descargar el arrchivo
         */
        function _descargarArrayBuffer(properties) {
            var defaultProperties = {
                defaultName: 'download',
                contentDisposition: '',
                type: 'application/pdf'
            };
            properties = angular.extend(defaultProperties, properties);
            if (!(properties.buffer instanceof ArrayBuffer)) {
                throw Error('El elemento buffer no es un Arreglo de Bytes');
            }
            var nombreArchivo = properties.contentDisposition ?
                properties.contentDisposition.replace('attachment; filename=', '') : properties.defaultName;
            var blob = new Blob([properties.buffer], {type: properties.type});
            _descargarArchivo(_blobToFile(blob, nombreArchivo));

        }

        /**
         * Descarga un objeto
         * @param archivo
         * @private
         */
        function _descargarArchivo(archivo) {
            var ruta_local = URL.createObjectURL(archivo);
            if (navigator.appVersion.toString().indexOf('.NET') > 0) { // for IE browser
                return window.navigator.msSaveBlob(archivo, archivo.name);
            }
            var link = document.createElement('a');
            link.setAttribute('href', ruta_local);
            link.setAttribute('download', archivo.name);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }

        /**
         * Convierte el contenido de un objeto en query param
         * @param params
         * @returns {string}
         * @private
         */
        function _makeQueryParams(params) {
            var urlParams = [];
            for (var param in params) {
                if (params.hasOwnProperty(param) && params[param]) {
                    urlParams.push(param + '=' + params[param]);
                }
            }
            return urlParams.length ? '?' + urlParams.join('&') : '';
        }

        /**
         * Convierte el json a un formulario
         * @param datos
         * @returns {*}
         * @private
         */
        function _jsonToForm(datos) {
            var data = new FormData();
            for (var el in datos) {
                if (datos.hasOwnProperty(el)) {
                    data.append(el, datos[el]);
                }
            }
            return data;
        }
    }

})();