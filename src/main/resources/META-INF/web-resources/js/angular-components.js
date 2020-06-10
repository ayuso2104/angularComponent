(function () {
    'use strict';

    angular.module('angular-components', ["contextPath", "mensajes",
        "LoaderModule", "pascalprecht.translate", "tablaDatosModule",
        "primeModule", "panelModule", "ngMask", "botonDerechoModule",
        "ui.mask"]);


    angular.module('angular-components').config(config);

    config.$inject = ["$translateProvider", "contextPathProvider", '$locationProvider', '$compileProvider','$httpProvider'];

    function config($translateProvider, contextPathProvider, $locationProvider, $compileProvider, $httpProvider) {
        //initialize get if not there
        if (!$httpProvider.defaults.headers.get) {
            $httpProvider.defaults.headers.get = {};
        }

        //disable IE ajax request caching
        $httpProvider.defaults.headers.get['If-Modified-Since'] = 'Mon, 26 Jul 1997 05:00:00 GMT';
        // extra
        $httpProvider.defaults.headers.get['Cache-Control'] = 'no-cache';
        $httpProvider.defaults.headers.get.Pragma = 'no-cache';

        var base = contextPathProvider.$get();
        var langUrl = document.querySelector("meta[name='lang-url']");
        var url = base + 'lenguaje.json';
        if(langUrl) {
            url = langUrl.getAttribute("value");
        }
        if(url !== "none") {
            $translateProvider.useUrlLoader( url , {$http: {interceptor: false}});
            $translateProvider.preferredLanguage('es');
            $translateProvider.useSanitizeValueStrategy('escape');
        }

        $compileProvider.debugInfoEnabled(false);
    }


    angular.module("angular-components").run(run);
    run.$inject = ["Loader", "Mensajes"];

    function run(Loader, Mensajes) {
        var origOpen = XMLHttpRequest.prototype.open;
        XMLHttpRequest.prototype.open = function () {
            Loader.mostrar();

            var to = setTimeout(function () {
                Mensajes.success({
                    idError: 2,
                    descError: "El servidor tardo demasiado en responder"
                });
                Loader.quitar();
            }, 60 * 60 * 60);

            this.addEventListener('load', quitarLoader);
            this.addEventListener('error', quitarLoader);
            this.addEventListener('abort', quitarLoader);

            origOpen.apply(this, arguments);

            function quitarLoader(evt) {
                clearTimeout(to);
                Loader.quitar();
            }

        };
    }

    angular.module("angular-components").factory("ReqForm", ReqForm);

    ReqForm.$inject = ["$http"];

    function ReqForm($http) {

        function _post(url, data) {
            return $http({
                method: 'POST',
                url: url,
                data: formURL(data),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                }
            });
        }

        function _put(url, data) {
            return $http({
                method: 'PUT',
                url: url,
                data: formURL(data),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                }
            });
        }

        return {
            post: _post,
            put: _put
        };
    }

    angular.module("angular-components").service("CargarRoles", Roles);

    Roles.$inject = ["$q", "$http", "contextPath", "Mensajes"];

    function Roles($q, $http, contextPath, Mensajes) {
        var roles;
        var self = this;
        var cargarRoles = function (a_roles) {
            roles = Base64.decode(a_roles).split(",");
            Object.freeze(roles);
            console.info("Roles del usuario actual:", roles);
            cargarRoles = function () {
                console.error("Ya se han cargado roles");
            };
        };

        self.tieneRol = function (rol) {
            return roles.contains(rol);
        };


        return $q(function (resolve, reject) {
            if (roles) {
                return resolve(roles);
            }
            $http.get(contextPath + "rdr.json", {interceptor: false}).then(function (res) {
                Mensajes.success(res.data);
                if (res.data.idError !== 3) {
                    cargarRoles(res.data.objRespuesta);
                    resolve(self);
                }
            }, function (responseError) {
                Mensajes.error(responseError);
                reject(responseError);
            });
        });

    }

    angular.module("angular-components").directive("fecha", FechaDirective);
    angular.module("angular-components").directive("binario", BinarioDirective);

    FechaDirective.$inject = ["$filter"];
    function FechaDirective($filter) {

        function link(scope, element, attr, ngModel) {
            ngModel.$formatters.push(formatter);
            ngModel.$parsers.push(parser);

            element.on('change', function (e) {
                var element = e.target;
                element.value = formatter(ngModel.$modelValue);
            });

            function parser(value) {
                return $filter('date')(value, attr.fecha);
            }

            function formatter(value) {
                return $filter('date')(value, attr.fecha);
            }
        }

        return {
            restrict: 'A',
            require: 'ngModel',
            link: link
        };
    }

    BinarioDirective.$inject = [];
    function BinarioDirective() {
        function link(scope, element, attr, ngModel) {
            ngModel.$formatters.push(formatter);
            ngModel.$parsers.push(parser);

            element.on('change', function (e) {
                var element = e.target;
                element.value = formatter(ngModel.$modelValue);
            });

            function parser(value) {
                return value ? attr.si : attr.no;
            }

            function formatter(value) {
                return value ? attr.si : attr.no;
            }
        }

        return {
            restrict: 'A',
            require: 'ngModel',
            link: link
        };
    }

    angular.module("angular-components").filter("binario", function () {
        return function (row) {
            return (row === true) ? "Si" : (row === false ? "No" : "");
        };
    });
    angular.module("angular-components").filter("candado", function () {
        return function (array) {
            if (Array.isArray(array)) {
                return array.join();
            }
            return array;
        };
    });
    angular.module("angular-components").filter("fraccion", function () {
        return function (inp) {
            if (inp === undefined || inp === null) {
                return inp;
            }
            inp += "";
            if (inp.length > 4) {
                var parte_inicial = inp.substring(0, 4);
                var fin = inp.substring(4, inp.length);

                var parte_final = [];

                while (fin.length > 0) {
                    parte_final.push(fin.substring(0, 2));
                    fin = fin.substring(2, fin.length);
                }

                return parte_inicial + "." + parte_final.join(".");
            } else {
                return inp;
            }
        };
    });


})();

var countWatchers = function () {
    'use strict';
    var root = angular.element(document.getElementsByTagName('body'));

    var watchers = [];

    var f = function (element) {
        angular.forEach(['$scope', '$isolateScope'],
            function (scopeProperty) {
                if (element.data() &&
                    element.data().hasOwnProperty(scopeProperty)) {
                    angular.forEach(
                        element.data()[scopeProperty].$$watchers,
                        function (watcher) {
                            watchers.push(watcher);
                        });
                }
            });

        angular.forEach(element.children(), function (childElement) {
            f(angular.element(childElement));
        });
    };

    f(root);

    // Remove duplicate watchers
    var watchersWithoutDuplicates = [];
    angular.forEach(watchers, function (item) {
        if (watchersWithoutDuplicates.indexOf(item) < 0) {
            watchersWithoutDuplicates.push(item);
        }
    });

    console.log("Numero de watchers: " + watchersWithoutDuplicates.length);
};
