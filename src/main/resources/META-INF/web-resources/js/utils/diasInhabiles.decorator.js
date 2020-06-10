(function () {
    'use strict';
    angular.module('diasInhabiles', []).config(_config);

    _config.$inject = ['$provide'];

    function _config($provide) {

        $provide.decorator('uibDatepickerDirective', _decorador);

        _decorador.$inject = ['$delegate', 'diasInhabilesService'];

        function _decorador($delegate, diasInhabilesService) {
            var directive = $delegate[0];
            var link = directive.link;


            directive.compile = _compile;
            function _compile() {
                return function (scope, element, attrs, ctrls) {

                    link.apply(this, arguments);


                    var url = scope.datepickerOptions.diasInhabiles;
                    console.debug('[Dias inhabiles] url', url);
                    if (url) {

                        console.debug('[Dias inhabiles] Activo');

                        var fechaActual = ctrls[0].activeDate;
                        diasInhabilesService.actualizarDiasFestivos(fechaActual.getFullYear(), url).then(function () {
                            ctrls[0].refreshView();
                        });

                        scope.$watch(function () {
                            return ctrls[0].activeDate;
                        }, function (newValue, oldValue) {
                            if (oldValue.getYear() === newValue.getYear()) {
                                return;
                            }

                            var cargarDiasInhabiles = diasInhabilesService.actualizarDiasFestivos(newValue.getFullYear(), url);

                            cargarDiasInhabiles.then(function () {
                                ctrls[0].refreshView();
                            });
                        }, true);

                    }


                };
            }

            return $delegate;
        }
    }

    angular.module('diasInhabiles').factory('diasInhabilesService', _diasInhabilesService);

    _diasInhabilesService.$inject = ['$filter', '$http', '$q'];

    function _diasInhabilesService($filter, $http, $q) {
        var _diasFestivos = {};
        var fechaActual = new Date();
        var FORMAT_DATE = 'dd/MM/yyyy';


        function _actualizarDiasFestivos(anio, url) {
            var defer = $q.defer();

            console.info(_diasFestivos);

            if (_diasFestivos[anio - 1] && _diasFestivos[anio] && _diasFestivos[anio + 1]) {
                return $q.reject();
            }
            var anioFin = _diasFestivos[anio + 1] ? anio : anio + 1;
            var anioInicio = _diasFestivos[anio - 1] ? anio : anio - 1;

            _obtenerDiasFestivoDelAnio(anioInicio, anioFin, url).then(function (fechas) {
                fechas = fechas.data.objRespuesta;
                var tempFechas = {};
                var i;
                for (i in fechas) {
                    if (fechas.hasOwnProperty(i) && !isNaN(fechas[i])) {
                        tempFechas[i] = new Date(fechas[i]);
                    }
                }

                _diasFestivos[anio - 1] = !_diasFestivos[anio - 1] ? {} : _diasFestivos[anio - 1];
                _diasFestivos[anio] = !_diasFestivos[anio] ? {} : _diasFestivos[anio];
                _diasFestivos[anio + 1] = !_diasFestivos[anio + 1] ? {} : _diasFestivos[anio + 1];

                for (i in tempFechas) {
                    if (tempFechas.hasOwnProperty(i)) {
                        var anioFecha = tempFechas[i].getFullYear();
                        var mes = tempFechas[i].getMonth();
                        var dia = tempFechas[i].getDate();


                        if (!_diasFestivos[anioFecha][mes]) {
                            _diasFestivos[anioFecha][mes] = {};
                        }

                        _diasFestivos[anioFecha][mes][dia] = true;
                    }
                }

                console.debug('[diasInhabilesService] fechas obtenidas', fechas);
                console.debug('[diasInhabilesService] resultado días festivos', _diasFestivos);

                defer.resolve();

            }, function (error) {
                console.error('[diasInhabilesService] Error al obtener las fehas del anio ' + anio, error);
                defer.reject(error);
            });

            return defer.promise;
        }

        function _marcaDiasFestivos() {
            return function (data) {
                var date = data.date,
                    mode = data.mode;
                if (mode === 'day' && (_diasFestivos[date.getFullYear()] && _diasFestivos[date.getFullYear()][date.getMonth()] && _diasFestivos[date.getFullYear()][date.getMonth()][date.getDate()])) {
                    return 'partially';
                }
            };
        }

        /**
         * Función para deshabilitar los dias hábiles del calendario
         * @param  {Object} data
         * @return {Boolean}
         */
        function _soloDiasHabiles() {
            return function (data) {

                var date = data.date,
                    mode = data.mode;
                return mode === 'day' && (date.getDay() === 0 || date.getDay() === 6 || (_diasFestivos[date.getFullYear()] && _diasFestivos[date.getFullYear()][date.getMonth()] && _diasFestivos[date.getFullYear()][date.getMonth()][date.getDate()]));
            };
        }

        /**
         * Obtiene los dias festivos de un anio
         */
        function _obtenerDiasFestivoDelAnio(anioInicio, anioFin, url) {
            var fechaInicial = new Date(anioInicio, 0, 1);
            var fechaFinal = new Date(anioFin, 11, 31);

            fechaInicial = $filter('date')(fechaInicial, FORMAT_DATE);
            fechaFinal = $filter('date')(fechaFinal, FORMAT_DATE);

            console.debug('[diasInhabilesService]  obtener formato', fechaInicial);

            return _obtenerDiasFestivosEntre(fechaInicial, fechaFinal, url);
        }

        /**
         * Obtiene los dias festivos de un rango de fechas
         * return {Promise}
         */
        function _obtenerDiasFestivosEntre(fechaInicial, fechaFinal, url) {
            return $http.get(url, {
                params: {
                    inicio: fechaInicial,
                    fin: fechaFinal
                },
                interceptor: false,
            });
        }

        return {
            marcaDiasFestivos: _marcaDiasFestivos,

            soloDiasHabiles: _soloDiasHabiles,
            actualizarDiasFestivos: _actualizarDiasFestivos,
            getDiasFestivos: function (anio) {
                return _diasFestivos[anio];
            }

        };


    }
})();