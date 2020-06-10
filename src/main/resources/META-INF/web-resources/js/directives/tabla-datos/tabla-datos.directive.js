/**
 * Refactorizado el 27 del 07 
 * se trato de eliminar metodos duplicados y solo
 * exponer los metodos que eran necesarios
 * 
 * la directiva contiene las siguiente propiedades por medio de attrs html, ademas de las 
 * proporcionadas por el Modelo de la tabla
 * 
 *  noSeleccionable
 *      true para indicar que la tabla no servira para seleccionar --default es false
 * 
 *  mostrarSelector
 *      crea una columna con un check para cada fila-- default false
 *  
 *  multiseleccionable
 *      indica si se podran seleccionar mas de un registro de la tabla. -- default false
 * nombreSelector 
 *      si la tabla es multiseleccionable en el check padre se mostrara el titulo indicado -- default ''
 *
 * mensaje 
 *      leyenda que muestra la tabla al no tener datos -- default 'No se encontraron coincidencias'
 *
 *  combinada
 *      NO SE PARA QUE SIRVE
 * 
 */
(function () {
    'use strict';
    angular.module("tablaDatosModule", ["ngTable", "bindHtml"])
            .directive("tabDatos", tabDatos)
            .factory("ModeloTabla", ModeloTabla)
            .filter("sanitize", ['$sce', function ($sce) {
                    return function (htmlCode) {
                        return $sce.trustAsHtml(htmlCode);
                    };
                }]);

    tabDatos.$inject = ["NgTableParams", "$filter", "$q"];
    function tabDatos(NgTableParams, $filter, $q) {
        function link(scope, element, attrs) {
            scope.identificador = scope.$id;
            var datosTabla = []; // todos los datos de la tabla
            var datosFiltrados = []; // datos con filtros aplicados
            var datosEnPaginaActual = [];// datos visibles en la pagina
            var eventoInterno = false;
            _init();

            function ajustarFija() {
                element[0].querySelector(".table-responsive").scrollLeft = 0;
                var elCabeceras = Array.from(element[0].querySelectorAll("th"));
                var cabeceraMasAlta = elCabeceras.reduce(function (elActual, elSiguiente) {
                    return elActual.clientHeigth > elSiguiente.clientHeigth ? elActual : elSiguiente;
                });
                var columnasFijas = Array.from(element[0].querySelectorAll("th.columna-fija"));
                columnasFijas.forEach(function (it, index) {
                    it.style.height = (cabeceraMasAlta.clientHeight + 2) + "px";
                    
                    var input = it.querySelector(".input-filter");
                    input.style.width = "100px";
                    
                    var hayFake = element[0].querySelector(".td-col-fake") !== null;
                    
                    if (index === columnasFijas.length - 1 && !hayFake) {
                        for (var i = 0; i < columnasFijas.length; i++) {
                            it.insertAdjacentHTML("afterend", "<th class='td-col-fake'></th>");
                        }
                    }
                });
                
                var columnasNoFijas = Array.from(element[0].querySelectorAll("th.columna-no-fija"));
                
                var tamanioRestante = element[0].querySelector(".table-responsive").clientWidth - 122;
                
                var tamanioColumna = tamanioRestante / columnasNoFijas.length;
                tamanioColumna = tamanioColumna > 120 ? tamanioColumna: 120;
                
                columnasNoFijas.forEach(function (col) {
                    col.style.setProperty("width", tamanioColumna + "px", "important");
                });

                var filas = Array.from(element[0].querySelectorAll("tbody tr"));
                filas.forEach(function (fila) {
                    var elDatas = Array.from(fila.querySelectorAll("td"));

                    var dataMasAlto = elDatas.reduce(function (elActual, elSiguiente) {
                        return elActual.clientHeight > elSiguiente.clientHeight ? elActual : elSiguiente;
                    });

                    var filasFijas = Array.from(fila.querySelectorAll("td.fila-fija"));

                    filasFijas.forEach(function (filaFija, index) {
                        filaFija.style.height = (dataMasAlto.clientHeight + 2) + "px";

                        var hayFijas = element[0].querySelector(".td-fil-fake") !== null;

                        if (index === filasFijas.length - 1 && !hayFijas) {
                            for (var i = 0; i < filasFijas.length; i++) {
                                filaFija.insertAdjacentHTML("afterend", "<td class='td-fil-fake'></td>");
                            }
                        }
                    });
                });
            }
            ;

            function esperar(fn) {
                var RELEASE = 100;
                var defer = $q.defer();
                var interval;
                var i = 0;

                interval = setInterval(function () {
                    console.log("Esperando...");
                    if (fn()) {
                        console.log("Ejecutando tabla");
                        defer.resolve();
                        clearInterval(interval);
                    } else {
                        if (i > RELEASE) {
                            console.log("Error al ejecutar");
                            defer.reject();
                            clearInterval(interval);
                        }
                    }
                    i++;
                }, 100);

                return defer.promise;
            }

            attrs.$observe('mensaje', function (mensaje) {
                scope.config.mensaje = mensaje || "No se encontraron coincidencias";
            });
            function _init() {
                _cargarConfiguracionesTabla();
                _cargarColumnasCombinadas();// columnas modificadas
                _refrescarDatos();
            }

            /**funciones que llama el template */
            scope.cambiar_linea = _clickEnFila;
            scope.isBloqueada = _evaluarBloqueo;
            scope.ejecutarAccionDato = _ejecutarAccionDato;
            scope.cargarClase = _cargarClaseRow;
            scope.cambiarPagina = _irApagina;
            scope.cambiarFilasPorPagina = _cambiarNumeroDeFilasPorPagina;
            scope.cambioCheckPadre = _cambioCheckPadre;
            scope.detenerPropagation = _detenerPropagation;
            scope.ordenar = _clickOrdenar;
            scope.cambioCheckFila = _cambioDesdeCheckFila;
            scope.cerrarMenus = _cerrarMenusAbiertos;

            function _evaluarBloqueo(fila) {
                var resultado = scope.modeloTabla.isBloqueada(fila);
                if (resultado) {
                    scope.modeloTabla.click(fila);
                }
                return resultado;
            }


            function _cargarConfiguracionesTabla() {
                scope.orden = [];
                scope.modeloTabla = scope.modelo;
                scope.menuDerecho = scope.modeloTabla.menuDerecho ? scope.modeloTabla.menuDerecho() : {};
                scope.noSeleccionable = (attrs.noSeleccionable === 'true');// si la bandera es true no podra modificar nada
                scope.columnas = scope.modeloTabla.columnas();
                scope.modeloTabla.bloquear = function () {
                    scope.config.bloqueada = true;
                    if (scope.menuDerecho && scope.menuDerecho.bloquear) {
                        scope.menuDerecho.bloquear();
                    }
                };
                scope.modeloTabla.desbloquear = function () {
                    scope.config.bloqueada = false;
                    if (scope.menuDerecho && scope.menuDerecho.desbloquear) {
                        scope.menuDerecho.desbloquear();
                    }
                };
                scope.config = {
                    tieneSelectores: scope.$eval(attrs.mostrarSelector),
                    multiSeleccionable: scope.$eval(attrs.multiseleccionable),
                    btnDerecho: scope.$eval(attrs.btnderecho),
                    checks: {checked: false},
                    nombreSelector: attrs.nombreselector,
                    mensaje: attrs.mensaje || "No se encontraron coincidencias",
                    combinada: scope.$eval(attrs.combinada),
                    bloqueada: false,
                    fijas: attrs.fijas ? scope.$eval(attrs.fijas) : 0
                };
                if (scope.$eval(attrs.buscadora)) {
                    throw new Error("borrado en la refactorizacion al parecer nadie lo ocupaba");
                }

                if (scope.config.fijas) {
                    scope.rangoFijas = [];
                    for (var i = 0; i < scope.config.fijas; i++) {
                        scope.rangoFijas.push(i);
                    }
                }

                scope.tabDatos = _crearNgTable();
                scope.counts = {
                    data: scope.modeloTabla.agrupaciones(),
                    selected: scope.modeloTabla.agrupaciones()[0]
                };
                /*cuando mande datos o quiera el reload */
                scope.modeloTabla.setRefrescar(_refrescarDatos);
                /**cuando cambia las columnas */
                scope.modeloTabla.setRecargarTabla(_init);
            }

            function _refrescarDatos() {
                _recargarDatosBusquedaOrder();
                scope.tabDatos.reload();
                _irApagina(1);
                _verificarCheckPAdre();
                if (scope.modeloTabla.getSelRegON()) {
                    _buscaSeleccionadoPag();
                }
                
                if (scope.config.fijas) {
                    window.onresize = ajustarFija;
                    
                    esperar(function () {
                        return element[0].querySelectorAll("th") && element[0].querySelectorAll("th").length;
                    }).then(ajustarFija, function () {
                        console.error("La tabla tuvo un error al cargarse");
                    });
                }
            }

            function _buscaSeleccionadoPag()
            {

                var registro = scope.modeloTabla.getSelRegRow();
                for (scope.paginaActual = 1; scope.paginaActual <= scope.totalPaginas; scope.paginaActual++) {
                    _irApagina(scope.paginaActual);
                    for (var i = 0; i < datosEnPaginaActual.length; i++) {
                        if (datosEnPaginaActual[i].folioDocumento === registro.folioDocumento) {
                            datosEnPaginaActual[i].activo = true;
                            return true;
                        }
                    }
                }
                scope.paginaActual = 1;
                _irApagina(scope.paginaActual);
                return false;
            }
            function _cargarColumnasCombinadas() {
                scope.columnas.forEach(function (columna, index) {
                    var fun_nombre = (columna.nombre === null) ? "" : columna.nombre;
                    if (typeof fun_nombre === "object") {
                        (function (columna) {
                            //el nombre de la columna se calcula
                            fun_nombre.then(function (val) {
                                columna.nombre = val;
                            });
                            if (columna.combinada) {
                                columna.combinada.then(function (val) {
                                    columna.combinada = val;
                                });
                            }
                        })(columna);
                    }
                });
            }
            function _crearNgTable() {
                return new NgTableParams({count: 5}, {
                    counts: [],
                    paginate: false,
                    total: datosTabla.length,
                    getData: function ($defer, params) {
                        _filtrarDatos(params.filter());
                        _ordenarDatos(params.orderBy());
                        params.total(datosFiltrados.length);
                        scope.modeloTabla.tabDatos(datosFiltrados);//valores que se ven en la tabla
                        scope.paginaActual = params.page();
                        var elementosPorPagina = params.count();
                        datosEnPaginaActual = datosFiltrados.slice((scope.paginaActual - 1) * elementosPorPagina, scope.paginaActual * elementosPorPagina);
                        $defer.resolve(datosEnPaginaActual);
                    },
                    paginationMaxBlocks: scope.modeloTabla.maxPaginas(),
                    paginationMinBlocks: 1,
                });
            }
            function _filtrarDatos(filtrosTabla) {
                var _filtrosActuales = _getValoresFiltroMayusculas(filtrosTabla);
                var _auxFiltro = datosTabla;
                for (var indexFiltro in _filtrosActuales) {
                    if (_filtrosActuales.hasOwnProperty(indexFiltro)) {
                        _auxFiltro = _filtrarPor(_auxFiltro, indexFiltro, _filtrosActuales[indexFiltro]);
                    }
                }
                datosFiltrados = _auxFiltro;//despues de aplicar los filtros reasigno
            }
            function _filtrarPor(datos, indexFiltro, valorBusqueda) {
                return datos.filter(function (fila) {
                    var valorFila = _getValorFiltro(fila, indexFiltro);
                    return valorFila.indexOf(valorBusqueda) !== -1;
                });
            }
            function _getValorFiltro(fila, indiceColumna) {
                var columna = scope.columnas[indiceColumna];
                if (columna.html || !fila.$$valoresTabla[scope.identificador][indiceColumna] || !fila.$$valoresTabla[scope.identificador][indiceColumna].valorFiltro) {
                    fila.$$valoresTabla[scope.identificador][indiceColumna] = {};
                    if (columna.modificador) {
                        fila.$$valoresTabla[scope.identificador][indiceColumna].valorFiltro = _convertirMayusculas(columna.modificador(fila[columna.clave], fila));
                    } else {
                        fila.$$valoresTabla[scope.identificador][indiceColumna].valorFiltro = _convertirMayusculas(fila[columna.clave]);
                    }
                }
                return fila.$$valoresTabla[scope.identificador][indiceColumna].valorFiltro;
            }

            function _getValoresFiltroMayusculas(filtrosTabla) {
                var valoresFiltros = {};
                var _cerrarMenus = false;
                for (var key in filtrosTabla) {
                    if (filtrosTabla.hasOwnProperty(key) && filtrosTabla[key] !== '') {
                        valoresFiltros[key] = _convertirMayusculas(filtrosTabla[key]);
                        _cerrarMenus = true;
                    }
                }
                return valoresFiltros;
            }
            function _ordenarDatos(orden) {
                if (orden.length > 0) {
                    var ascendente = (orden[0].substring(0, 1) === "+");
                    var indiceColumna = parseInt(orden[0].substring(1, orden[0].length));
                    var ordenarPorString = (!scope.columnas[indiceColumna].ordenarPorNumero) ? true : false;
                    datosFiltrados.sort(function (filaA, filaB) {
                        var a = _getValorOrden(filaA, indiceColumna);
                        var b = _getValorOrden(filaB, indiceColumna);
                        var resultadoComparacion;
                        if (ordenarPorString) {
                            resultadoComparacion = a.localeCompare(b);
                        } else {
                            resultadoComparacion = a - b;
                        }
                        return (ascendente) ? resultadoComparacion : (resultadoComparacion * -1);
                    });
                }
            }
            function _getValorOrden(fila, indiceColumna) {
                var columna = scope.columnas[indiceColumna];
                /** los html se calculan en el momento */
                if (columna.html || !fila.$$valoresTabla[scope.identificador][indiceColumna] || !fila.$$valoresTabla[scope.identificador][indiceColumna].valorOrden) {
                    fila.$$valoresTabla[scope.identificador][indiceColumna] = {};
                    if (columna.valorOrden) {
                        fila.$$valoresTabla[scope.identificador][indiceColumna].valorOrden = _verificarTipoOrden(columna.valorOrden(fila, fila[columna.clave]), columna);
                    } else {
                        if (columna.modificador) {
                            fila.$$valoresTabla[scope.identificador][indiceColumna].valorOrden = _verificarTipoOrden(columna.modificador(fila[columna.clave], fila), columna);
                        } else {
                            fila.$$valoresTabla[scope.identificador][indiceColumna].valorOrden = _verificarTipoOrden(fila[columna.clave], columna);
                        }
                    }
                }
                return fila.$$valoresTabla[scope.identificador][indiceColumna].valorOrden;
            }
            function _verificarTipoOrden(valor, columna) {
                if (columna.ordenarPorNumero) {
                    return (valor) ? parseFloat(valor) : 0;
                }
                return (valor) ? valor.toString() : "";
            }

            function _clickOrdenar(columnaIndice) {
                var nuevoValor = !scope.orden[columnaIndice];
                _actualizarFlechasOrdenamientoVista();
                scope.orden[columnaIndice] = nuevoValor;
                var tipoOrdenamiento = scope.tabDatos.isSortBy(columnaIndice, 'desc') ? 'asc' : 'desc';
                scope.tabDatos.sorting(columnaIndice, tipoOrdenamiento);
            }
            function _actualizarFlechasOrdenamientoVista() {
                for (var indice = 0; indice < scope.orden.length; indice++) {
                    if (scope.orden[indice]) {
                        scope.orden[indice] = undefined;
                    }
                }
            }

            function _recargarDatosBusquedaOrder() {
                datosTabla = angular.copy(scope.modeloTabla.datos());
                /* inicializando las variables que ocupo de este lado */
                datosTabla.forEach(function (fila, identificadorFila) {
                    fila.$$valoresTabla = [];
                    fila.$$valoresTabla[scope.identificador] = [];
                    fila.$$clickDerecho = _clickMenu;
                    scope.modeloTabla.datos()[identificadorFila].activo = scope.modeloTabla.datos()[identificadorFila].activo || false;
                    fila.activo = scope.modeloTabla.datos()[identificadorFila].activo;
                    fila.$$identificador = identificadorFila;
                });
            }

            function _clickMenu(evento) {
                if (scope.config.bloqueada) {
                    return;
                }
                if (!this.activo) {
                    _deseleccionarTodasLasFilasNoBloqueadas(this);
                    eventoInterno = true;
                    scope.modeloTabla.datos()[this.$$identificador].activo = true;
                    this.activo = true;
                } else {
                    if (!scope.config.multiSeleccionable) {
                        _deseleccionarTodasLasFilasNoBloqueadas(this);
                    }
                }
            }

            function _convertirMayusculas(valor) {
                if (!valor) {
                    return "";
                }
                return ((typeof valor === "string") ? valor.toUpperCase() : valor.toString());
            }

            function _ejecutarAccionDato(row, fn, $event) {
                fn(row, $event);
                _detenerPropagation($event);
            }
            function _cargarClaseRow(row) {
                if (scope.modeloTabla.cargarClase) {
                    return scope.modeloTabla.cargarClase(row);
                }
            }

            function _recargarBotonesPaginacion() {
                scope.paginaActual = scope.tabDatos.page();
                scope.totalPaginas = Math.ceil(datosFiltrados.length / scope.counts.selected);
                var numeroDePaginasMostrar = scope.totalPaginas >= scope.modeloTabla.maxPaginas() ? scope.modeloTabla.maxPaginas() : scope.totalPaginas;
                scope.buttons = {
                    paginas: [{
                            number: scope.paginaActual,
                            active: true
                        }]
                };

                var numeroPasosLaterales = 1;
                while (_noHeCompletadoNumeroPaginas(numeroDePaginasMostrar)) {
                    //a la izquierda
                    var paginaIzquierda = (scope.paginaActual - numeroPasosLaterales);
                    if (paginaIzquierda > 0) {
                        scope.buttons.paginas.unshift({
                            number: paginaIzquierda
                        });
                    }
                    //derecha
                    if (_noHeCompletadoNumeroPaginas(numeroDePaginasMostrar)) {
                        var paginaDerecha = (scope.paginaActual + numeroPasosLaterales);
                        if (paginaDerecha <= scope.totalPaginas) {
                            scope.buttons.paginas.push({
                                number: paginaDerecha
                            });
                        }
                    }
                    numeroPasosLaterales++;
                }
            }
            function _noHeCompletadoNumeroPaginas(numeroDePaginasMostrar) {
                return (scope.buttons.paginas.length < numeroDePaginasMostrar);
            }

            function _irApagina(indexPagina) {
                scope.tabDatos.page(indexPagina);
                _recargarBotonesPaginacion();
                //aca debo recargar getData
            }

            function _cambioCheckPadre() {
                if (scope.config.bloqueada) {
                    scope.config.checks.checked = !scope.config.checks.checked;
                    return;
                }
                for (var i = 0; i < datosEnPaginaActual.length; i++) {
                    if (!scope.modeloTabla.isBloqueada(datosEnPaginaActual[i]) && datosEnPaginaActual[i].activo !== scope.config.checks.checked) {
                        eventoInterno = true;
                        scope.modeloTabla.datos()[datosEnPaginaActual[i].$$identificador].activo = scope.config.checks.checked;
                        datosEnPaginaActual[i].activo = scope.config.checks.checked;
                    }
                }
                _verificarCheckPAdre();
            }

            function _detenerPropagation($event) {
                if ($event) {
                    if ($event.stopPropagation || typeof $event.stopPropagation === "function") {
                        $event.stopPropagation();
                    }
                    $event.cancelBubble = true;
                }
            }
            function _clickEnFila(row, evt) {
                _cambiarRow(row, evt);
            }

            function _cambioDesdeCheckFila(row, event) {
                row.activo = !row.activo;//lo volteamos
                if (scope.config.bloqueada || scope.modeloTabla.isBloqueada(row)) {
                    if (row) {
                        scope.modeloTabla.click(row);
                    }
                    return;
                }
                _cambiarRow(row, event, true);
            }

            function _cerrarMenusAbiertos() {
                if (document.getElementsByClassName('boton-derecho-menu-directiva show').length > 0) {
                    document.body.click();
                }
            }

            function _cambiarRow(row, evt, desdeCheck) {
                if (!row || scope.config.bloqueada || scope.config.noSeleccionable) {
                    _detenerPropagation(evt);
                    return;
                }

                if (!_mantenerSeleccionadosLosDemas(evt, desdeCheck)) {
                    _deseleccionarTodasLasFilasNoBloqueadas(row);
                }
                var nuevoValor = !row.activo;
                var valorVerdaderoModelo = row;
                if (row.$$identificador > -1) {
                    eventoInterno = true;
                    valorVerdaderoModelo = scope.modeloTabla.datos()[row.$$identificador];
                }

                valorVerdaderoModelo.activo = nuevoValor;
                scope.modeloTabla.click(valorVerdaderoModelo);
                row.activo = nuevoValor;
            }

            function _mantenerSeleccionadosLosDemas(evento, isCheck) {
                return ((isCheck) ? scope.config.multiSeleccionable : (evento && evento.ctrlKey && scope.config.multiSeleccionable));
            }

            function _deseleccionarTodasLasFilasNoBloqueadas(noCambiar) {
                scope.config.checks.checked = false;
                for (var i = 0; i < datosTabla.length; i++) {
                    if (datosTabla[i].activo && (!noCambiar || noCambiar.$$identificador !== datosTabla[i].$$identificador) && !scope.modeloTabla.isBloqueada(datosTabla[i])) {
                        eventoInterno = true;
                        scope.modeloTabla.datos()[datosTabla[i].$$identificador].activo = false;
                        datosTabla[i].activo = false;
                    }
                }
            }

            function _cambiarNumeroDeFilasPorPagina( ) {
                scope.tabDatos.count(scope.counts.selected);
                _recargarBotonesPaginacion();
            }

            //regenerar la paginacion
            scope.$watch(function () {
                return datosFiltrados.length;
            }, function (antes, ahora) {
                if (antes !== ahora) {
                    _recargarBotonesPaginacion();
                }
            });

            //cambiaron los elementos seleccionados
            if (!scope.noSeleccionable) {
                scope.$watch(function () {
                    return _getSeleccionadasModeloTabla();
                }, function (ahora, antes) {
                    if (!angular.equals(ahora, antes)) {
                        scope.modeloTabla.nuevoDato(ahora);//notificar que los elementos Seleccionados han cambiado
                        _refrescarSeleccionadosVista();
                    }
                }, true);
            }
            function _refrescarSeleccionadosVista() {
                if (eventoInterno) {
                    eventoInterno = false;
                    return;
                }
                datosTabla.forEach(function (element) {
                    if (element.activo !== scope.modeloTabla.datos()[element.$$identificador].activo) {
                        element.activo = scope.modeloTabla.datos()[element.$$identificador].activo;
                    }
                });
            }
            function _getSeleccionadasModeloTabla() {
                if (scope.noSeleccionable) {
                    return [];
                }
                return scope.modeloTabla.datos().filter(function (element) {
                    return element.activo;
                });
            }

            //_verificarCheckPagina
            if (scope.config.multiSeleccionable) {
                scope.$watch(function () {
                    return datosEnPaginaActual;
                }, function (ahora, antes) {
                    if (!angular.equals(ahora, antes)) {
                        _verificarCheckPAdre();
                    }
                }, true);
            }

            function _verificarCheckPAdre() {
                var longitud = datosEnPaginaActual.length;
                for (var i = 0; i < longitud; i++) {
                    if (!datosEnPaginaActual[i].activo) {
                        break;
                    }
                }
                scope.config.checks.checked = (longitud > 0 && i === longitud);
            }




        }

        var path = document.querySelector("meta[name='loader-path']");
        var url = path ? path.getAttribute("value") : "recurso";
        return {
            transclude: true,
            //template: '<script id="sample_ng_header" type="text/ng-template" > <tr ng-if="config.combinada"> <th class="short" ng-if="config.tieneSelectores" rowspan="2"></th> <th ng-repeat="col in columnas" rowspan="1" colspan="{{col.combinada? config.combinada: 1}}" ng-if="!col.combinable"> <span ng-if="col.combinada">{{col.combinada}}</span> </th> </tr><tr> <th class="short" ng-if="config.tieneSelectores"> <div class="checkbox-wrapper" ng-show="config.multiSeleccionable"> <input type="checkbox" ng-model="config.checks.checked"  ng-disabled="$data.length===0"  ng-change="marcar()" id="{{$id}}checkbox-interno-header"/> <label for="{{$id}}checkbox-interno-header" ><span class="ui-chkbox-icon ui-icon-black ui-icon-check"></span></label> </div></th> <th ng-repeat="column in columnas" ng-show="true" class="text-center sortable" ng-class="{\'no-filtro\': !column.filtro , \'sort-asc\': tabDatos.isSortBy(column.orden, \'desc\'), \'sort-desc\': tabDatos.isSortBy(column.orden, \'asc\'), \'short\': column.short, \'large\': column.large, \'order\': column.orden}" ng-click="column.orden && tabDatos.sorting(column.orden, tabDatos.isSortBy(column.orden, \'desc\') ? \'asc\' : \'desc\'); orden=!orden" ng-init="orden=undefined">{{column.modificadorCol ? column.modificadorCol(column.nombre): column.nombre}}<span ng-if="column.orden" ng-bind="$column.title(this)" ng-class="{\'sort-indicator\': params.settings().sortingIndicator==\'span\', \'ui-icon-carat-2-n-s\': (orden==undefined), \'ui-icon-triangle-1-n\': orden===true, \'ui-icon-triangle-1-s\': orden===false}" class="ng-binding ui-icon" ></span> <form name="form" style="margin-top:0px" ng-class="{\'no-visible\': !column.filtro}"> <div ng-if="column.filtro&&!config.buscadora"> <div ng-repeat="(name, value) in column.filtro"> <div ng-if="value.indexOf(\'/\') !==-1" ng-include="filter"></div><div ng-if="value.indexOf(\'/\')===-1" ng-init="params.filter()[name]=\'\'"> <input type="text" name="{{name}}" ng-disabled="$filterRow.disabled" ng-model="params.filter()[name]" class="input-filter form-control" placeholder="{{getFilterPlaceholderValue(filter, name)}}" ng-if="!column.mask" ng-click="detenerPropagation($event)"/> <input type="text" name="{{name}}" ng-disabled="$filterRow.disabled" ng-model="params.filter()[name]" class="input-filter form-control" placeholder="{{getFilterPlaceholderValue(filter, name)}}" ng-if="column.mask" restrict="reject" data-mask="{{column.mask}}" ng-click="detenerPropagation($event)"/> </div></div></div><div ng-if="column.filtro&&config.buscadora" > <div ng-repeat="(name, value) in column.filtro"> <div ng-init="params.filter()[name]=\'\'"> <div ng-if="name==\'claveTI\'" ng-init="datas[name]=\'TI\'"></div><input type="text" class="input-filter form-control" ng-model="datas[name]" enter="datas[name]!=\'\'&&onBuscar(datas)" ng-if="!column.mask" ng-change="cambiarTI(name, datas[name], datas)"> <input type="text" class="input-filter form-control" ng-model="datas[name]" enter="datas[name]!=\'\'&&onBuscar(datas)" ng-if="column.mask" restrict="reject" data-mask="{{column.mask}}" > </div></div></div></form> </th> </tr></script><div class="table-responsive"><table class="table table-datos" ng-class="{\'tieneSelectores\': config.tieneSelectores, \'table-hover\':!noSeleccionable}" template-header="sample_ng_header" ng-table="tabDatos"><tr ng-repeat="row in $data"  class="data-row color-{{cargarClase(row)}}" ng-init="row.id_tr=\'id-row-tabla-datos-\'+$index; super_index=$index" ng-class="{sombreado: row.activo}" ng-if="$data.length > 0" > <td ng-if="config.tieneSelectores" btn-derecho menu="modeloTabla.menuDerecho()" elemento="row" datos="modeloTabla.datos()"> <div class="checkbox-wrapper"> <input type="checkbox" ng-model="row.activo" ng-change="desmarcar(row)" id="{{$id}}chkbox-data-{{$index}}"/> <label for="{{$id}}chkbox-data-{{$index}}"><span class="ui-chkbox-icon ui-icon-black ui-icon-check"></span></label> </div></td><td ng-if="config.buscadora" ng-repeat="columna in columnas" sortable="columna.orden" filter="columna.filtro" ng-click="!noSeleccionable && cambiar_linea(row, $event)" btn-derecho menu="modeloTabla.menuDerecho()" elemento="row" datos="modeloTabla.datos()" ng-class="{\'sin-mouse\':noSeleccionable}"> <div>{{columna.modificador ? columna.modificador(columna.real ? row[columna.real]: row[columna.clave], row): (columna.real ? row[columna.real]: row[columna.clave])}}</div></td><td ng-if="!config.buscadora" ng-repeat="columna in columnas" sortable="columna.orden" filter="columna.filtro" ng-click="!noSeleccionable && cambiar_linea(row, $event)" btn-derecho menu="modeloTabla.menuDerecho()" elemento="row" datos="modeloTabla.datos()" ng-class="{\'sin-mouse\':noSeleccionable}"> <div ng-if="columna.progresivo">{{$data.indexOf(row) + 1}}</div><div ng-if="columna.html && !columna.compile" > <div ng-bind-html="columna.html(row) | sanitize" ng-click="columna.actionHtml(row)"></div></div><div ng-if="columna.html && columna.compile" > <div bind-html-compile="columna.html(row)" bind-html-scope="columna.scope(row)" ng-click="columna.actionHtml(row)"></div></div><div ng-if="!columna.action&&!columna.html&&!columna.botonera&&!columna.progresivo">{{columna.modificador ? columna.modificador(columna.real ? row[columna.real]: row[columna.clave], row): (columna.real ? row[columna.real]: row[columna.clave])}}</div><div ng-if="columna.action" class="action-wrapper" ng-click="run_action(row, columna.action, $event)"> <a href="" class="action color-link-{{columna.cambiarColorLink ? columna.cambiarColorLink(row):\'\'}}" >{{columna.modificador ? columna.modificador(columna.real ? row[columna.real]: row[columna.clave], row): (columna.real ? row[columna.real]: row[columna.clave])}}</a> </div><div ng-if="columna.botonera"> <button type="button" ng-repeat="boton in columna.botonera" ng-click=\'boton.action(row)\'><span class=\'ui-icon{{boton.icono}}\'></span></button> </div></td></tr><tr ng-if="$data.length==0"> <td colspan="{{config.tieneSelectores ? columnas.length+1:columnas.length}}">{{config.mensaje}}</td></tr></table></div><div class="table-paginacion" ng-show="modeloTabla.datos().length > modeloTabla.agrupaciones()[0]"><div class="table-comandos" ng-init="actual=1"><button ng-model="buttons.inicio.number" id="button-inicio" ng-click="ir(buttons.inicio.number, \'button-inicio\')" ng-disabled="!buttons.inicio.active"><span class="ui-icon ui-icon-seek-first"></span></button><button ng-model="buttons.anterior.number" id="button-anterior" ng-click="ir(buttons.anterior.number, \'button-anterior\')" ng-disabled="!buttons.anterior.active"><span class="ui-icon ui-icon-seek-prev"></span></button><button ng-repeat="boton in buttons.paginas" class="bots" ng-model="boton.number" id="button-{{boton}}" ng-click="ir(boton.number, \'button-\'+boton.number)" ng-class="{active:(boton.number==actual)}">{{boton.number}}</button><button ng-model="buttons.siguiente.number" id="button-siguiente" ng-click="ir(buttons.siguiente.number, \'button-siguiente\')" ng-disabled="!buttons.siguiente.active" ><span class="ui-icon ui-icon-seek-next"></span></button><button ng-model="buttons.fin.number" id="button-fin" ng-click="ir(buttons.fin.number, \'button-fin\')" ng-disabled="!buttons.fin.active"><span class="ui-icon ui-icon-seek-end"></span></button><select class="table-numero-paginas" ng-init="counts.selected=counts.data[0]" ng-model="counts.selected" ng-change="cambiar()" ng-options="c as c for c in counts.data"></select></div></div>',
            templateUrl: url + '/js/directives/tabla-datos/tabla-datos.directive.template.html',
            scope: {
                modelo: '=modelo'
            },
            link: link
        };
    }

    ModeloTabla.$inject = [];
    function ModeloTabla() {

        var ModeloTablaFactory = function () {
            var priavadas = {};
            priavadas._columnas = [];
            priavadas._datos = [];
            priavadas._maxPaginas = 5;
            priavadas._agrupaciones = [5, 10, 15];
            priavadas._datosVisiblesTabla = {};
            priavadas._menuDerecho = {};
            priavadas._funcionRefrescarTabla = null;
            priavadas._funcionRecargarTabla = null;
            priavadas._oncambio = function () {};
            priavadas._limpia = function () {};
            priavadas._seleccionaRegistro = {};
            priavadas._selRegON = false;

            return {
                click: priavadas._limpia,
                limpiar: _limpiar,
                columnas: _columnasTabla,
                datos: _datosTabla,
                onNuevoDato: _cargarEventoCambioSeleccionados,
                agrupaciones: _agrupaciones,
                mostrarSelector: _eliminadaEnRefactoriozacion,
                maxPaginas: _maximoNumeroPaginasEnBotonera,
                obtenerDatos: _seleccionadosVisibles,
                menuDerecho: _menuDerecho,
                tabDatos: _actualizarDatosVisiblesDesdeTabla,
                nuevoDato: _cambiaronSeleccionados,
                refrescar: _refrescarDatosTabla,
                setRefrescar: _setRefrescarDatosTabla,
                setRecargarTabla: _setRecargarConfiguracionTabla,
                recargarTabla: _recargarConfiguracionTabla,
                setBloquearFila: _setBloquearFila,
                isBloqueada: _isBloqueada,
                setSelRegRow: _setSelRegRow,
                getSelRegON: _getSelRegON,
                getSelRegRow: _getSelRegRow,
                cancelSelReg: _cancelSelReg

            };

            function _getSelRegON()
            {
                return priavadas._selRegON;
            }
            function _cancelSelReg()
            {
                priavadas._seleccionaRegistro = {};
                priavadas._selRegON = false;
            }
            function _getSelRegRow()
            {
                return priavadas._seleccionaRegistro;
            }
            function _setSelRegRow(registro)
            {
                priavadas._seleccionaRegistro = registro;
                priavadas._selRegON = true;
            }

            function _setBloquearFila(fn) {
                priavadas._bloquearFila = fn;
            }
            function _isBloqueada(fila) {
                if (!priavadas._bloquearFila) {
                    return false;
                }
                return priavadas._bloquearFila(fila);
            }

            /**
             * Limpia los datos de la tabla
             * @example
             * modeloTabla.limpiar
             */
            function _limpiar() {
                _datosTabla([]);
            }
            /**
             * Sin parametro retornara las columnas de la tablas,
             * con parametro seteara
             * @param {Array} nuevasColumnas 
             * @example 
             * modeloTabla.columnas()
             * @example
             * modeloTabla.columnas([])
             */
            function _columnasTabla(nuevasColumnas) {
                if (!nuevasColumnas) {
                    return priavadas._columnas;
                }
                priavadas._columnas = nuevasColumnas;
                _recargarConfiguracionTabla();
            }
            /**
             * Sin parametro retornara los datos que contiene el modelo de la tabla
             * con parametro seteara los datos al modelo de la tabla
             * @param {Array} nuevosDatos 
             * @example 
             * modeloTabla.datos()
             * @example
             * modeloTabla.datos([])
             * 
             */
            function _datosTabla(a_datos) {
                if (!a_datos) {
                    return priavadas._datos;
                }
                priavadas._datos = a_datos;
                _refrescarDatosTabla();
            }
            /**
             * Recarga la pagina con las configuraciones 
             * seteadas hasta el momento
             */
            function _refrescarDatosTabla() {
                if (priavadas._funcionRefrescarTabla) {
                    priavadas._funcionRefrescarTabla();
                }
            }
            /**
             * Recibe la funcion que se ejecutara 
             * despues de refrescar los datos
             * @param {function} fn 
             */
            function _setRefrescarDatosTabla(fn) {
                priavadas._funcionRefrescarTabla = fn;
            }
            /**
             * Recibe la funcion que recargara la configuracion de la tabla
             * @param {function} fn 
             */
            function _setRecargarConfiguracionTabla(fn) {
                priavadas._funcionRecargarTabla = fn;
            }
            /**
             * Recarga las configuraciones de la tabla
             */
            function _recargarConfiguracionTabla() {
                if (priavadas._funcionRecargarTabla) {
                    priavadas._funcionRecargarTabla();
                }
            }
            /**
             * Setear la funcion que se ejecutara al cambiar
             * los datos seleccionados de la tabla
             * @param {function} nuevaFuncion 
             */
            function _cargarEventoCambioSeleccionados(nuevaFuncion) {
                priavadas._oncambio = nuevaFuncion;
            }
            /**
             * Al cambiar los elementos seleccionados ejecutara
             * la funcion que recibira como parametro los registros
             * seleccionados en la tabla
             * @param {function} filasSeleccionadas 
             */
            function _cambiaronSeleccionados(filasSeleccionadas) {
                priavadas._oncambio(filasSeleccionadas);
            }
            /**
             * 
             * @param {*} a_agrupaciones 
             */
            function _agrupaciones(a_agrupaciones) {
                if (!a_agrupaciones) {
                    return priavadas._agrupaciones;
                }
                priavadas._agrupaciones = a_agrupaciones;
            }
            /**
             * Deberia usar la propiedad html
             * @deprecated
             */
            function _eliminadaEnRefactoriozacion(b) {
                throw new Error("parece que esto solo es por html");
            }
            /**
             * Numero de filas que mostrara la tabla por pagina
             * @param {int} a_maxPaginas 
             */
            function _maximoNumeroPaginasEnBotonera(a_maxPaginas) {
                if (!a_maxPaginas) {
                    return priavadas._maxPaginas;
                }
                priavadas._maxPaginas = a_maxPaginas;
            }
            /**
             * Obtener los datos que estan visibles actualmente en la tabla
             * @return {Array}
             * 
             */
            function _seleccionadosVisibles() {
                if (priavadas._datosVisiblesTabla.filter && angular.isFunction(priavadas._datosVisiblesTabla.filter)) {
                    return priavadas._datosVisiblesTabla.filter(function (item) {
                        return item.activo;
                    });
                }
                return [];
            }
            /**
             * Setea el objeto de tipo menu a la tabla
             * @param {Object} nuevoMenu 
             */
            function _menuDerecho(nuevoMenu) {
                if (!nuevoMenu) {
                    return priavadas._menuDerecho;
                }
                priavadas._menuDerecho = nuevoMenu;
            }
            /**
             * Solo deberia ser usada por la directiva,
             * actualiza los datos de la pagina actual de la tabla
             * @param {*} a_datosVisiblesTabla 
             */
            function _actualizarDatosVisiblesDesdeTabla(a_datosVisiblesTabla) {
                priavadas._datosVisiblesTabla = a_datosVisiblesTabla;
            }

        };

        return ModeloTablaFactory;

    }

    angular.module("tablaDatosModule")
            .run(["$templateCache", function ($templateCache) {
                    $templateCache.remove("tabla-datos.directive.template.html");
                }]);

})();
