(function () {
    'use strict';

    angular.module('webRTCApp')
        .controller('PageNotFoundController', function ($rootScope) {
            $rootScope.hideLoadingAnimation(true);
        });
})();