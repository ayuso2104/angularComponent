(function () {
    'use strict';
    angular.module("uiArchivosModule", ["primeModule"]);


    angular.module("uiArchivosModule").directive("uiArchivos", uiArchivosDirective);
    angular.module("uiArchivosModule").factory("uiArchivos", uiArchivos);

    uiArchivos.$inject = ['$parse'];

    function uiArchivosDirective($parse) {

        return {
            scope: {
                modelo: "=modelo",
                carga: "=?carga"
            },
            link: function (scope, element, attrs) {
                scope.modeloArchivos = scope.modelo;

                scope.botones = {
                    seleccionar: {
                        activo: true
                    },
                    cargar: {
                        activo: false
                    },
                    cancelar: {
                        activo: false
                    }
                };

                function limpiarInput() {
                    var input = document.getElementById("files-" + scope.$id);
                    if(input) {
                        input.value = '';
                    }
                }

                var input = angular.element(element.children().children().children()[0])[0];
                scope.files = [];
                scope.tiposPermitidos = scope.modeloArchivos.tiposPermitidos();
                scope.tamanioMaximo = scope.modeloArchivos.tamanioMaximo();
                scope.errores = [];
                scope.maxArchivos = scope.modeloArchivos.maxArchivos();
                //scope.modelo.setArchivos([]);
                //scope.files = scope.modelo._archivos;

                scope.modeloArchivos.limpiar = function () {
                    scope.files = [];
                    scope.modeloArchivos.setArchivos([]);
                };

                scope.seleccionarArchivo = function () {
                    input.click();
                };
                scope.cancelar = function () {
                    scope.files = [];
                    scope.modeloArchivos.setArchivos([]);
                    scope.botones.seleccionar.activo = true;
                    scope.botones.cargar.activo = false;
                    if (scope.modeloArchivos.onCancelar) {
                        scope.modeloArchivos.onCancelar();
                    }
                    limpiarInput();
                };

                scope.configuration_ui_archivos = {bloqueo: false};
                scope.modelo.bloquear = function () {
                    scope.configuration_ui_archivos.bloqueo = true;
                };
                scope.modelo.desbloquear = function () {
                    scope.configuration_ui_archivos.bloqueo = false;
                };
                scope.eliminarArchivo = function (file) {
                    scope.files.splice(scope.files.indexOf(file), 1);
                };

                scope.enviar = function () {
                    scope.modeloArchivos.EjecutarEnviar(scope.files);
                };
                input.addEventListener('change', function (evt) {
                    scope.errores = [];//
                    var files = evt.target.files;
                    if ((scope.files.length + files.length) > scope.modeloArchivos.maxArchivos()) {
                        //console.error("Intenta agregar mas de los archivos permitido");
                        scope.modeloArchivos.onArchivoInvalidoMaxArchivos(files);
                        scope.$apply();
                        limpiarInput();
                        return;
                    }
                    angular.forEach(files, function (file, index) {
                        if (!_validarTamanio(file, scope.modeloArchivos.tamanioMaximo())) {
                            //console.error("El archivo: "+file.name+" es mas grande de lo permitido")
                            scope.modeloArchivos.onArchivoInvalidoTamanioMaximo(file);
                        } else {
                            if (_tipoValido(scope.tiposPermitidos, file)) {
                                if(scope.files.map(function(it){ return it.name; }).indexOf(file.name) === -1) {
                                    scope.files.push(file);
                                    scope.modeloArchivos.onArchivoValido(file);
                                } else {
                                    scope.modeloArchivos.onArchivoRepetido(file);
                                }
                            } else {
                                //console.error("El tipo de archivo: "+file.name+" no es permitido");
                                scope.modeloArchivos.onArchivoInvalidoTipo(file);
                            }
                        }
                    });
                    if (scope.files.length === 0) {
                        limpiarInput();
                        return scope.$apply();
                    } // no hay archivos validos que obtener
                    if (scope.files.length === scope.maxArchivos) {
                        scope.botones.seleccionar.activo = false;
                    }

                    scope.botones.cargar.activo = true;
                    scope.botones.cancelar.activo = true;
                    /*Metodo para obtener el contenido del archivo*/

                    angular.forEach(scope.files, function (file, index) {
                        var reader = new FileReader();
                        reader.onload = (function (theFile, i, files) {
                            return function (e) {
                            	files[i].archivo = e.target;
                            	scope.$apply(function(){
                            		scope.modeloArchivos.setArchivos(files);
                            	});
                            };
                        })(file, index, scope.files);
                        reader.readAsDataURL(file);
                    });

                    limpiarInput();

                });

                function _validarTamanio(file, tamanioMaximo) {
                    return file.size < tamanioMaximo;
                }

                function _tipoValido(tiposPermitidos, file) {
                    var l = tiposPermitidos.length;
                    var tipo = file.type;
                    for (var i = 0; i < l; i++) {
                        if (tiposPermitidos[i] === tipo) {
                            return true;
                        }
                    }
                    return false;
                }

            },
            template: '<div class="ui-archivos"> <div class="ui-archivos-header"> <input type="file" class="ui-archivos-file-reader" name="file" id="files-{{ $id }}" multiple="true"/> <button type="button" ui-button="Selecciona" icono="ui-icon-plusthick" ng-disabled="configuration_ui_archivos.bloqueo || files.length>=modeloArchivos.maxArchivos()" ng-click="seleccionarArchivo()"></button> <button type="button" ui-button="Cargar Archivos" ng-if="carga" icono="ui-icon-arrowreturnthick-1-n" ng-disabled="configuration_ui_archivos.bloqueo || files.length == 0" ng-click="enviar()"></button> <button type="button" ui-button="Cancelar" icono="ui-icon-cancel" ng-disabled="configuration_ui_archivos.bloqueo || files.length == 0" ng-click="cancelar()"></button> </div> <div class="ui-archivos-content"> <div> <div ng-repeat="error in errores track by $index" class="error"> <!--<span style="color:red" class="ui-button-icon-left ui-icon ui-c ui-icon-closethick" ng-if="icono"></span>--> <!--<span style="color:red" class="ui-button-icon-left ui-icon-closethick"></span>--> {{error}} </div> </div><div class="contenedorImagenes" ng-repeat="file in files track by $index"> <span class="ui-icon ui-icon-closethick eliminar-btn" ng-click="eliminarArchivo(file)" ng-if="!configuration_ui_archivos.bloqueo"></span> <img ng-if="file.type.substring(0,5) === \'image\' && file.archivo.result " class="thumb" ng-src="{{file.archivo.result}}" > <img ng-if="file.type === \'application/pdf\' " class="thumb" src="recurso/images/iconos/pdf-mediano.png" > <img ng-if="file.type === \'application/msword\' " class="thumb" src="recurso/images/iconos/word.png" > <span class="nombreAarchivo">{{file.name}} ({{ (file.size / 1024) / 1024 | number: 2}} MB)</span> </div> </div> </div>'
        };

    }


    uiArchivos.$inject = [];

    function uiArchivos() {
        var uiArchivosFactory = function () {
            var self = {};
            self._archivos = [];
            self._enviar = function () {
            };
            self.onArchivoValido = function () {
            };
            self.onArchivoInvalidoTamanioMaximo = function () {
            };
            self.onArchivoInvalidoMaxArchivos = function () {
            };
            self.onArchivoInvalidoTipo = function () {
            };
            self.onArchivoRepetido = function () {
            };
            self._tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/msword', 'application/pdf'];
            self._tamanioMaximo = 500000;
            self._maxArchivos = 15;
            self.EjecutarEnviar = function (fn) {
                self._enviar(self._archivos);
            };
            self.tamanioMaximo = function (tamanioMaximo) {
                if (tamanioMaximo !== undefined) {
                    return (self._tamanioMaximo = tamanioMaximo);
                }
                return self._tamanioMaximo;
            };
            self.maxArchivos = function (maxArchivos) {
                if (maxArchivos !== undefined) {
                    return (self._maxArchivos = maxArchivos);
                }
                return self._maxArchivos;
            };
            self.setEnviar = function (fn) {
                if (fn) {
                    self._enviar = fn;
                }
            };
            self.setArchivos = function (archivos) {
                if (archivos) {
                    self._archivos = archivos;
                }
            };

            self.getArchivos = function () {
                return self._archivos;
            };
            self.tiposPermitidos = function (tiposPermitidos) {
                if (tiposPermitidos !== undefined) {
                    self._tiposPermitidos = tiposPermitidos;
                }
                return self._tiposPermitidos;
            };


            return self;
        };
        return uiArchivosFactory;
    }


})();
