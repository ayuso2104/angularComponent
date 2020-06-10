import './componentes-sat';

import _ from 'lodash';
import "angular";

import "./angular/angular-translate";
import "./angular/angular-translate-loader-url";
import "./angular/angular-ui-router";
import "./angular/angular-messages";

import "./angular-bridge/common.module";
import "./angular-bridge/date.directive";
import "./angular-bridge/table.directive";
import "./angular-bridge/selector-multiple.directive";
import "./angular-bridge/selector.directive";
import "./angular-bridge/modal.directive";
import "./angular-bridge/accordion.directive";

import listaACadena from './angular-bridge/directives/listaACadena';
import multipleChoose from './angular-bridge/directives/multipleChoose';
import multipleInput from './angular-bridge/directives/multipleInput';
import selectSearch from './angular-bridge/directives/selectSearch';
import filterOrder from './angular-bridge/filterOrder';

import acName from './angular-bridge/directives/acName';
import limitTo from './angular-bridge/directives/limitTo';
import validationWith from './angular-bridge/validation/validationWith.directive';
import validationService from './angular-bridge/validation/validationService.service';
import validatorsProvider from './angular-bridge/validation/validatorsProvider.provider';
import behaviorProvider from './angular-bridge/validation/behaviorProvider.provider';
import { matchValidator } from './angular-bridge/validation/validationWith.directive';

angular.module("ac.common").directive('listaACadena', listaACadena)
    .filter('filterOrder', filterOrder)
    .directive('multipleChoose', multipleChoose)
    .directive('multipleInput', multipleInput)
    .directive('selectSearch', selectSearch)
    .directive('acName', acName)
    .directive('limitTo', limitTo)
    .directive('validationWith', validationWith)
    .service('validationService', validationService)
    .provider('validators', validatorsProvider)
    .provider('behaviors', behaviorProvider)
    .directive('matchValidator', matchValidator)
    .run( ($rootScope, AppConfig) => {
        $rootScope.App = AppConfig;
        _.mergePropValues = (value, ...args) => _.join(_.map(args, (prop) => _.get(value, prop)), ' - ');
        _.mergePropFn = (...props) => (obj) => _.mergePropValues.apply(_, [obj, ...props]);
        _.someIsEmpty = (...collections) => _.some(_.map(collections, _.isEmpty))
        $rootScope._ = _;
    })
    /** @ngInject */
    .directive("telefono", () => {
        return {
            require: 'ngModel',
            link: ($scope, $element, $attrs, $ngModel) => {

                let createTel = val => {
                    let mask = "(___) ___ ____";
                    for(let index in val) {
                        mask = mask.replace(/_/i, val[index]);
                    }
                    return mask.replace(/_/g, "");
                };

                let converNum = value => {
                    if(!value) return;
                    let newValue = value.replace(/[^0-9]/g, "");
                    $ngModel.$viewValue = createTel(newValue);
                    $ngModel.$render();
                    return newValue;
                };

                $ngModel.$parsers.push(converNum);
                $ngModel.$formatters.push(value => {
                    if(!value) return;
                    let newValue = value.replace(/[^0-9]/g, "");
                    return createTel(newValue);
                });
            }
        }
    })
    /** @ngInject */
    /*.directive("multipleInput", ($compile, $timeout) => {

        return {
            controller: function ($scope) {
                this.$setValidation = function ($$contrainsInfo) {
                    $scope.$$contrainsInfo = $$contrainsInfo;
                }
            },
            require: 'ngModel',
            scope: {
                ngModel: '='
            },
            link: ($scope, $element, $attrsm, $ngModel) => {
                $timeout(() => {
                    let content = $compile("<input ng-model='ngModel' match-validator='$$contrainsInfo'/>")($scope);
                    document.body.appendChild(content[0]);
                });
            }
        };
    });*/
