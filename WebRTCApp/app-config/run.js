(function () {
    'use strict';

    angular.module('webRTCApp')
        .run(function ($rootScope, $http, $window, $location, $timeout, $document) {

            var showLoadingCount = 0;

            $rootScope.showLoadingAnimation = function () {
                showLoadingCount++;
                $rootScope.showLoading = true;
            };

            $rootScope.hideLoadingAnimation = function (forceHide) {

                if (forceHide) {
                    showLoadingCount = 0;
                } else {
                    showLoadingCount--;
                }

                if (showLoadingCount == 0) {
                    $rootScope.showLoading = false;
                }
            };
            
            $rootScope.getClass = function (entityName) {
                if ($location.path().indexOf(entityName) != -1) {
                    return "active";
                }
            }


            $rootScope.constants = {
                appName: 'WebRTCApp',
                description: ''
            };

        });
})();