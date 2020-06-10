;
(function (angular, Table, OfflineDataProvider) {
    "use strict";

    angular.module("ac.table", []);

    angular.module("ac.table").directive("acTable", _acTable);

    _acTable.$inject = ["$log", "$q", "$timeout"];

    function _acTable($log, $q, $timeout) {
        return {
            require: 'ngModel',
            link: _link,
            scope: {
                ngModel: '=ngModel',
                acColumns: '=acColumns',
                acConfig: '=acConfig',
                acDataResolver: '=acDataResolver'
            }
        };

        function _link(scope, element, attrs) {

        var table;

       let unregister = scope.$watchCollection("ngModel", rerender);

        function rerender() {
            if (scope.ngModel && scope.acColumns) {
                _init();
            }
        }

        function _init() {
            if (typeof (scope.ngModel) === "function") return _initFunction();
            if (Array.isArray(scope.ngModel)) return _initArray();
            if (scope.ngModel === undefined) return _initArray();
            if (angular.isObject(scope.ngModel) && angular.isFunction(scope.ngModel.getPage) && angular.isFunction(scope.ngModel.getAllData)) return _initProvider();
            throw new Error("Su definición de modelo no es compatible, use una colección de datos o una funcion que retorne la paginación");
        }

        function _initFunction() {

        }

        function _initProvider() {
            if(!scope.acColumns) {
                throw new Error("No proporciono una definición de columnas para datos online");
            }

            var dataProvider = scope.ngModel;

            var config = scope.acConfig || {};

            table = new Table(dataProvider, scope.acColumns, config);

            _mount();
        }

        function _initArray() {
            if (!scope.acColumns) {
                throw new Error("No proporciono una definición de columnas para datos offline");
            }

            var dataProvider = new OfflineDataProvider(scope.ngModel || []);

            var config = scope.acConfig || {};

            table = new Table(dataProvider, scope.acColumns, config);

            _mount();
        }

        function _mount() {
            element[0].innerHTML = '';
            element[0].appendChild(table);

            $timeout(() => {
                scope.$apply( () => {
                    scope.acDataResolver = {
                        selectedData: function () {
                            var defer = $q.defer();

                            if (!table) return defer.reject("La tabla no esta creada aun");

                            table.resolveData().then(function (res) {
                                return defer.resolve(res);
                            });

                            return defer.promise;
                        },
                        totalRows: function () {
                            return table.totalRows;
                        },
                        pageData: function () {
                            return table.pageData();
                        }
                    };
                });
            });
        }

    }
    }


    ColumnFactory.$inject = ["$rootScope", "$compile"];
    function ColumnFactory($rootScope, $compile) {

        const merge = (column, extras) => {
            return Object.assign(column, extras);
        };

        return {
            basic: (value, columnName, extras) => {
                return this.merge({
                    value,
                    columnName,
                    orderable: false,
                    filterable: false
                }, extras);
            },
            full: (value, columnName, extras) => {
                return merge({
                    value,
                    columnName
                }, extras);
            },
            merge
        }
    }

    angular.module("ac.table").factory("ColumnFactory", ColumnFactory);


})(angular, WEBC.Table, WEBC.OfflineDataProvider);