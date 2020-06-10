;
(function (angular) {
    "use strict";

    angular.module("app", ["ui.router", "ac.common", "ac.selector", "ac.table", "ac.date", "ac.modal", "ac.accordion", "ac.selectorMultiple"]);

    angular.module("app").config(["$provide", "$acLogDecorator", function ($provide, $acLogDecorator) {
        $provide.decorator("$log", $acLogDecorator);
    }]);

    angular.module("app").controller("MainCtrl", _mainCtrl);

    _mainCtrl.$inject = ["$scope"];

    function _mainCtrl($scope) {
        var vm = this;

        userService.then(function (users) {
            $scope.$apply(function () {
                vm.usuarios = users;
                console.log("usuarios: ", vm.usuarios);
            });
        }, console.error);
    }

})(angular);

;
(function (window, document, SelectorItems, Table, el, OfflineDataProvider, whenElementMounted) {

    window.onload = function () {
        userService.then(function (users) {
            /*document.getElementById("selector-items-container").appendChild(new SelectorItems(users, 'first_name', {
                labelFrom: 'Usuarios disponibles',
                labelTo: 'Usuarios seleccionados',
                hasAllCheck: true,
                labelAllCheck: 'Seleccionar todos'
            }));
*/
            var row = new Table(new OfflineDataProvider(users), [
                {
                    value: 'id',
                    columnName: 'ID'
                },
                {
                    value: function (user) {
                        return el("div").addChildren(
                            el("button").addAttributes({
                                type: "button"
                            }).addChildren(
                                user.first_name
                            ).addEvent("click", function (evt) {
                                console.log(evt);
                            })
                        );
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
                    columnName: function() {
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
                        
                        if(_getSecondPartOfIp(element) > _getSecondPartOfIp(nextElement)) {
                            return columnForOrder.orderDirection === 'desc' ?  1: -1;
                        } else if (_getSecondPartOfIp(element) < _getSecondPartOfIp(nextElement)) {
                            return columnForOrder.orderDirection === 'desc' ?  -1: 1;
                        } else {
                            return 0;
                        }

                        function _getSecondPartOfIp(element) {
                            return Number(element.resolveValue.split("\.")[1]);
                        }
                    }
                }
            ], {
                numRowsByPage: 10,
                fixed: 2,
                defaultOrder: 'global',
                rowClasses: {
                    'bg-success': function (element) {
                        return element.email.indexOf("@reddit") !== -1;
                    },
                    'bg-danger': function (element) {
                        return new Promise(function (resolve) {
                            return resolve(element.ip_address.indexOf("11") !== -1);
                        });
                    }
                }
            });

            var interval;
            var limit = 0;
            interval = setInterval(function () {
                if(document.getElementById("table-container")) {
                    document.getElementById("table-container").appendChild(row);
                    clearInterval(interval);
                }
                if(limit > 1000) {
                    clearInterval(interval);
                }
                limit++;
            }, 300);

        }, console.error);
    }

})(window, document, WEBC.SelectorItems, WEBC.Table, WEBC.el, WEBC.OfflineDataProvider, WEBC.whenElementMounted);

document.addEventListener("DOMContentLoaded", function () {
    const ON = "ON";
    const OFF = "OFF";
    const STATES = { ON, OFF };

    const on = cell => cell.state = STATES.ON;
    const off = cell => cell.state = STATES.OFF;
    const stay = cell => cell;
    const cellOn = () => { return {state: STATES.ON } };
    const cellOff = () => { return { state: STATES.OFF } };

    const processCell = (board, currentX, currentY) => {
        const initialX = currentX === 0 ? currentX: currentX - 1;
        const initialY = currentY === 0 ? currentY: currentY - 1;
        const finalX = currentX === board[0].length - 1?  currentX: currentX + 1;
        const finalY = currentY === board.length - 1 ? currentY: currentY + 1;
        const currentCell = board[currentY][currentX];

        let countCellInOn = 0;

        for(let i = initialX; i <= finalX; i++) {
            for(let j = initialY; j <= finalY; j++) {
                if(currentX !== i || currentY !== j) {
                    if(board[j][i].state === STATES.ON){
                        countCellInOn++;
                    }
                }
            }
        }

        if(currentCell.state === STATES.ON) {

            if(countCellInOn === 2 || countCellInOn === 3) {
                console.log("Celula viva se mantiene");
                stay(currentCell);
            } else {
                off(currentCell);
                if(countCellInOn < 2) {
                    console.log("Muerte por soledad");
                } else {
                    console.log("Muerte por sobrepoblación");
                }
            }

        } else {
            if(countCellInOn === 3) {
                console.log("Celula muerta nace");
                on(currentCell);
            } else {
                console.log("Celula muerta se mantiene");
                stay(currentCell);
            }
        }
    };

    const printBoard = (board, printOn) => {
        printOn.innerHTML = "";

        let elBoard = document.createElement("div");
        elBoard.classList.add("el-board");

        board.forEach( (row, y) => {
            let elRow = document.createElement("div");
            elRow.classList.add("el-row");

            row.forEach((cell, x) => {
                let elCell = document.createElement("div");
                elCell.classList.add("el-cell");
                elCell.classList.add( cell.state === STATES.ON ? "el-cell--on": "el-cell--off");
                elRow.appendChild(elCell);
            });

            elBoard.appendChild(elRow);
        });

        printOn.appendChild(elBoard);
    };

    const processBoard = board => {
        board.forEach( (row, y) => {
            row.forEach((cell, x) => {
                processCell(board, x, y);
            });
        });
        return board;
    };

    const basicBoard = cells => cells.map( row => row.map( cell => cell === 1 ? cellOn(): cellOff() ) );

    let initialBoard = basicBoard([
        [ 0, 0, 0, 0, 0, 0],
        [ 0, 0, 1, 1, 1, 0],
        [ 0, 1, 1, 1, 0, 0],
        [ 0, 0, 0, 0, 0, 0]
    ]);

    //setInterval( () => {
        processBoard(initialBoard);
        printBoard(initialBoard, document.getElementById("el-board-container"));
    //}, 1000);


});