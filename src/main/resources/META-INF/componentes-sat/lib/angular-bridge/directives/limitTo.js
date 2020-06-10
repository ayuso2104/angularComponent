/** @ngInject */
export default () => {
    let link = ($scope, $element, $attrs, $ctrl) => {
        let $ngModel = $ctrl[0];
        let limit = $attrs.limitTo;

        if(!limit) {
            console.error("No asigno un límite al campo.", $element);
            return;
        }

        $scope.$watch("ngModel", () => {
            if(!$scope.ngModel) return;

            let numberScope = Number($scope.ngModel);

            if(numberScope > limit) {
                $ngModel.$setValidity("limit", false);
            } else {
                $ngModel.$setValidity("limit", true);
            }

        });

    };

    return {
        scope: {
            "ngModel": "=ngModel"
        },
        require: ['ngModel', 'acNumber'],
        restrict: 'A',
        link
    }
}