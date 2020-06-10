(function() {
	'use strict';

	angular.module("contextPath", []);
	// Configuracion inicial para el contexto de la pagina
	angular.module("contextPath").factory("ContextPath", recuperaContextPath)
			.provider("contextPath", function() {
				this.$get = recuperaContextPath;
			});

	function recuperaContextPath() {
		var tem = "app/PE/cet/";

		var recuperaContextPath = location.pathname.slice(1);

        if (recuperaContextPath.match(tem) !== null) {
			recuperaContextPath = recuperaContextPath.replace(tem, "");
			recuperaContextPath = recuperaContextPath.slice(0,
					recuperaContextPath.indexOf("/") + 1);
			recuperaContextPath = "/".concat(tem+recuperaContextPath);
		} else {
			recuperaContextPath = recuperaContextPath.slice(0,
					recuperaContextPath.indexOf("/") + 1);
			recuperaContextPath = "/".concat(recuperaContextPath);
		}

		return recuperaContextPath;
	}

})();
