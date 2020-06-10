;
(function (document, angular, WEBC, uuid) {
    "use strict";

    angular.module("ac.modal", []);
    angular.module("ac.modal").directive("acModal", _acModal);
    angular.module("ac.modal").directive("acOpenModalFor", _acOpenModalFor);
    angular.module("ac.modal").directive("acCloseModalFor", _acCloseModalFor);
    angular.module("ac.modal").service("acModalService", _acModalService);
    angular.module("ac.modal").run([ "$rootScope", "$location", "acModalService", function($rootScope, $location, acModalService){
        $rootScope.$on('$locationChangeSuccess', function() {
            if($location.path()) {
                $rootScope.beforeLocation = $rootScope.actualLocation;
                $rootScope.actualLocation = $location.path();
            }
        });

        $rootScope.$watch(function () {return $location.path()}, function (newLocation) {
            if($location.path() && ($rootScope.actualLocation === newLocation && $rootScope.beforeLocation != newLocation)) {
                acModalService.closeAll();
            }
        });
    }]);


    _acModalService.$inject = ["$rootScope"];

    function _acModalService($rootScope) {
        var self = this;

        var modals = {};

        self.register = function (name, fnElement, id, title, config) {
            modals[name] = { 
                fnElement: fnElement,
                uuid: uuid(),
                id: id,
                title: title,
                config: config || {}
            };
        };

        self.open = function (name, config, footerElements) {
            config = config || {};
            if(!modals.hasOwnProperty(name)) {
                throw new Error("Este nombre de modal no existe: " + name);
            }

            modals[name].fnElement().then(function (element) {
                let modal = new WEBC.Modal(modals[name].title || "", element, footerElements);

                if(modals[name].config.classes  && modals[name].config.classes.length > 0) {
                    modals[name].config.classes.forEach( clazz => modal.addClasses(clazz));
                }

                modal.eventBus.onCloseModal( evt => {
                    if(config.onClose) {
                        config.onClose(evt.detail);
                    }
                });
                document.body.appendChild(modal.addAttributes({ "id": modals[name].uuid }));
                modals[name].modalContainer = modal;

                if(config.expanded) {
                    modal.eventBus.dispatchExpandModal();
                }
            }, function (err) {
                console.error("Ocurrio un error al montar el modal: ", err);
            });
        };
        
        self.close = function (name) {
            if(!modals.hasOwnProperty(name)) {
                throw new Error("Este nombre de modal no existe: " + name);
            }
            modals[name].modalContainer.eventBus.dispatchCloseModal();
            delete modals[name].modalContainer;
        };

        self.closeAll = function () {
            Object.keys(modals).forEach( key => {
                modals[key].modalContainer ? modals[key].modalContainer.eventBus.dispatchCloseModal(): angular.noop();
            });
            modals = {};
            Array.from(document.querySelectorAll(".ac-modal-container")).map( modal => modal.eventBus.dispatchCloseModal());
        };

        return self;
    }


    _acOpenModalFor.$inject = ["acModalService"];

    function _acOpenModalFor(acModalService) {

        return {
            restrict: 'A',
            scope: {
                'acOpenModalFor': '@acOpenModalFor'
            },
            link: link
        };

        function link(scope, element) {
            element[0].addEventListener("click", function () {
                acModalService.open(scope.acOpenModalFor);
            });
        }

    }
    
    _acCloseModalFor.$inject = ["acModalService"];

    function _acCloseModalFor(acModalService) {

        return {
            restrict: 'A',
            scope: {
                'acCloseModalFor': '@acCloseModalFor'
            },
            link: link
        };

        function link(scope, element) {
            element[0].addEventListener("click", function () {
                acModalService.close(scope.acCloseModalFor);
            });
        }

    }

    _acModal.$inject = ["acModalService", "$q"];

    function _acModal(acModalService, $q) {
     
        return {
            restrict: 'A',
            transclude: true,
            link: link
        };

        function link (scope, element, attrs, ctrl, $transclude) {
            if(!attrs.acModal) {
                throw new Error("Asigne un nombre al elemento modal acModal='nombre'");
            }
            let classes = angular.copy(Array.from(element[0].classList));
            element[0].classList.add("none");
            acModalService.register(attrs.acModal, function () {
                var defer = $q.defer();
                $transclude(scope, function (transclude) {
                    var div = document.createElement("div");
                    Array.from(transclude).forEach(function (elem) {
                        div.appendChild(elem);
                    });
                    defer.resolve(div);
                }, scope.$id);
                return defer.promise;
            }, scope.$id, attrs.title, {
                classes: classes
            });
        }
        
    }

})(document, angular, WEBC, WEBC.uuid);