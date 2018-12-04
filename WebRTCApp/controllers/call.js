(function(){
    'use strict';

    angular.module('webRTCApp')
        .controller('CallController', function($scope, $location, $rootScope, $timeout){
            $rootScope.showLoadingAnimation();

            $timeout(function(){
                $rootScope.hideLoadingAnimation(true);
            },3000);

            

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
                
                if (!$location.hash()) {
                    $location.hash(Math.floor(Math.random() * 0xFFFFFF).toString(16));
                }
                return $location.hash();
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
                  room: $scope.entity.roomName,
                  message
              });  
            };

            //#endregion

            var _localDescCreated = function(desc){
                $scope.entity.pc.setLocalDescription(desc,function(){
                    _sendMessage({'sdp': $scope.entity.pc.localDescription})
                },_onError);
            };

            var _startCall = function(signal){
                var entity = $scope.entity;
                entity.pc = new RTCPeerConnection(entity.configuration);
                entity.pc.onicecandidate = function(e){
                    if(e.candidate){
                        _sendMessage({'candidate': e.candidate});
                    }
                };
                if(signal){
                    entity.pc.onnegotiationneeded = function(){
                        entity.pc.createOffer().then(_localDescCreated).catch(_onError);
                    };
                }

                entity.pc.onaddstream = function(e){
                    remoteVideo.srcObject = e.stream;
                };

                navigator.mediaDevices.getUserMedia({
                    audio: true,
                    video: true
                }).then(function(result){
                    localVideo.srcObject = result;
                    entity.pc.addStream(result);
                },_onError);

                entity.room.on('data', function(message, client){
                    if(client.id  === entity.drone.clientId){
                        return;
                    }

                    if(message.sdp){
                        entity.pc.setRemoteDescription(new RTCSessionDescription(message.sdp), function(){
                            if(entity.pc.remoteDescription.type == "offer"){
                                entity.pc.createAnswer().then(_localDescCreated).catch(_onError);
                            }
                        }, _onError);
                    } else if(message.candidate){
                        entity.pc.addIceCandidate(new RTCIceCandidate(message.candidate), _onSuccess, _onError);
                    }
                });
            };
            
            $scope.callToContact = (contact, index) => {
                $scope.CurrentContactIndex = index;
                $scope.CurrentContact = contact;
                _startCall(true);
            };

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
                        var hasMultiple = result.length > 1;
                        var newContactsList = [];
                        result.forEach(function(e){
                            newContactsList.push({
                                Name: e.id
                            });
                        });
                        $scope.Contacts = newContactsList;
                        if(!hasMultiple){
                            _startCall(hasMultiple);
                        }
                    });
                });


                $scope.entity = entity;
            };

            _constructor();
            
            //#endregion
            // _generateRandomNames(20);
        });
})();