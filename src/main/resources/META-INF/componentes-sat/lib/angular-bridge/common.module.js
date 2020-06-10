;
(function (angular, logger) {
    "use strict";

    angular.module("ac.common", ["ngMessages"]);

    angular.module("ac.common").constant("$acLogDecorator", _acLogDecorator);

    _acLogDecorator.$inject = ["$delegate", "$injector"];

    function _acLogDecorator($delegate, $injector) {
        Object.keys(logger).forEach(function (keyFn) {
            $delegate[keyFn] = logger[keyFn];
        });
        return $delegate;
    }

    angular.module("ac.common").directive("acNumber", ["$log", function ($log) {
        return {
            link: link,
            controller: () => {},
            require: 'ngModel'
        };

        function link(scope, element, attr, ngModelCtrl) {
            function fromUser(text) {
                if (text) {
                    text = String(text);
                    var transformedInput = text.replace(/[^0-9]/g, '');

                    if (transformedInput !== text) {
                        ngModelCtrl.$setViewValue(transformedInput);
                        ngModelCtrl.$render();
                    }
                    return transformedInput;
                }
                return "";
            }
            ngModelCtrl.$parsers.push(fromUser);
            ngModelCtrl.$formatters.push(fromUser);
        }
        ;
    }]);

    angular.module("ac.common").directive('acCapitalize', function() {
        return {
            require: 'ngModel',
            link: function(scope, element, attrs, modelCtrl) {
                var capitalize = function(inputValue) {
                    if (inputValue == undefined) inputValue = '';
                    var capitalized = inputValue.toUpperCase();
                    if (capitalized !== inputValue) {
                        // see where the cursor is before the update so that we can set it back
                        var selection = element[0].selectionStart;
                        modelCtrl.$setViewValue(capitalized);
                        modelCtrl.$render();
                        // set back the cursor after rendering
                        element[0].selectionStart = selection;
                        element[0].selectionEnd = selection;
                    }
                    return capitalized;
                };
                modelCtrl.$parsers.push(capitalize);
                capitalize(scope[attrs.ngModel]); // capitalize initial value
            }
        };
    });

    angular.module("ac.common").directive("acDecimal", ["$log", function ($log) {
        return {
            link: link,
            require: 'ngModel'
        };

        function link(scope, element, attr, ngModelCtrl) {
            function fromUser(text) {
                if (text) {
                    let transformedInput = text.replace(/[^0-9^\.]/g, '');
                    let regex = /^[0-9]*(\.[0-9]+)?$/g;

                    if (transformedInput !== text) {
                        ngModelCtrl.$setViewValue(transformedInput);
                        ngModelCtrl.$render();
                    }
                    if(regex.test(text)) {
                        ngModelCtrl.$setValidity('decimal', true);
                    } else {
                        ngModelCtrl.$setValidity('decimal', false);
                    }
                    return transformedInput;
                }
                return "";
            }
            ngModelCtrl.$parsers.push(fromUser);
            ngModelCtrl.$formatters.push(fromUser);
        }
        ;
    }]);

    angular.module("ac.common").service("ACLoader", ["$log", function ($log) {

        if (!WEBC.Modal) {
            throw new Error("Necesita el componente modal.js para usar el ACLoader.");
        }

        var self = this;
        var loader;
        var loaderUUID = WEBC.uuid();
        self.loader = function (newLoader) {
            if (newLoader) {
                loader = newLoader;
            }
            return loader;
        };

        self.show = function () {
            var loaderElement = new WEBC.Modal("Cargando", WEBC.el("div").addClasses("bg-default p-auto").addChildren(
                WEBC.el("span").addClasses("fas fa-spinner spin mr-1_2"),
                "Cargando..."
            ), [], {
                showCloseButton: false,
                showExpandButton: false
            }).addAttributes({"id": loaderUUID});
            loaderElement.classList.add("ac-modal--extra-small");
            document.body.appendChild(loaderElement);
        };

        self.remove = function () {
            var element = document.getElementById(loaderUUID);
            if (element) {
                element.eventBus.dispatchCloseModal();
            }
        };
    }]);
    angular.module("ac.common").factory("ACHttpInterceptor", ["$log", "$q", "ACLoader", function ($log, $q, ACLoader) {

        if (!WEBC.Modal) {
            throw new Error("Se necesita del componente modal.js para el uso del ACHttpInterceptor");
        }

        return {
            request: _request,
            requestError: _requestError,
            response: _response,
            responseError: _responseError
        };

        function _request(config) {
            if(config.interceptor === false) {
                return config || $q.when(config);
            }
            //$log.debug("La request fue realizada: ", config);
            if(config.loader !== false) {
                ACLoader.loader(config.url);
                ACLoader.show();
            }
            return config || $q.when(config);
        }

        function _requestError(rejection) {
            if(rejection.config.interceptor === false) {
                return $q.reject(rejection);
            }
            //$log.error("Ocurrió un error en la realización de la request: ", rejection);
            if(rejection.config.loader !== false) {
                ACLoader.remove();
            }
            return $q.reject(rejection);
        }

        function _response(response) {
            if(response.config.interceptor === false) {
                return response || $q.when(response);
            }
            //$log.debug("La response fue realizada: ", response);
            if(response.config.loader !== false) {
                ACLoader.remove();
            }
            return response || $q.when(response);
        }

        function _responseError(rejection) {
            if(rejection.config.interceptor === false) {
                return $q.reject(rejection);
            }
            //$log.error("Ocurrió un error en la respuesta: ", rejection);
            if(rejection.config.loader !== false) {
                ACLoader.remove();
            }
            if (rejection) {
                procesarMensaje(rejection);
            } else {
                enviarMensajeGenerico(rejection);
            }
            return $q.reject(rejection);
        }

        function procesarMensaje(originalRejection) {
            var rejection = angular.copy(originalRejection);

            if (rejection.config && rejection.config.responseType === "arraybuffer") {
                var strJSON = String.fromCharCode.apply(null, new Uint8Array(rejection.data));
                try {
                    rejection.data = JSON.parse(strJSON);
                } catch (e) {
                    rejection.data = e;
                }
            }

            if (rejection.headers("content-type") && rejection.headers("content-type").indexOf("application/json") !== -1) {
                return procesarMensajeJSON(rejection);
            }

            if (rejection.status === 404) {
                return procesarMensaje404(rejection);
            }

            WEBC.message("Ocurrió un error", "Ocurrió un error", {
                type: 'bg-danger',
                icon: 'times',
                onClickOnIcon: mostrarDetalle(rejection)
            });
        }

        function procesarMensajeJSON(rejection) {
            let messageFn = rejection.config.mapErrorMessage ? rejection.config.mapErrorMessage(rejection): undefined;
            let message = messageFn ? messageFn: (rejection.data.mensaje || rejection.data);

            let extraFn = rejection.config.extraInfoError ? rejection.config.extraInfoError(rejection): undefined;
            WEBC.message(message, "Ocurrió un error", Object.assign({
                type: 'bg-danger',
                icon: 'times',
                onClickOnIcon: mostrarDetalle(rejection),
                extraInfo: extraFn
            }, rejection.config.messageModal)).then( () => {
                if(rejection.config.onCloseError) {
                    rejection.config.onCloseError();
                }
            });
        }

        function procesarMensaje404(rejection) {
            WEBC.message("Ocurrió un error la dirección solicitada no fue encontrada", "Ocurrió un error", Object.assign({
                type: 'bg-danger',
                icon: 'times',
                onClickOnIcon: mostrarDetalle("Ocurrió un error la dirección " + rejection.config.url + " no fue encontrada")
            },  rejection.config.messageModal)).then( () => {
                if(rejection.config.onCloseError) {
                    rejection.config.onCloseError();
                }
            });
        }

        function enviarMensajeGenerico(rejection) {
            WEBC.message("Ocurrió un error", "Ocurrió un error", Object.assign({
                type: 'bg-danger',
                icon: 'times',
                onClickOnIcon: mostrarDetalle(rejection)
            },  rejection.config.messageModal)).then( () => {
                if(rejection.config.onCloseError) {
                    rejection.config.onCloseError();
                }
            });
        }

        function mostrarDetalle(rejection) {
            if(rejection && rejection.data && rejection.data.detalle) {
                return function () {
                    $log.debug(rejection);
                    var modal = WEBC.Modal("Errores", rejection.data.detalle);
                    document.body.appendChild(modal);
                    modal.expandModal();
                };
            }
        }
    }]);

    angular.module("ac.common").constant("Common", {
        unclosableModalConfig: {
            messageModal: {
                showCloseButton: false,
                showExpandButton: false,
                showContinueButton: false
            }
        }
    });

    angular.module("ac.common").service("DOM", ["$compile", "$rootScope", class DOM {

        constructor($compile, $rootScope) {
            this.$compile = $compile;
            this.$rootScope = $rootScope;
        }

        fromTemplate(template, $scope, $externalScope) {
            let result;
            if(!$externalScope) {
                let newScope = this.$rootScope.$new();
                Object.assign(newScope, $scope);
                result = this.$compile(template)(newScope);
            } else {
                result = this.$compile(template)($externalScope);
            }
            if(result.length > 1) {
                console.error("No se permite construir con templates de mas de un elemento, encierrelo en un div o span");
                return "";
            }
            return result[0];
        }

    }]);


    angular.module("ac.common").directive('onEnter',function() {

        let link = ($scope, $element, $attrs) => {
            $element.on("keypress", evt => {
                if(evt.which === 13) {
                    $scope.$apply(() => $scope.$eval($attrs.onEnter));
                    evt.preventDefault();
                }
            });
        };

        return {
            link
        };
    });

    angular.module("ac.common").directive('acValidate', () => {
        const NO_VALIDATE = "novalidate";
        return {
            link: ($scope, $element)  =>{
                $element[0].setAttribute(NO_VALIDATE, NO_VALIDATE);
            }
        }
    });

    angular.module("ac.common").directive('addCharacter', () => {

        return {
            restrict: 'A',
            require: 'ngModel',
            link: ($scope, $element, $attrs, $ngModel) => {
                $ngModel.$formatters.push( (value) => {
                    if(!value) return;
                    return `${value}${$attrs.addCharacter}`;
                });
            }
        }
    });

})(angular, window.logger);

;(function (angular, logger) {

    angular.module("ac.translate", ["pascalprecht.translate"]).service("translateService", _translateService);

    _translateService.$inject = ["$translate", "$q"]
    function _translateService($translate, $q) {

        self.process = function (array) {
            return $q.all(array.map(key => $translate(key).then(res=>res, res=>res) )).then( res => {
                let objPromises = {};
                array.forEach( (key, index) => {
                    objPromises[key] = res[index];
                });
                return objPromises;
            }, err => {
                logger.error("Ocurrió un error al realizar translates", err, array);
            });
        };

        return self;
    }

})(angular, window.logger);