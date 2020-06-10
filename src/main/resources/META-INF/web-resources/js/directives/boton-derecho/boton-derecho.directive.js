(function () {
    'use strict';
    angular.module("botonDerechoModule", [])

        .directive("btnDerecho", ['$compile', function ($compile) {
            return {
                link: function (scope, element, attrs) {

                    scope.elemento = scope.$eval(attrs.elemento);
                    scope.datos = scope.$eval(attrs.datos);

                    var template = '<div class="boton-derecho" id="boton-derecho-{{$id}}" ng-click="$event.stopPropagation()"> <div class="hide boton-derecho-menu-directiva" id="boton-derecho-menu-directiva-{{$id}}"> <ul class="menu"> </ul></div></div>';
                    angular.element(document.body).append($compile(template)(scope));

                    var _cerrar = function () {
                        if (!scope.open) {
                            return;
                        }
                        var menuDom = document.getElementById("boton-derecho-menu-directiva-" + scope.$id);
                        if (!menuDom) {
                            return;
                        }
                        menuDom.classList.add("hide");
                        menuDom.classList.remove("show");

                        setTimeout(function () {
                            scope.$apply(function () {
                                var menu = scope.$eval(attrs.menu);
                                scope.open = false;
                                if (angular.isFunction(menu.onCerrar)) {
                                    menu.onCerrar(scope.elemento);
                                }
                            });
                        }, 1);

                    };

                    document.addEventListener("click", _cerrar);

                    function btnDerechoAccion(menu, event, el) {
                        var menuDom = document.getElementById("boton-derecho-menu-directiva-" + scope.$id);
                        menuDom.classList.add("show");
                        menuDom.classList.remove("hide");
                        menuDom.style.top = mouseY(event) + 'px';
                        menuDom.style.left = mouseX(event) + 'px';
                        var lista = menuDom.querySelector(".menu");
                        lista.innerHTML = "";
                        var acciones = menu.acciones();

                        var mk_fn = function (i, el) {
                            return function () {
                                acciones[i].accion(el);
                                menuDom.classList.add("hide");
                                menuDom.classList.remove("show");
                            };
                        };

                        var _ocultarElemento = function (elemento) {
                            return function(){
                                elemento.classList.add('show');
                                elemento.classList.remove('hide');
                            };
                        };

                        var _mostrarElemento = function (elemento) {
                            return function(){
                                elemento.classList.add("hide");
                                elemento.classList.remove('show');
                            };
                        };

                        var _accionMenu = function (i, j, el) {
                            return function () {
                                acciones[i].submenu[j].accion(el);
                                menuDom.classList.add("hide");
                                menuDom.classList.remove("show");
                            };
                        };

                        function _accionSubMenu(i, j, k, el) {
                            return function () {
                                acciones[i].submenu[j].submenu[k].accion(el);
                                menuDom.classList.add("hide");
                                menuDom.classList.remove("show");
                            };
                        }

                        function _calculaSubMenu(uiSubSubMenu){
                            return function () {
                                uiSubSubMenu.style.top = "0px";
                                uiSubSubMenu.style.left = "138px";
                                uiSubSubMenu.style.width = "180px";
                            };
                        }

                        for (var i = 0; i < acciones.length; i++) {
                            var li = document.createElement("li");
                            if (acciones[i].activa) {
                                if (!acciones[i].submenu) {
                                    li.addEventListener("click", mk_fn(i, el));
                                }
                            } else {
                                li.classList.add("disabled");
                            }
                            var div = document.createElement("div");
                            div.classList.add("menu-item");

                            var uiMenuItem = document.createElement("div");
                            uiMenuItem.classList.add('ui-menu-item');

                            var spanUi = document.createElement("span");
                            spanUi.classList.add('ui-menuitem-icon');
                            spanUi.classList.add('ui-icon');
                            spanUi.classList.add('ui-icon-black');
                            spanUi.classList.add(acciones[i].icono);
                            uiMenuItem.appendChild(spanUi);
                            uiMenuItem.appendChild(document.createTextNode(acciones[i].nombre));
                            var calcSubmenu;


                            var uiSubmenu = null;
                            if (acciones[i].submenu) {

                                uiSubmenu = document.createElement("ul");
                                uiSubmenu.classList.add('ui-submenu');
                                uiSubmenu.classList.add('hide');
                                li.addEventListener("mouseover", _ocultarElemento(uiSubmenu));
                                li.addEventListener("mouseout", _mostrarElemento(uiSubmenu));

                                for (var j = 0; j < acciones[i].submenu.length; j++) {
                                    var uiSubmenuItem = document.createElement("li");
                                    uiSubmenuItem.classList.add('ui-submenu-item');
                                    uiSubmenuItem.textContent = acciones[i].submenu[j].nombre;

                                    if (!acciones[i].submenu[j].submenu) {
                                        uiSubmenuItem.addEventListener('click', _accionMenu(i, j, el));
                                    } else {
                                        var uiSubSubMenu = document.createElement("ul");
                                        uiSubSubMenu.classList.add('ui-submenu');
                                        uiSubSubMenu.classList.add("hide");
                                        for (var k = 0; k < acciones[i].submenu[j].submenu.length; k++) {
                                            var uiSubSubMenuItem = document.createElement("li");
                                            uiSubSubMenuItem.classList.add("ui-submenu-item");
                                            uiSubSubMenuItem.textContent = acciones[i].submenu[j].submenu[k].nombre;
                                            uiSubSubMenuItem.addEventListener('click', _accionSubMenu(i, j, k, el));
                                            uiSubSubMenu.appendChild(uiSubSubMenuItem);
                                        }
                                        uiSubmenuItem.appendChild(uiSubSubMenu);

                                        uiSubmenuItem.addEventListener("mouseover", _ocultarElemento(uiSubSubMenu));

                                        uiSubmenuItem.addEventListener("mouseout", _mostrarElemento(uiSubSubMenu));

                                        calcSubmenu = _calculaSubMenu(uiSubSubMenu);
                                    }


                                    uiSubmenu.appendChild(uiSubmenuItem);

                                }
                                uiMenuItem.appendChild(uiSubmenu);
                            }

                            div.appendChild(uiMenuItem);
                            li.appendChild(div);
                            lista.appendChild(li);

                            if (acciones[i].submenu) {
                                uiSubmenu.style.left = (menuDom.offsetWidth - 4) + "px";
                                uiSubmenu.style.top = "0px";
                                uiSubmenu.style.width = "150px";

                                if (calcSubmenu && angular.isFunction(calcSubmenu)) {
                                    calcSubmenu();
                                }
                            }
                        }
                        /**Si no hay acciones, oculta el menu ;) ***/
                        if (acciones.length === 0) {
                            lista.parentNode.classList.remove("show");
                            lista.parentNode.classList.add("hide");
                            return;
                        }

                        scope.open = true;

                        function _cargarSubmenu() {
                            var accion = this;
                        }

                    }

                    function mouseX(evt) {
                        if (evt.pageX) {
                            return evt.pageX;
                        } else if (evt.clientX) {
                            return evt.clientX + (document.documentElement.scrollLeft ?
                                    document.documentElement.scrollLeft :
                                    document.body.scrollLeft);
                        } else {
                            return null;
                        }
                    }

                    function mouseY(evt) {
                        if (evt.pageY) {
                            return evt.pageY;
                        } else if (evt.clientY) {
                            return evt.clientY + (document.documentElement.scrollTop ?
                                    document.documentElement.scrollTop :
                                    document.body.scrollTop);
                        } else {
                            return null;
                        }
                    }

                    element.bind('contextmenu', function (event) {
                        event.preventDefault();
                        document.body.click();

                        setTimeout(function () {
                            scope.$apply(function () {
                                var menu = scope.$eval(attrs.menu);
                                if (menu.antes === undefined || menu.bloqueado()) {
                                    return;
                                }
                                scope.elemento.$$clickDerecho(event);
                                menu.antes(scope.datos[scope.elemento.$$identificador], function (el, a_menu) {
                                    if (a_menu) {
                                        menu = a_menu;
                                    }
                                    btnDerechoAccion(menu, event, el);
                                }, menu);
                            });
                        }, 1);

                    });

                    scope.$on('$destroy', function () {
                        var botonDerecho = document.getElementById('boton-derecho-' + scope.$id);
                        document.removeEventListener('click', _cerrar);
                        botonDerecho.remove();
                    });

                }

            }
                ;
        }])

        .factory('MenuDerecho', [function () {

            var MenuDerecho = function () {
                var self = {};

                var acciones = [];
                var bloqueado = false;


                var preAccion = function (elemento, next) {
                    next(elemento);
                };

                self.acciones = function () {
                    return acciones;
                };

                self.preAccion = function (fn) {
                    preAccion = fn;
                };

                self.limpiar = function () {
                    acciones = [];
                };

                self.bloquear = function(){
                    bloqueado = true;
                };
                self.desbloquear = function () {
                    bloqueado = false;
                };
                self.bloqueado = function(){
                    return bloqueado;
                };

                self.antes = function (el, fn) {
                    fn(el);
                };

                self.agregarAccion = function (nombre, fn, icono) {
                    acciones.push({
                        nombre: nombre,
                        accion: function (elemento) {
                            preAccion(elemento, fn, self);
                            if (self.despues) {
                                self.despues(elemento);
                            }
                        },
                        icono: icono,
                        activa: true
                    });

                    return {
                        agregarSubmenu: _agregarSubmenu.bind(acciones[acciones.length - 1])
                    };

                    function _agregarSubmenu(nombre, accion) {
                        if (!this.submenu) {
                            this.submenu = [];
                        }

                        this.submenu.push({
                            nombre: nombre,
                            accion: accion
                        });

                        return {
                            agregarSubmenu: _agregarSubSubmenu.bind(this.submenu[this.submenu.length - 1])
                        };

                        function _agregarSubSubmenu(nombre, accion) {
                            /*jshint validthis:true*/
                            if (!this.submenu) {
                                this.submenu = [];
                            }

                            this.submenu.push({
                                nombre: nombre,
                                accion: accion
                            });
                        }
                    }
                };

                self.eliminarAccion = function (nombre) {
                    acciones = acciones.filter(function (it) {
                        return it.nombre !== nombre;
                    });
                };

                self.deshabilitarAccion = function (nombre) {
                    for (var i in acciones) {
                        if (acciones[i].nombre === nombre) {
                            acciones[i].activa = false;
                        }
                    }
                };
                self.habilitarAccion = function (nombreAccion) {
                    for (var i in acciones) {
                        if (acciones[i].nombre === nombreAccion) {
                            acciones[i].activa = true;
                        }
                    }
                };
                self.clone = function () {
                    var tmp = new MenuDerecho();
                    var fns = self.acciones();
                    for (var i = 0; i < fns.length; i++) {
                        tmp.agregarAccion(fns[i].nombre, fns[i].accion, fns[i].icono);
                    }
                    return tmp;
                };

                return self;
            };


            return MenuDerecho;

        }]);
})
();
