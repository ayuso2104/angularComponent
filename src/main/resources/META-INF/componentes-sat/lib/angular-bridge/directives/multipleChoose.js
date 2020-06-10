import isEqual from 'lodash/isEqual';

export default [ "$log", "DOM", ($log, DOM) => {
    const plantilla = require("./multipleChoose.html");

    let link = ($scope, $element, $attrs, $ngModel) => {
        $element[0].classList.add("pointer");
        let span = document.createElement("span");
        span.classList.add("form-control-feedback", "no-col", "fas", "fa-list", "pointer");
        $element[0].insertAdjacentElement('afterend', span);
        span.addEventListener("mouseenter", () =>{
            if($attrs.disabled) {
                span.classList.remove("pointer");
                span.classList.add("not-allowed");
            } else {
                span.classList.add("pointer");
                span.classList.remove("not-allowed");
            }
        });


        let process = evt => $scope.$apply(() => {

            if($attrs.disabled) {
                return;
            }

            var origArray= JSON.parse(JSON.stringify($scope.multipleChoose));

            var tmpArray = $scope.multipleChoose;
            if ($scope.ngModel &&  $scope.ngModel.length > 0)
            {

                let isEqualsResult = ifArraysEquals($scope.ngModel,tmpArray);
                if(isEqualsResult === true)
                {tmpArray.length = 0;}
            }

            let $newScope = $scope.$new();
            $newScope.acSelected = $scope.ngModel;
            $newScope.ngModel = tmpArray;
            $newScope.attribute = $scope.attributeStr ? $scope.attributeStr: $scope.$eval($scope.attribute);
            $newScope.resultChanges = result => {
                if(isEqual(result, $scope.ngModel)) return;
                $scope.$apply( () => {
                    $scope.ngModel = result;
                    $scope.ngChange();
                });
            }

            let element = DOM.fromTemplate(plantilla, null, $newScope);
            let modal = new WEBC.Modal($scope.header, element, [
                {
                    text: $scope.msgClose,
                    action: () => {
                        modal.eventBus.dispatchCloseModal();
                    }
                }
            ]);
            modal.classList.add("ac-modal--small");
            document.body.appendChild(modal);

            modal.addEventListener("close-modal", evt => {
                $scope.$apply(() => {
                    $scope.multipleChoose = origArray;
                    $scope.onClose();
                })
            });

        });
        $element.bind("click", process);
        angular.element(span).bind("click", process);

        $ngModel.$formatters.push( () => ($scope.ngModel || []).map( it => {
            return $scope.attributeStr ? it[$scope.attributeStr]: ( () => {
                let attrEval = $scope.$eval($scope.attribute);
                if (typeof (attrEval) === "string") {
                    return it[attrEval];
                } else {
                    return attrEval(it);
                }
            })();
        } ).join(", "));
        
        var ifArraysEquals =  function (a1,a2)
        {
            if (a1.length !== a2.length){ return false;}
    
                if (JSON.stringify(a1) !== JSON.stringify(a2)) {
                    return false;
                }
            
            return true;
        }
    };

    return {
        restrict: 'A',
        scope: {
            multipleChoose: '=',
            ngModel: '=',
            attribute: '&',
            attributeStr: '@',
            header: '@',
            msgClose: '@',
            onClose: '&',
            ngChange: '&'
        },
        require: 'ngModel',
        link
    }
}];