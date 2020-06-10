/*
* directivas para parsear modelos
*
*/

(function(){
  'use strict';
  angular.module('parseadores',[]);

  /*
  * Convertir a un numero.
  */
  angular.module('parseadores').directive('convertToNumber', function() {
    return {
      require: 'ngModel',
      link: function(scope, element, attrs, ngModel) {
        ngModel.$parsers.push(function(val) {
          if(isNaN(val)){
            return val;
          }
          return ((val !== null) ? parseInt(val, 10) : null);
        });
        ngModel.$formatters.push(function(val) {
          return ((val !== null) ? '' + val : null);
        });
      }
    };
  });
})();
