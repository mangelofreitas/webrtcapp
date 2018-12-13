(function(){
    'use strict';

    angular.module('webRTCApp')
        .controller('CallController', function($scope, $location, $rootScope, $timeout){
            $rootScope.showLoadingAnimation();

            var _getHashCode = function(){
                return $location.hash();
            };

            //#region Handle Functions

            $scope.changeRoom = function(result){
                $location.hash(result.roomCode);
                _constructor();
            };

            var _onError = function(result) {
                console.log("An error occurred!\n"+result);
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
                    $.notify("You have a partner. The video-coference has started!", "success");
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

            //#region Constructor
            var _constructor = function(){
                // ScaleDrone webrtc_channel
                var entity = {};
                entity.drone = new ScaleDrone('wRIpraeA5bQ2Q5zh');
                entity.roomName = 'observable-'+_getHashCode();
                // entity.roomName = 'observable-test';
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
                        var sendSignal = result.length == 2;
                        if(result.length<=2){
                            _startCall(sendSignal);
                            if(!sendSignal){
                                $.notify("You are alone in the room, wait for a partner to enter.", "info");    
                            }
                        }
                        else{
                            $.notify("Already two people on that room. Choose another!", "error");
                            return;
                        }
                    });
                });


                $scope.entity = entity;
            };

            // _constructor();
            
            $scope.$watchCollection('openRoomWindow', function(newValue, oldValue){
                if(newValue != oldValue || oldValue){
                    if (!$location.hash()) {
                        $scope.openRoomWindow();
                    }
                    else{
                        _constructor();
                    }
                }
            });

            
            $timeout(function(){
                $rootScope.hideLoadingAnimation(true);
                
            });
            //#endregion
            // _generateRandomNames(20);
        });
})();