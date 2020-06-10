(function() {
    'use strict';
    angular.module('bindHtml',[]).directive('bindHtmlCompile', _bindHtmlCompile);

    _bindHtmlCompile.$inject = ['$compile'];

    function _bindHtmlCompile($compile) {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                scope.$watch(function() {
                    return scope.$eval(attrs.bindHtmlCompile);
                }, function(value) {
                    element.html(value );
                    var scopeExterno = scope.$eval(attrs.bindHtmlScope);

                    if(scopeExterno){
                      angular.extend(scope, scopeExterno);
                    }
                    
                    $compile(element.contents())(scope);
                });
            }
        };
    }
})();
