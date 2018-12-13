(function () {
    'use strict';

    angular.module('webRTCApp')
        .directive('roomCodeWindow', function () {
            return {
                restrict: 'E',
                scope:{
                    openWindowName: '@',
                    onSave: '='
                },
                controller: function($scope, $location){

                    var _close = function(){
                        $('#roomWindow').modal("hide");
                        $('body').removeClass('modal-open');
                        $('.modal-backdrop').remove();
                    };

                    var _open = function(){
                        $('#roomWindow').modal("show");
                    };
                    
                    var _hasHash = function(){
                        return $location.hash() ? true : false;
                    };

                    $scope.hasHash = _hasHash;

                    $scope.submit = function($event, entity){
                        _close();
                        $scope.onSave(entity);
                    };

                    if($scope.openWindowName){
                        $scope.$parent[$scope.openWindowName] = function(){
                            $scope.entity = {
                                roomCode: $location.hash()
                            };
                            _open();
                        }
                    }
                },
                templateUrl: 'views-directives/room-code-window.html'
            }
        });
})();