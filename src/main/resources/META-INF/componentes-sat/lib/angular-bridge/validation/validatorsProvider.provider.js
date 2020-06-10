import includes from 'lodash/includes';
import isNumber from 'lodash/isNumber';
import toString from 'lodash/toString';

export default () => {
    let syncValidators = {};
    let asyncValidators = {};
    
    return {
        addValidator: (name, fn) => syncValidators[name] = fn,
        addAsyncValidator: (name, fn) => asyncValidators[name] = fn,
        /** @ngInject */
        $get: ($q, $timeout, $parse, $rootScope) => {

            let defaultSyncValidators = {
                min: minValue => (modelValue, viewValue) => {
                    let value = modelValue || viewValue;
                    if(!value) return true;
                    return Number(value) >= minValue;
                },
                max: maxValue => (modelValue, viewValue) => {
                  let value = modelValue || viewValue;
                  if(!value) return true;
                  return Number(value) <= Number(maxValue)
                },
                number: () => (modelValue, viewValue) => {
                    let value = modelValue || viewValue;
                    if(!value) return true;
                    return !isNaN(Number(value));
                },
                pattern: pattern => (modelValue, viewValue) => {
                    let value = modelValue || viewValue;
                    if(!value) return true;
                    return toString(value).match(pattern);
                },
                required: () => (modelValue, viewValue) => {
                    let value = modelValue || viewValue;
                    return !!value;
                },
                'in': (collection, { $ngForm , $scope }) => (modelValue, viewValue) => {
                    let value = modelValue || viewValue;
                    if(!value) return true;
                    return includes(collection, value);
                },
                'not-in': (...args) => (...values) => {
                    let value = values[0] || values[1];
                    if(!value) return true;
                    return !defaultSyncValidators.in(...args)(...values);
                },
                'required-when': (campo, { $ngForm, $field }) => {
                    $rootScope.$watch(() => $ngForm[campo] && $ngForm[campo].$modelValue, () => $field.$validate());
                    return (modelValue, viewValue) => {
                        let value = modelValue || viewValue;
                        let campoValue = ($ngForm[campo] || {}).$modelValue || ($ngForm[campo] || {}).$modelValue;
                        if(campoValue) {
                            return value;
                        }
                        return true;
                    }
                },
                'required-when-not-empty': (campo, { $ngForm, $field }) => {
                    $rootScope.$watch(() => $ngForm[campo] && $ngForm[campo].$modelValue, () => $field.$validate());
                    return (modelValue, viewValue) => {
                        let value = modelValue || viewValue;
                        let campoValue = ($ngForm[campo] || {}).$modelValue || ($ngForm[campo] || {}).$modelValue;
                        if(campoValue && campoValue.length > 0) {
                            return Boolean(value);
                        }
                        return true;
                    }
                }
            };

            let defaultAsyncValidators = {
            };

            return {
                asyncValidators: Object.assign(defaultAsyncValidators, asyncValidators),
                syncValidators: Object.assign(defaultSyncValidators, syncValidators)
            }
        }
    }
}