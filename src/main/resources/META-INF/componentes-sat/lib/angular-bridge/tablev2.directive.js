import isArray from 'lodash/isArray';

;
(function (angular, $W, Table, OfflineDataProvider) {
    "use strict";

    angular.module("ac.tablev2", []);

    angular.module("ac.tablev2").directive("acTableV2", _acTable);

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
            let table;
            let build = (callBy) => {
                if (!scope.ngModel) {
                    return;
                }
                console.log("Se actualiza el: ", scope.ngModel, " para el id: ", scope.$id);
                const dataProvider = isArray(scope.ngModel) ? new OfflineDataProvider(scope.ngModel) : scope.ngModel;
                table = $W.render($W.construct(Table, {
                    columnsDefinition: scope.acColumns,
                    config: scope.acConfig,
                    dataProvider: dataProvider,
                }), element[0]);
                table.load();
            };

            build();
            scope.$watchCollection("ngModel", () => {
                $timeout(() => build("ngModel"));
            });
            scope.$watchCollection("acConfig", () => {
                $timeout(() => {
                    if (!scope.acConfig) {
                        return;
                    }
                    table.loadConfig({
                        config: scope.acConfig
                    })
                });
            });
        }
    }


    class ColumnFactory {

        basic(value, columnName, extras) {
            return this.merge({
                value,
                columnName,
                orderable: false,
                filterable: false
            }, extras);
        }

        full(value, columnName, extras) {
            return this.merge({
                value,
                columnName
            }, extras);
        }

        merge(column, extras) {
            return Object.assign(column, extras);
        }

    }
    ColumnFactory.$inject = [];

    angular.module("ac.table").factory("ColumnFactoryV2", () => new ColumnFactory());


})(angular, $W, WEBC.TableV2, WEBC.OfflineDataProvider);