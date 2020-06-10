export default ["$log", "DOM", ($log, DOM) => {

    const plantilla = require("./multipleInput.html");

    let link = ($scope, $element, $attrs, $ngModel) => {
        if(!$scope.ngModel) {
            $scope.ngModel = [];
        }

        $element.addClass("pointer");

        let span = document.createElement("span");
        span.classList.add("form-control-feedback", "no-col", "fas", "fa-edit", "pointer");
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

        let process = evt => {
            if($attrs.disabled) {
                return;
            }


            let content = DOM.fromTemplate(plantilla, {
                ngModel: $scope.ngModel,
                msgAdd: $scope.msgAdd || "Agregar",
                msgNew: $scope.msgNew || "Agregar nuevo elemento",
                msgClose: $scope.msgClose || "Aceptar",
                msgDelete: $scope.msgDelete || "Eliminar",
                msgRepeat: $scope.msgRepeat || "El elemento ya se encuentra en la lista",
                msgValidator: $scope.msgValidator || "El elemento contiene errores",
                $$contrainsInfo: $scope.$$contrainsInfo,
                multipleInputConstrains: {
                    inputForm: {
                        constrains: $attrs.allowRepeat ? "": "not-in:ngModel",
                        messages: {
                            "not-in": $scope.msgRepeat
                        }
                    }
                },
                addNewElement: function () {
                    this.multipleForm.$submitted = true;
                    if(!this.newElement) return;
                    if($scope.validator) {
                        if(!$scope.validator(this.newElement)) {
                            return;
                        }
                    }
                    if(this.multipleForm.inputForm.$invalid) {
                        return;
                    }
                    if(!this.ngModel) {
                        this.ngModel = [];
                    }
                    this.ngModel.push(this.newElement);
                    this.newElement = '';
                    $scope.ngModel = angular.copy(this.ngModel);
                    this.multipleForm.$submitted = false;
                },
                deleteElement: function () {
                    for(let i in this.itemsSelected) {
                        this.ngModel.splice(this.ngModel.indexOf(this.itemsSelected[i]) , 1);
                    }
                    $scope.ngModel = angular.copy(this.ngModel);
                }
            });

            let modal = WEBC.Modal($scope.header, content, [
                {
                    text:  $scope.msgClose,
                    action: () => modal.eventBus.dispatchCloseModal()
                }
            ]);

            modal.addEventListener('close-modal', () => $scope.onClose());
            document.body.appendChild(modal);
        };
        $element.on("click", process);
        angular.element(span).bind("click", process);

        $ngModel.$formatters.push( () =>  {
            return ($scope.ngModel || []).join(", ");
        });
    };

    return {
        /** @ngInject */
        controller: function ($scope) {
            this.$setValidation = function ($$contrainsInfo) {
                $scope.$$contrainsInfo = $$contrainsInfo;
            }
        },
        scope: {
            multipleInput: '@',
            ngModel: '=',
            header: '@',
            msgClose: '@',
            msgNew: '@',
            msgAdd: '@',
            msgValidator: '@',
            msgRepeat: '@',
            onClose: '&',
            validator: '='
        },
        restrict: 'A',
        require: 'ngModel',
        link
    }

}];