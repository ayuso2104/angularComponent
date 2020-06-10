/** @ngInject */
export default () => {

    let link = ($scope, $element, $attrs, $ngModel) => {
        function fromUser(text) {
            if (text) {
                text = String(text);
                var transformedInput = text.replace(/[^A-Za-z0-9]/g, '');

                if (transformedInput !== text) {
                    $ngModel.$setViewValue(transformedInput);
                    $ngModel.$render();
                }
                return transformedInput;
            }
            return "";
        }
        $ngModel.$parsers.push(fromUser);
        $ngModel.$formatters.push(fromUser);
    };

    return {
        restrict: 'A',
        require: 'ngModel',
        link
    }
}