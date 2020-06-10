(function () {
    'use strict';
    angular.module('Objectos', [])
        .filter('objVacio', function () {
            var bar;
            return function (obj) {
                if (!obj) {
                    return false;
                }
                for (bar in obj) {
                    if (obj.hasOwnProperty(bar)) {
                        return false;
                    }
                }
                return true;
            };
        });
})();
