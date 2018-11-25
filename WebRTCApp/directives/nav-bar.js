(function(){
    'use strict';

    angular.module('webRTCApp')
        .directive('navBar', function(){
            return{
                restrict: 'E',
                scope:{
                    getClass: '='
                },
                templateUrl: 'views-directives/nav-bar.html'
            }
        });
})();