/** Directiva para detectar un enter en un input **/
( function () {
    'use strict';
	angular.module("enter", []);
	angular.module("enter").directive("enter", enter);

		function enter( ) {
			return function (scope, element, attrs) {
				element.bind("keydown keypress", function (event) {
		            if(event.which === 13) {
		                scope.$apply(function (){
		                    scope.$eval(attrs.enter); //aca evaluo la funcion que pasan como parametros
		                });
		                event.preventDefault();
		            }
		        });
		    };
		}
})();
