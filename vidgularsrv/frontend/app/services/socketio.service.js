(function () {
    'use strict';
 
    angular
        .module('webcastApp')
        .factory('SocketIoService', SocketIoService);

    SocketIoService.$inject = ['$rootScope','$location','$window'];
    function SocketIoService($rootScope,$location,$window) {
      var socket,
          host,
          port,
          ns;

      function InitSocket() {
        host = $location.host() || 'localhost' //.split(':')[0];
        port = $location.port() || '80';
        ns = 'users';

        socket = io.connect('http://' + host + ':' + port + '/' + ns, {
            reconnect: false,
            'try multiple transports': false
        });

      };
      return {
        on: function (eventName, callback) {
          socket.on(eventName, function () {  
            var args = arguments;
            $rootScope.$apply(function () {
              callback.apply(socket, args);
            });
          });
        },
        emit: function (eventName, data, callback) {
          socket.emit(eventName, data, function () {
            var args = arguments;
            $rootScope.$apply(function () {
              if (callback) {
                callback.apply(socket, args);
              }
            });
          })
        },
        disconnect: function() {
          socket.disconnect();
        },
        handlers: {},
        sioEmit: function( room, action, data ){
          this.emit('C2S', JSON.stringify({ 
            action: action, 
            data: data,
            room: room
          }));
        },
        init: function( user, hndlrs ) {
            var that = this;
            var room = user.area;
            var intervalID;
            var reconnectCount = 0;

            that.handlers = hndlrs;
            InitSocket();
            socket.on('error', function( err ){
                console.log('socket.error:' + err );
              });

            socket.on('connect',function (data) {
              console.log('connecting');
              console.dir(user);
              //$window.setTimeout( function() {
                that.sioEmit(room, 'userEnter', user );
              //},1000)
            });

            socket.on('disconnect',function (data) {
              console.log('disconnect');
              intervalID = setInterval(tryReconnect, 4000);
              
              console.dir(socket);
              
              socket.removeAllListeners("connect");
              socket.removeAllListeners("disconnect");
              socket.removeAllListeners("error");
              socket.removeAllListeners("S2C");

              socket = null;
            });

            socket.on('connect_failed', function() {
              console.log('connect_failed');
            });

            socket.on('reconnect_failed', function() {
              console.log('reconnect_failed');
            });
            socket.on('reconnect', function() {
              console.log('reconnected ');
            });
            socket.on('reconnecting', function() {
              console.log('reconnecting');
            });

            // Using 'that' to use 'on' function wrapper invoking apply to refresh the layout 
            that.on('S2C',function (t_msg) {
              console.log('S2C -> msg: ' );
              console.dir(t_msg);
              var msg = JSON.parse(t_msg);
              var handler = getHandler( msg.action );
              if(handler){
                handler(msg.data);
              }
            });

            function getHandler( action ) {
                if( action in that.handlers ) {
                  return that.handlers[action];
                }

                return null;
            };

            var tryReconnect = function() {
              ++reconnectCount;
              if (reconnectCount == 5) {
                  clearInterval(intervalID);
              }
              console.log('Making a dummy http call to set jsessionid (before we do socket.io reconnect)');
              $.ajax('/')
                  .success(function() {
                      console.log("http request succeeded");
                      //reconnect the socket AFTER we got jsessionid set
                      socket = io.connect('http://' + host + ':' + port + '/' + ns, {
                          reconnect: false,
                          'try multiple transports': false
                      });
                      clearInterval(intervalID);
                  }).error(function(err) {
                      console.log("http request failed (probably server not up yet)");
                  });
            };
        }
      };
    }
})();