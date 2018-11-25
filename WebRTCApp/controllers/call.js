(function(){
    'use strict';

    angular.module('webRTCApp')
        .controller('CallController', function($scope, $location, $rootScope, $timeout){
            $rootScope.showLoadingAnimation();

            $timeout(function(){
                $rootScope.hideLoadingAnimation(true);
            },3000);
        });
})();