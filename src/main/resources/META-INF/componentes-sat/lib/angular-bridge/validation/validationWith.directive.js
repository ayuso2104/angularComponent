import tail from 'lodash/tail';
import head from 'lodash/head';
import WEBC from './../../components/common';

let setClasses = (parentElement, formCtrl, inputCtrl) => {
    if(formCtrl.$submitted) {
        if (inputCtrl.$valid) {
            parentElement.classList.add("has-success");
            parentElement.classList.remove("has-error");
        } else {
            parentElement.classList.add("has-error");
            parentElement.classList.remove("has-success");
        }
    } else {
        parentElement.classList.remove("has-error");
        parentElement.classList.remove("has-success");
    }
};

let appendMessagesField = (formCtrl, scopeForm, $ngModel, messages, $element, $compile) => {
    let template = `<div ng-messages='${formCtrl.$name}["${$ngModel.$$attr.name}"].$error' ng-if="${formCtrl.$name}.$submitted" ng-hide="$scope.matchValidator.${formCtrl.$name}.hideMessages">`;
    for(let messageKey in messages) {
        if(messageKey === "otherwise") {
            template += `<div ng-message-default class="text-danger">${messages[messageKey]}</div>`;
        } else {
            template += `<div ng-message="${messageKey}" class="text-danger">${messages[messageKey]}</div>`;
        }
    }
    template += "</div>";
    let elementMessages = $compile(template)(scopeForm);
    $element[0].insertAdjacentElement('afterend', elementMessages[0]);
};

let addBehavior = (field, structure, $ngForm, validators, behaviors, $scope, $parse) => {
    let behavior = structure.behavior;
    Object.keys(behavior).forEach(behaviorKey => {
        if(behaviors.behaviorsFormatters.hasOwnProperty(behaviorKey)) {
            field.$formatters.push(behaviors.behaviorsFormatters[behaviorKey](field, behavior[behaviorKey], { $ngForm }))
        } else {
            console.error("No existe un comportamiento para ", behaviorKey);
        }
    });

    Object.keys(behavior).forEach(behaviorKey => {
        if(behaviors.behaviorsParsers.hasOwnProperty(behaviorKey)) {
            field.$parsers.push(behaviors.behaviorsParsers[behaviorKey](field, behavior[behaviorKey], { $ngForm }))
        } else {
            console.error("No existe un comportamiento para ", behaviorKey);
        }
    });
};

let addValidations = (field, structure, $ngForm, validators, behaviors, $scope, $parse) => {

    if(structure.behavior) {
        addBehavior(field, structure, $ngForm, validators, behaviors, $scope, $parse);
    }

    let validationsString = structure.constrains;
    if(!validationsString) return;
    let validations = validationsString.split("|");

    validations.forEach( validation => {
        let parts = validation.split(":");
        let validatorKey = head(parts);
        let args = tail(parts);
        let argsParsed = args.map( (arg) =>  $parse(arg)($scope));
        argsParsed.push({
            $ngForm,
            $field: field,
            $scope
        });

        if(validators.syncValidators.hasOwnProperty(validatorKey)) {
            let validationFn = validators.syncValidators[validatorKey].apply($scope, argsParsed);
            field.$validators[validatorKey] = validationFn;
            return;
        }

        if(validators.asyncValidators.hasOwnProperty(validatorKey)) {
            let validationFn = validators.asyncValidators[validatorKey].apply($scope, argsParsed);
            field.$asyncValidators[validatorKey] = validationFn;
            return;
        }

        return console.error("No existe un validador para: ", validatorKey);
    });
};

/** @ngInject */
export function matchValidator($compile, $timeout, $parse, validators, behaviors) {

    return {
        link: function($scope, $element, $attrs, $ngModel) {
            if($scope.matchValidator) {
                let formCtrl = $ngModel.$$element.controller("form");
                let scopeForm = formCtrl.$$element.scope();
                addValidations($ngModel, $scope.matchValidator, formCtrl, validators, behaviors, $scope.matchValidator.$parentScope, $parse);

                appendMessagesField(formCtrl, scopeForm, $ngModel, $scope.matchValidator.messages, $element, $compile);

                let parentElement = WEBC.findParent($element[0], parentProspect => parentProspect.classList.contains("form-group"));
                let inputCtrl = formCtrl[$element.attr("name")];

                if(parentElement) {
                    //scopeForm.$watch(() => inputCtrl.$viewValue, () => setClasses(parentElement, formCtrl, inputCtrl));
                    scopeForm.$watchCollection(() => inputCtrl.$error, () => setClasses(parentElement, formCtrl, inputCtrl));
                    scopeForm.$watch(() => formCtrl.$submitted, () => setClasses(parentElement, formCtrl, inputCtrl));
                }
            }
        },
        scope: {
            matchValidator: '='
        },
        require: 'ngModel'
    }
}


/** @ngInject */
export default ($log, $timeout, $compile, $parse, validators, behaviors) => ({

    link: ($scope, $element, $attrs, $ngForm) => {
        $timeout(() => {
            let structure = $scope.$eval($attrs.validationWith) || {};

            Object.keys($ngForm).filter(key => !key.startsWith("$")).forEach( key => {
                if(!structure.hasOwnProperty(key)) return;

                let field = $ngForm[key];

                addValidations(field, structure[key], $ngForm, validators, behaviors, $scope, $parse);
                appendMessagesField($ngForm, $scope, field, structure[key].messages, field.$$element, $compile);

                let parentElement = WEBC.findParent(field.$$element[0], parentProspect => parentProspect.classList.contains("form-group"));

                if(parentElement) {
                    //scopeForm.$watch(() => inputCtrl.$viewValue, () => setClasses(parentElement, formCtrl, inputCtrl));
                    $scope.$watchCollection(() => field.$error, () => setClasses(parentElement, $ngForm, field));
                    $scope.$watch(() => $ngForm.$submitted, () => setClasses(parentElement, $ngForm, field));
                }

                let internals = (structure[key] || {}).internals;
                if(internals) {

                    Object.keys(internals).forEach(function (internalKey) {
                        let internalInputCtrl = field.$$element.controller(internalKey);
                        internalInputCtrl.$setValidation({
                            ...internals[internalKey],
                            $parentScope: $scope
                        });
                    });
                }

                $timeout(() => field.$validate());
            });
        });
    },
    require: '^form',
    restrict: 'A'
})