( function ( ){
	'use strict';
	angular.module("Paginas",["contextPath"]).factory("Paginas",Paginas);

	Paginas.$inject = ["ContextPath", "$window"];

	function Paginas( ContextPath, $window ) {
		var urls = {
			determinarResolucion: "vista/incidencias-proceso/determinacion.htm",
			principal: "",
			muestrasOperacion: "/"
		};

		return {
			ir: _ir,
			cambioContexto:_cambioContexto,
			redireccionar:_redireccionar
		};

		function _ir(index) {
			var url = ContextPath + urls[index];
			$window.location.href = url;
		}

		function _cambioContexto(contexto,index) {
			console.log(ContextPath);
			ContextPath=ContextPath.replace("ora-webapp",contexto);
			var url = ContextPath + urls[index];
			$window.location.href = url;
		}

		function _redireccionar(contexto,index) {
			var url = contexto + urls[index];
			$window.location.href = url;
		}
	}

})();
