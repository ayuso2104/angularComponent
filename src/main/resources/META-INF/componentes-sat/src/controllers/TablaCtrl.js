;
(function (angular, userService) {
    "use strict";

    angular.module("app").controller("TablaCtrl", _tablaCtrl);

    _tablaCtrl.$inject = [];

    function _tablaCtrl() {
        var vm = this;
        userService.then(function (users) {
            vm.users = users;
        });

        vm.imprimirElemento = function () {
            vm.dataResolver.selectedData().then(function (res) {
                console.log("Resolve:", res);
                vm.selected = res;
            });
        };

        vm.config = {
            numRowsByPage: 10,
            fixed: 0,
            defaultOrder: 'global',
            selection: 'multiple',
            hasCheck: true,
            rowClasses: {
                'bg-success': function (element) {
                    return element.email.indexOf("@mysql") !== -1;
                },
                'bg-danger': function (element) {
                    return new Promise(function (resolve) {
                        return resolve(element.ip_address.indexOf("11") !== -1);
                    });
                }
            },
            menu: [
                {
                    name: "Prueba",
                    description: "Esta es solo una prueba",
                    action: function (element) {
                        console.log(element);
                    }
                },
                {
                    name: function (element) {
                        return new Promise(function (resolve) {
                            resolve("Reasignar el id: " + element.id);
                        });
                    },
                    action: function(user) {
                        alert("Reasignando " + user.first_name)
                    }
                },
                {
                    name: new Promise(function (resolve) {
                        resolve("Nuevo elemento");
                    }),
                    action: console.log
                }
            ]
        };

        vm.columns = [{
                value: 'id',
                columnName: 'ID'
            },
            {
                value: function (user) {
                    return user.first_name;
                },
                columnName: 'First Name',
                orderCriteria: 'first_name',
                filterCriteria: 'first_name'
            },
            {
                value: function (user) {
                    return user.last_name;
                },
                columnName: function () {
                    return "Last Name"
                }
            },
            {
                value: function (user) {
                    return new Promise(function (resolve) {
                        resolve(user.gender);
                    });
                },
                columnName: function () {
                    return new Promise(function (resolve) {
                        resolve("Género");
                    });
                }
            },
            {
                value: 'email',
                columnName: 'Email with a lot a lot very informaction container',
                orderable: false,
                filterCriteria: function (element, filter) {
                    return element.email.indexOf("@" + filter) !== -1;
                }
            },
            {
                value: 'ip_address',
                columnName: 'IP',
                filterable: false,
                orderCriteria: function (element, nextElement, columnForOrder) {

                    if (_getSecondPartOfIp(element) > _getSecondPartOfIp(nextElement)) {
                        return columnForOrder.orderDirection === 'desc' ? 1 : -1;
                    } else if (_getSecondPartOfIp(element) < _getSecondPartOfIp(nextElement)) {
                        return columnForOrder.orderDirection === 'desc' ? -1 : 1;
                    } else {
                        return 0;
                    }

                    function _getSecondPartOfIp(element) {
                        return Number(element.resolveValue.split("\.")[1]);
                    }
                }
            }
        ];
    }

})(angular, window.userService);