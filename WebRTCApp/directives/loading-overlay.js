(function () {
    'use strict';

    angular.module('webRTCApp')
        .directive('loadingOverlay', function () {
            return {
                restrict: 'E',
                scope:{
                    withText: '=?'
                },
                controller: function($scope){
                    if($scope.withText == undefined || $scope.withText == null){
                        $scope.withText = true;
                    }
                },
                templateUrl: 'views-directives/loading-overlay.html'
            }
        });
})();