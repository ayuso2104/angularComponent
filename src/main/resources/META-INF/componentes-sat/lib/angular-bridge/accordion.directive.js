;
(function (angular, AccordionTab, uuid, el) {
    "use strict";

    angular.module("ac.accordion", []);

    angular.module("ac.accordion").service("acAccordionService", _acAccordionService);

    _acAccordionService.$inject = [];

    function _acAccordionService() {
        var self = this;

        self.register = _register;
        self.closeAllOfParentExcept = _closeAllOfParentExcept;

        var accordionMap = {};

        function _register(accordionParentName, accordionName, accordion) {
            if (!accordionMap.hasOwnProperty(accordionParentName)) {
                accordionMap[accordionParentName] = {};
            }

            accordionMap[accordionParentName][accordionName] = accordion;
        }

        function _closeAllOfParentExcept(accordionParentName, accordionNameKeepOpen) {
            Object.keys(accordionMap[accordionParentName]).forEach(function (accordionName) {
                if(accordionNameKeepOpen === accordionName) return;
                accordionMap[accordionParentName][accordionName].close();
            });
        }

    }

    angular.module("ac.accordion").directive("acAccordion", _acAccordion);

    _acAccordion.$inject = ["acAccordionService", "$timeout"];

    function _acAccordion(acAccordionService, $timeout) {
        return {
            scope: false,
            link: link,
            transclude: true
        };

        function link(scope, element, attrs, ctrl, $transclude) {

            $timeout( () => $transclude(scope, function (content) {
                var accordionName = attrs.acAccordion || uuid();
                var accordionParentName = attrs.parent || uuid();
                var title = scope.$eval(attrs.header);

                var contentWrapper = el("div").addClasses("accordion-wrapper");

                Array.from(content).forEach(function (element) {
                    contentWrapper.addChildren(element);
                });

                var accordion = new AccordionTab(contentWrapper, title);
                element[0].appendChild(accordion);

                acAccordionService.register(accordionParentName, accordionName, accordion);

                accordion.addEventListener("accordion-open", function () {
                    acAccordionService.closeAllOfParentExcept(accordionParentName, accordionName);
                });

            }));
        }
    }

})(angular, WEBC.AccordionTab, WEBC.uuid, WEBC.el);