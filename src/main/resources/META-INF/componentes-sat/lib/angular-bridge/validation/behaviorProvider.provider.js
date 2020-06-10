import toNumber from 'lodash/toNumber';
import toString from 'lodash/toString';
import filter from 'lodash/filter';
import toArray from 'lodash/toArray';
import join from 'lodash/join';
import isNil from 'lodash/isNil';
import toUpper from 'lodash/toUpper';


function canBeNumber(character) {
    return (/^[0-9]$/).test(character);
}

function removeNonNumeric(value) {
    return join(filter(toArray(value), canBeNumber), "");
}

function removeInitialZero(value) {
    while(value.startsWith("0")) {
        value = value.substring(1);
    }
    return value;
}

function removeIfPassLimit(value, limit) {
    return value.length > limit ? value.slice(0, limit): value;
}


export default () => {
    let behaviorsFormatters = {};
    let behaviorsParsers = {};

    return {
        addBehaviorFormatter: (name, fn) => behaviorsFormatters[name] = fn,
        addBehaviorParser: (name, fn) => addBehaviorParser[name] = fn,
        /** @ngInject */
        $get: () => {

            let behaviorsFormatters = {
                'number': ($field, value) => () => {
                    // validation de value
                    if(isNil($field.$modelValue)) {
                        return "";
                    }

                    // Retornar model value
                    let $viewValue = removeInitialZero(removeNonNumeric(toString($field.$modelValue)));
                    $field.$modelValue = toNumber($viewValue);
                    return $viewValue;
                },
                'digits-string': ($field, value) => () => {
                    // validation de value
                    if(isNil($field.$modelValue)) {
                        return "";
                    }

                    // Retornar model value
                    let $viewValue = removeNonNumeric(toString($field.$modelValue));
                    $field.$modelValue = $viewValue;
                    return $viewValue;
                },
                'limit-to': ($field, value) => () => {
                    // validation de value
                    if(isNil($field.$modelValue)) {
                        return "";
                    }

                    // Retornar model value
                    let $viewValue = removeIfPassLimit($field.$modelValue, value());
                    $field.$modelValue = $viewValue;
                    return $viewValue;
                },
                'upper': $field => () => {

                    // validation de value
                    if(isNil($field.$modelValue)) {
                        return "";
                    }

                    let $viewValue = toUpper($field.$modelValue);
                    $field.$modelValue = $viewValue;
                    return $viewValue;
                }
            };

            let behaviorsParsers = {
                'number': ($field, args) => () => {
                    // recuperar el view value
                    let currentViewValue = $field.$viewValue;

                    //validation de value
                    if(!currentViewValue) {
                        if($field.$viewValue !== "") {
                            $field.$setViewValue("");
                            $field.$render();
                        }
                        return 0;
                    }

                    //Cambiar el viewValue
                    let valueWithoutNumbers = removeInitialZero(removeNonNumeric(currentViewValue));
                    if(valueWithoutNumbers !== $field.$viewValue) {
                        $field.$setViewValue(valueWithoutNumbers);
                        $field.$render();
                    }

                    return toNumber(valueWithoutNumbers);
                },
                'digits-string': ($field, args) => () => {
                    // recuperar el view value
                    let currentViewValue = $field.$viewValue;

                    //validation de value
                    if(!currentViewValue) {
                        if($field.$viewValue !== "") {
                            $field.$setViewValue("");
                            $field.$render();
                        }
                        return "";
                    }

                    //Cambiar el viewValue
                    let valueWithoutNumbers = removeNonNumeric(currentViewValue);
                    if(valueWithoutNumbers !== $field.$viewValue) {
                        $field.$setViewValue(valueWithoutNumbers);
                        $field.$render();
                    }

                    return valueWithoutNumbers;
                },
                'limit-to': ($field, args) => () => {
                    // recuperar el view value
                    let currentViewValue = $field.$viewValue;

                    //validation de value
                    if(!currentViewValue) {
                        if($field.$viewValue !== "") {
                            $field.$setViewValue("");
                            $field.$render();
                        }
                        return "";
                    }

                    // cambiar el view value
                    let valueLimited = removeIfPassLimit(currentViewValue, args());
                    if(valueLimited !== $field.$viewValue) {
                        $field.$setViewValue(valueLimited);
                        $field.$render();
                    }
                    // retornar el model value, iempre debe ser una copia
                    return valueLimited;
                },
                'upper': ($field) => () => {

                    if(!$field.$viewValue) {
                        $field.$setViewValue("");
                        $field.$render();
                        return "";
                    }

                    let viewUpper = toUpper($field.$viewValue);
                    if(viewUpper !== $field.$viewValue) {
                        $field.$setViewValue(viewUpper);
                        $field.$render();
                    }

                    return viewUpper;
                }
            };

            return {
                behaviorsFormatters,
                behaviorsParsers
            };
        }
    }
}