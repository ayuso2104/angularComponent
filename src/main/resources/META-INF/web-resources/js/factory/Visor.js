(function () {
    'use strict';
    angular.module("VisorModule", []).factory("mostrarArchivo", Visor);

    Visor.$inject = ["$http", '$q', '$sce'];

    function Visor($http, $q, $sce) {

        return function (url, content, titulo, next) {
            var defer = $q.defer();

            var quitarModal = function (div) {
                document.body.style.overflow = "auto";
                div.remove();
                defer.resolve();
                if (angular.isFunction(next)) {
                    next();
                }
            };

            //Funcion encargarada de mostrar el archivo en la modal 
            var cargandoArchivo = function(res){
                var archivo;
                var wrapper = _crearModal(titulo, quitarModal);
                if (content === "application/pdf") {
                    archivo = new Blob([res], {
                        type: content
                    });
                    console.log('[ARCHIVO]', archivo);
                    var ruta_local = URL.createObjectURL(archivo);
                    console.log('[RUTA]', ruta_local);

                    /*if (isIE(navigator.userAgent)) {*/
                    var iframe = document.createElement("iframe");
                    iframe.style.width = "100%";
                    iframe.style.height = "100%";
                    iframe.style.position = "relative";
                    iframe.style.top = '-3px';

                    iframe.src = "./recurso/lib/pdfjs/web/viewer.html";

                    wrapper.appendChild(iframe);
                    iframe.onload = function () {
                        iframe.contentWindow.renderPDF(res);
                    };

                } else {

                    var buffer = new Uint8Array(res);
                    archivo = new Blob([buffer], {
                        type: content
                    });
                    var ruta = URL.createObjectURL(archivo);

                    var img = document.createElement("img");
                    img.setAttribute("src", $sce.trustAsResourceUrl(ruta));
                    img.setAttribute("width", "100%");
                    img.setAttribute("height", "100%");

                    wrapper.appendChild(img);
                }
            };

            var _defaultConfiguracion = {
                method: 'GET',
                url: url,
                responseType: 'arraybuffer'
            };

            var _configuracion = (angular.isString(url) ? _defaultConfiguracion : angular.extend(_defaultConfiguracion, url));

            console.debug('[Visor]Configuracion: ', _configuracion);

            //Valida si la URL no trae como atributo el data, de ser así se trata de un archivo local 
            if(!url.data){
                cargandoArchivo(url); 
                return true;
            }

            //Si la condicion anterior no se cumple, entonces se trata de un archivo que debe ser consultado desde el servidor
            $http(_configuracion).then(function (response) {
                var res = response.data;
                cargandoArchivo(res);

            }, function (response) {
                if (angular.isFunction(next)) {
                    next(response.data, response.status, response.headers, response.config);
                }
                defer.reject(response);
            });


            return defer.promise;


        };

        function _crearModal(titulo, quitarModal) {
            var div = document.getElementById("visor-extended");
            if (div) {
                div.innerHTML = "";
            } else {
                div = document.createElement("div");
            }
            div.id = "visor-extended";
            var wrapper = document.createElement("div");

            wrapper.id = "visor-content";


            div.appendChild(wrapper);
            document.body.appendChild(div);
            document.body.style.overflow = "hidden";

            var header = document.createElement("div");
            header.classList.add("header");

            var title = document.createElement("div");
            title.classList.add("titulo");
            title.textContent = titulo || '';

            var boton_redimensionar = document.createElement("span");
            boton_redimensionar.classList.add("ui-icon");
            boton_redimensionar.classList.add("ui-icon-arrow-4-diag");

            boton_redimensionar.addEventListener("click", function () {
                if (wrapper.classList.contains("expanded")) {
                    wrapper.classList.remove("expanded");
                    boton_redimensionar.classList.add("ui-icon-arrow-4-diag");
                    boton_redimensionar.classList.remove("ui-icon-arrowthick-1-sw");
                } else {
                    wrapper.classList.add("expanded");
                    boton_redimensionar.classList.remove("ui-icon-arrow-4-diag");
                    boton_redimensionar.classList.add("ui-icon-arrowthick-1-sw");
                }
            });


            var boton_cancelar = document.createElement("span");
            boton_cancelar.classList.add("eliminar");
            boton_cancelar.classList.add("ui-icon");
            boton_cancelar.classList.add("ui-icon-closethick");
            boton_cancelar.addEventListener("click", function () {
                quitarModal(div);
            });

            var con_redimensionar = document.createElement("div");
            con_redimensionar.classList.add("content-button");
            con_redimensionar.appendChild(boton_redimensionar);
            con_redimensionar.classList.add("ui-widget-header");

            addEvent(con_redimensionar, "mouseenter", function () {
                con_redimensionar.classList.remove("ui-widget-header");
                con_redimensionar.classList.add("ui-state-hover");
            });

            addEvent(con_redimensionar, "mouseout", function () {
                con_redimensionar.classList.add("ui-widget-header");
                con_redimensionar.classList.remove("ui-state-hover");
            });

            var con_cancelar = document.createElement("div");
            con_cancelar.classList.add("content-button");
            con_cancelar.appendChild(boton_cancelar);
            con_cancelar.classList.add("ui-widget-header");

            addEvent(con_cancelar, "mouseenter", function () {
                con_cancelar.classList.remove("ui-widget-header");
                con_cancelar.classList.add("ui-state-hover");
            });

            addEvent(con_cancelar, "mouseout", function () {
                con_cancelar.classList.add("ui-widget-header");
                con_cancelar.classList.remove("ui-state-hover");
            });


            header.appendChild(title);
            title.appendChild(con_cancelar);
            title.appendChild(con_redimensionar);


            wrapper.appendChild(header);
            return wrapper;
        }

    }

})();