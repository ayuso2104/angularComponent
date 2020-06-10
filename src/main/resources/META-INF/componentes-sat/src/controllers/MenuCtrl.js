;
(function (angular, document, ContextualMenu) {
    "use strict";

    angular.module("app").controller("MenuCtrl", _menuCtrl);

    _menuCtrl.$inject = ["$scope"];

    function _menuCtrl($scope) {

        $scope.$on("$viewContentLoaded", _init);

        var menu = [
            {
                name: function (data) {
                    return new Promise(function (resolve) {
                        return resolve("Agregar base de datos de "+ data.name);
                    });
                },
                description: "Crea una base de datos por default. default_0, default_1... etc.",
                action: function (data) {
                    console.log("DB creada: ", data);
                },
                active: function (data) {
                    return data.id === 2;
                },
                show: function (data) {
                    return data.id === 2;
                }
            },
            {
                name: new Promise(function (resolve) {
                    return resolve("Remover bases de datos");
                }),
                description: function (data) {
                    return "Elimina todas las bases de datos creadas de " + data.name;
                },
                action: function (data) {
                    console.log("DBs eliminadas: ", data);
                },
                closeAfterAction: false,
                active: function (data) {
                    return new Promise(function (resolve) {
                        return resolve(data.id === 1);
                    });
                }
            },
            {
                name: "Remover permisos",
                action: function (data) {
                    console.log("Remover permisos", data);
                },
                active: new Promise(function(resolve) {
                    return resolve(false);
                })
            },
            {
                name: "Reasignar permisos",
                action: function (data) {
                    console.log("Reasignar permisos", data);
                },
                active: false
            }
        ];

        function _init() {
            var menuAccess = new ContextualMenu(document.getElementById("access"), menu, {
                id: 1,
                name: "Access"
            });
            var menuExcel = new ContextualMenu(document.getElementById("excel"), menu, {
                id: 2,
                name: "Excel"
            });
        }
    }

})(angular, document, WEBC.ContextualMenu);