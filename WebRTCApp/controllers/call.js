(function(){
    'use strict';

    angular.module('webRTCApp')
        .controller('CallController', function($scope, $location, $rootScope, $timeout){
            $rootScope.showLoadingAnimation();

            $timeout(function(){
                $rootScope.hideLoadingAnimation(true);
            },3000);

            $scope.callToContact = (contact, index) => {
                $scope.CurrentContactIndex = index;
                $scope.CurrentContact = contact;
            };

            $scope.Contacts = [];

            var _getRandomName = () =>{
                return Math.random().toString(36);
            };

            var _generateRandomNames = (number) => {
                for(var i=0; i<number; i++){
                    $scope.Contacts.push({
                        Name : _getRandomName()
                    });
                }
            };

            var _generateRandomHash = function(){
                // Generate random room name if needed
                if (!location.hash) {
                    location.hash = Math.floor(Math.random() * 0xFFFFFF).toString(16);
                }
                return location.hash.substring(1);
            };

            //#region Handle Functions

            var _onError = function(result) {
                window.alert("An error occurred!\n"+result);
            };

            var _onSuccess = function(result){
                console.log("Success!");
            };

            var _sendMessage = function(message){
              $scope.entity.drone.publish({
                  room: $scope.entity.room,
                  message
              });  
            };

            //#endregion

            //#region Constructor
            var _constructor = function(){
                // ScaleDrone webrtc_channel
                var entity = {};
                entity.drone = new ScaleDrone('wRIpraeA5bQ2Q5zh');
                entity.roomName = 'observable-'+_generateRandomHash();
                entity.configuration = {
                    iceServers: [{
                        urls: 'stun:stun.l.google.com:19302'
                    }]
                };

                entity.drone.on('open',function(result){
                    if(result){
                        _onError(result);
                    }

                    entity.room = entity.drone.subscribe(entity.roomName);
                    entity.room.on('open', function(result){
                        if(result){
                            _onError(result);
                        }
                    })
                    entity.room.on('members', function(result){
                        // var hasMultiple = result.length > 1;
                        var newContactsList = [];
                        result.forEach(function(e){
                            newContactsList.push({
                                Name: e.id
                            });
                        });
                        $scope.Contacts = newContactsList;
                    });
                });


                $scope.entity = entity;
            };

            _constructor();
            
            //#endregion
            // _generateRandomNames(20);
        });
})();