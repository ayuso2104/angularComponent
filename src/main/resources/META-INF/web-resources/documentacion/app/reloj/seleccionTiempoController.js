(function(){
  angular.module('documentacion').controller('seleccionTiempoController', _relojController);

  _relojController.$inject = ['$scope'];

  function _relojController($scope){
    $scope.modelo = new Date();

    $scope.onCambioTiempo = _onCambioTiempo;

    function _onCambioTiempo(fecha, hora, minutos){
      console.log('--Fecha--',fecha);
      console.log('--hora--',hora);
      console.log('--minutos--',minutos);
    }
  }


})();
