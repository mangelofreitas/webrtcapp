(function () {
    'use strict';

    angular.module('webRTCApp')
        .controller('ErrorController', function ($rootScope) {
            $rootScope.hideLoadingAnimation(true); 
        });
})();