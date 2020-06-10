(function () {
    'use strict';
    angular.module('firmaElectronica', []).directive('firmaElectronica', _firmaElectronica);

    _firmaElectronica.$inject = ['uiModal', 'Mensajes', '$filter'];

    function _firmaElectronica(uiModal, Mensajes, $filter) {
        return{
            scope: {
                url: '=',
                opcion: '=',
            },
            template: '<ui-modal nombre="modalFirmaElectronica" tamanio="lg" titulo="{{\'firmaElectronica.titulo\' | translate}}"> <div class="widget "> <div> <div class="row" id="FRAME"> <iframe id="iframeEFirma" name="firmaElectronica" height="790px" width="100%"></iframe> </div></div></div></ui-modal>',
            link: _link
        };

        function _link(scope, element, attrs) {
            var ID_CONTENEDOR_FRAME = "widget-otp-fiel-container";
            console.info('[Firma electronica] Cargando directiva');
            var MODALFIRMAELECTRONICA = 'modalFirmaElectronica';
            //https://ptscdev.siat.sat.gob.mx/PTSC/WidgetOtpFiel/restServices/widget.otp.fiel.sat-1.0.js
            //ELSA750404N12
            var CONTENIDO;
            var rfcUsuarioSession = scope.rfc;
            var cadena_original = scope.cadenaOriginal;
            if (!scope.url || !scope.opcion) {
                throw Error('No se encuentran el o los elementos url: ' + scope.url + ' opcion: ' + scope.opcion);
            }
            _cargarComponenteFirma();

            function _getIframe() {
                var iframe = document.getElementById("iframeEFirma");
                if (!iframe) {
                    console.error('necesita importar la directiva <firma-electronica url="vm.url" opcion="1" ></firma-electronica>');
                    return undefined;
                }
                return iframe;
            }
            function _cargarComponenteFirma() {
                console.log("cargando el contenido del componente firma");
                if ((typeof scope.url !== "string") && scope.url.then) {
                    scope.url.then(function (url) {
                        CONTENIDO = '<html><head><script src="./resources/lib/jquery-1.6.4.min.js" ></script><script src="' + url + '"></script></head><body><div id="widget-otp-fiel-container" data-opcion="' + scope.opcion + '" data-rfc="' + scope.rfc + '"></div></body></html>';
                    });
                } else {
                    CONTENIDO = '<html><head><script src="./resources/lib/jquery-1.6.4.min.js" ></script><script src="' + scope.url + '"></script></head><body><div id="widget-otp-fiel-container" data-opcion="' + scope.opcion + '" data-rfc="' + scope.rfc + '"></div></body></html>';
                }
            }

            function _agregarEventoClick(iframe) {
                iframe.onload = function () {
                    this.contentWindow.btnEnviarFIELOnClick = _click;
                };
                function _click() {
                    console.log('-- btnEnviarFIELOnClick --');
                    iframe.contentWindow.generaFirmaIndividual(cadena_original, {
                        validarRFCSession: rfcUsuarioSession
                    },
                            function (error, resultado) {
                                if (error && error !== 0) {
                                    console.log("Rfc enviado: " + rfcUsuarioSession);
                                    console.log("Error: " + iframe.contentWindow.catalogoErrores[error]
                                            .msg_vista, error);
                                    // Mostrar error al usuario.
                                    Mensajes.success({
                                        idError: 3,
                                        descError: iframe.contentWindow.catalogoErrores[error].msg_vista
                                    });
                                } else {
                                    if (resultado.length === 1) {
                                        console.log(resultado[0]);
                                        /*alert("Se firmó correctamente." +
                                         "\n\ncadena original generada: \n" + resultado[0].cadenaOriginalGenerada +
                                         "\n\nfirma: \n" + resultado[0].firmaDigital);*/
                                        _cerrar({firma: resultado[0]});
                                    }else{
                                        console.log(resultado);
                                        _cerrar({firma: resultado});
                                    }
                                }
                            });
                }
            }

            /** Reescribir el contenido */
            function _agregarComponenteModal() {
                var iframe = _getIframe();
                _agregarEventoClick(iframe);

	            iframe.contentWindow.document.open();
	            iframe.contentWindow.document.write(CONTENIDO);
	            iframe.contentWindow.document.close();
	        }
			function _eliminarContenidoFirma(){
				var iframe = _getIframe();
				var contenedor = iframe.contentWindow.document.getElementById(ID_CONTENEDOR_FRAME);
				if(contenedor.remove) {
					contenedor.remove();
                }
			}
	        
			uiModal.onOpen(MODALFIRMAELECTRONICA, _inicio);
            uiModal.onClose(MODALFIRMAELECTRONICA, _eliminarContenidoFirma);

            function _inicio() {
                _agregarComponenteModal();
                rfcUsuarioSession = uiModal.get('firmaElectronica.rfc');
                cadena_original = uiModal.get('firmaElectronica.cadenaOriginal');
            }

            function _cerrar(firma) {
                uiModal.set('firmaElectronica.firma', firma);
                uiModal.cerrar(MODALFIRMAELECTRONICA);
            }
        }
    }

    angular.module('firmaElectronica').factory('Efirma', _firmaElectronicaFactory);

    _firmaElectronicaFactory.$inject = ['uiModal', '$q'];

    function _firmaElectronicaFactory(uiModal, $q) {

        var MODALFIRMAELECTRONICA = 'modalFirmaElectronica';

        return{
            firmar: _firmar,
            firmarMasivo: _firmarMasivo
        };

        function _firmar(rfc, cadenaOriginal) {

            var defer = $q.defer();

            uiModal.set('firmaElectronica.rfc', rfc);
            uiModal.set('firmaElectronica.cadenaOriginal', [cadenaOriginal]);
            var promise = uiModal.abrir(MODALFIRMAELECTRONICA);

            promise.then(function () {
                var resultado = uiModal.get('firmaElectronica.firma');
                uiModal.set('firmaElectronica.firma', null);
                if (resultado.error) {
                    defer.reject(resultado.error);
                } else {
                    defer.resolve(resultado.firma);
                }
            }, function () {
                defer.reject({error: 'Error al cerrar el modal'});
            });


            return defer.promise;
        }

        function _firmarMasivo(rfc, arraycadenaOriginal) {

            var defer = $q.defer();
            uiModal.set('firmaElectronica.rfc', rfc);
            uiModal.set('firmaElectronica.cadenaOriginal', _arrayCadenaOrginal(arraycadenaOriginal));
            var promise = uiModal.abrir(MODALFIRMAELECTRONICA);

            promise.then(function () {
                var resultado = uiModal.get('firmaElectronica.firma');
                uiModal.set('firmaElectronica.firma', null);
                if (resultado.error) {
                    defer.reject(resultado.error);
                } else {
                    defer.resolve(resultado.firma);
                }
            }, function () {
                defer.reject({error: 'Error al cerrar el modal'});
            });


            return defer.promise;
        }
        function _arrayCadenaOrginal(datos)
        {
            var cadsORG = [];
            for (var i = 0; i < datos.length; i++) {
                cadsORG.push({cadenaOriginal: datos[i]});
            }
            return cadsORG;
        }
    }

})();