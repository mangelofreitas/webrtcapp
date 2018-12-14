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
            };

            $scope.copyRoom = function(){
                var value = _getHashCode();
                var $temp = $("<input>");
                $("body").append($temp);
                $temp.val(value).select();
                document.execCommand("copy");
                $temp.remove();
                $.notify("Room code copied!", "success");
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

                entity.pc.ontrack = function(e){
                    
                    remoteVideo.srcObject = e.streams[0];
                    e.track.onended = function(e){
                        remoteVideo.srcObject = remoteVideo.srcObject;
                    };
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
                        $.notify("You have a partner. The video-coference has started!", "success");
                        entity.pc.setRemoteDescription(new RTCSessionDescription(message.sdp), function(){
                            if(entity.pc.remoteDescription.type === "offer"){
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
                console.log("constructor");
                var entity = {};
                entity.drone = new ScaleDrone('wRIpraeA5bQ2Q5zh');
                entity.roomName = 'observable-'+_getHashCode();
                // entity.roomName = 'observable-test';
                entity.configuration = {
                    iceServers: [
                        {urls:'stun:stun.l.google.com:19302'},
                        {
                            urls: 'turn:numb.viagenie.ca',
                            credential: 'muazkh',
                            username: 'webrtc@live.com'
                        }
                    ]
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
                        console.log("-> "+result.map(e => e.id));
                        if(result.length<=2){
                            _startCall(sendSignal);
                            if(!sendSignal){
                                $.notify("You are alone in the room, wait for a partner to enter.", "info");    
                            }
                            else{
                                $.notify("You have a partner. The video-coference has started!", "success");
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
            
            $scope.$watchCollection('openRoomWindow', function(newValue, oldValue){
                if(newValue != oldValue || oldValue){
                    if (!$location.hash()) {
                        $scope.openRoomWindow();
                    }
                }

            });

            
            $timeout(function(){
                $rootScope.hideLoadingAnimation(true);
                if ($location.hash()){
                    _constructor();
                }
            });
            //#endregion
            // _generateRandomNames(20);
        });
})();