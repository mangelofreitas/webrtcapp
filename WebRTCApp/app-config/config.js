(function () {
    'use strict';

    angular.module('webRTCApp')
        .config(function ($routeProvider, $locationProvider, $injector) {

            var _getRoute = function (entityName, controller, fileName) {
                return {
                    templateUrl: 'views/' + entityName + '/' + fileName,
                    controller: controller,
                    resolve: {
                        entityName: function () { return entityName; }
                    }
                };
            };

            $locationProvider.hashPrefix('');

            $routeProvider
                .when('/', { redirectTo: '/call' })
                .when('/call', _getRoute('call', 'CallController', 'index.html'))
                .when('/error', _getRoute('/error', 'ErrorController', 'index.html'))
                .when('/page-not-found', _getRoute('pageNotFound', 'PageNotFoundController', 'index.html'))
                .otherwise({ redirectTo: '/page-not-found' });
        });
})();