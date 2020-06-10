(function() {
'use strict';
angular.module('botonCircular', ['focus', 'ckeditor', 'primeModule'])
    .controller('botonCircularModalModificarEtiquetaController', _botonCircularModalModificarEtiquetaController)
    .directive('botonCircular', _botonCircular);

_botonCircular.$inject = ['$timeout', 'uiModal','$compile', '$controller','$rootScope'];

function _botonCircular($timeout, uiModal, $compile,$controller,$rootScope) {
    return {
        require: 'ngModel',
        link: _link,
        scope: {
            titulo: '@',
            ngModel: '=',
            etiqueta: '=',
            ngClick: '&',
            tooltip : '@tooltip',
        },
        template: '<div title="{{tooltip}}" class="boton-circular text-center"> <div class="boton-circular-content" ng-show="boton.mostrar"> <div ng-switch on="seleccion"> <div ng-switch-when="texto"></div><div ng-switch-when="numero"> <input type="text" class="form-control " ng-model="boton.modelo" ng-blur="onPerderFocus(boton.modelo)" focus-if="boton.mostrar" focus-delay="10" entero> </div><div ng-switch-when="moneda"> <input type="text" class="form-control " ng-model="boton.modelo" ng-blur="onPerderFocus(boton.modelo)" focus-if="boton.mostrar" focus-delay="10" min="0" moneda> </div><div ng-switch-when="fecha"> <input type="text" class="form-control" uib-datepicker-popup="dd-MM-yyyy" ng-model="boton.modelo" ng-change="onPerderFocus(boton.modelo)" is-open="boton.mostrar" ng-click="boton.mostrar=true" readonly=""/> <div ng-switch-default> </div></div></div></div><div ng-class="(boton.modelo==null || boton.modelo==undefined || boton.modelo==\'\') ? \'etiquetaVacia\' : \'etiquetaCapturada\'" ng-if="!boton.mostrar" ng-click="click(boton.modelo)"> </div><p class="titulo">{{titulo}}</p></div>'
        			
    };

    function _link(scope, element, attrs, ngModelCtrl, transclude) {
        scope.modificarEtiqueta = {
         
          ckeditor: {

          }
        };
        
        scope.seleccion = attrs.tipo;
        scope.onPerderFocus = _onPerderFocus;
        scope.click = _click;
        scope.boton = {
            mostrar: false
        };
        scope.boton.modelo = scope.ngModel;

        
      
        function _click(modelo) {

            scope.boton.mostrar = true;
            if (scope.ngClick && (typeof scope.ngClick) === 'function') {
                scope.ngClick(modelo);
            }
            if (attrs.tipo === 'texto') {
                if (!scope.etiqueta) {
                    throw Error('No se encuentra el Objeto Etiqueta para abrir el editor CKEditor');
                }
                uiModal.set('etiqueta', scope.etiqueta);

                var promise = uiModal.abrir('botonCircularModalModificarEtiqueta');

                promise.then(function() {
                    var resultado = uiModal.get('resultado') || {};
                    var _contenido = resultado.contenido;
                    if (_contenido) {
                        _contenido = _contenido.split(' ').join('');
                        _contenido = _contenido.replace(/(\r\n|\n|\r|\t)/gm, '');

                    }
                    if (_contenido === '<html><head><title></title></head><body></body></html>') {
                        _contenido = null;
                    }
                    scope.boton.modelo = _contenido;

                    _onPerderFocus(_contenido);

                });
            }
        }





        function _onPerderFocus(modelo) {
            scope.boton.mostrar = false;
        }

    }
}

// Controller modal


_botonCircularModalModificarEtiquetaController.$inject = ['$scope', 'uiModal','CKCONFIG'];

function _botonCircularModalModificarEtiquetaController($scope, uiModal,CKCONFIG) {


    uiModal.onOpen('botonCircularModalModificarEtiqueta', _abrirModal);
    var _etiqueta = null;
    $scope.modificarEtiqueta = {        
        ckeditor: {
        	config : CKCONFIG.configBotonCircular,
        	
        	data :''
        }
    };
    
    
    

     
    $scope.aceptar = _aceptar;


    /* Funciones */
    function _abrirModal() {

        _inicio();
        _etiqueta = uiModal.get('etiqueta');
        //console.log('--etiqueta--', _etiqueta);
        var _tipo = _etiqueta.tipo;
        //var _toolBar = _herramientasDisponibles(_tipo);
        //$scope.modificarEtiqueta.botones = _toolBar;
       
        $scope.modificarEtiqueta.ckeditor.data = _etiqueta.contenido;
        
        //console.log($scope.modificarEtiqueta.ckeditor.data);
        

    }

    
       

    function _aceptar(contenido) {
    	//console.log('Contenido', contenido);
        //console.log('Etiqueta Aceptar', _etiqueta);
        _etiqueta.contenido = contenido;
        uiModal.set('resultado', _etiqueta);
        uiModal.cerrar('botonCircularModalModificarEtiqueta');
    }

    function _inicio() {
        _etiqueta = null;
        }
}
})
();
