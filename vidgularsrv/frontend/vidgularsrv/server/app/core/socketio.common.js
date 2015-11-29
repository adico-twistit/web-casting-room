'use strict';

const util = require('util');
var events = require('events'),
    assert = require('assert-plus'),
    q = require('q'),
    createError = require('./err.common').create;

//require('socket.io')

module.exports = SocketIo;

function SocketIo( opts ) {
    if (!(this instanceof SocketIo)) {
        return new SocketIo(opts);
    }
    opts = opts || {};
    this.connection = null;
    this.logger = opts.logger || null;
    this.connectedSockets = {};
    this.pubsub = null;
    this.client = null;
}
// Initialize necessary properties from `EventEmitter` in this instance
SocketIo.prototype = new events.EventEmitter;
/**
* Get or create the shared connection (opened or not).
*
* @return {Object} Connection object.
* @public
*/
SocketIo.prototype.__defineGetter__('conn', function(){
    return this.connection;
});

SocketIo.prototype.__defineGetter__('isConnected', function() {
    if( typeof this.connection === 'object' && this.connection !== null ) {
        return true;
    }

    return false;
});

SocketIo.prototype.initSocket = function initSockets(server, client,app,pubsub) {
  console.log( 'Server setup listener for RT Socket connections from client - Working ...' );
  
  var socketio = this.connection = require('socket.io')(server, { logger:null } ); // todo: setup logger
  var socketIOExpressSession = require('socket.io-express-session'); 
  socketio.use(socketIOExpressSession(app.session)); // session support

  //var socketio_redis = require('socket.io-redis');
  //io.adapter(socketio_redis({ host: 'localhost', port: 6379 }));
  
  var nsSocket = socketio.of('/users');
  var _self = this;  
  
  this.pubsub = pubsub;
  this.client = client;

  pubsub.conn.on('message', function(channel, data) {
    // update/action message recieved from redis pubsub
    console.dir('pubsub.sub.on');
    console.dir(data);
    var t_data = JSON.parse( data );
    var roomSocket = nsSocket.in( t_data.room );

    // publish to all clients          
    _self.sioEmit(roomSocket, t_data.action, t_data.data);
  });

  nsSocket.on('error', function (err) {
    debug('SokectIO failed');
    _self.emit('error', err);
  });
  /**********************************************
      Socket On Client Connection Start
  ***********************************************/
  // TODO: is 'users' variable necessary? check
  nsSocket.on('connection', function (socket) {
    var userSocket;

    console.log( 'Connection Established w/Client:' + socket.id );
    if( socket.id in _self.connectedSockets ) {
        var message = "double connection " + socket.id;
        delete _self.connectedSockets[ socket.id ];
        _self.emit( 'error', createError(message) );
        return;
    }
    socket.once('disconnect', function disconnect() {
        console.log('recieved disconnect from client ...');
        if(userSocket) {
            console.log('Initiating user leave  ...');
            userSocket.userLeave({} ,socket, function( err ) {
                if(err) {
                    console.log('err:');
                    console.dir(err);
                }
                console.log('Initiating cleanup ...');
                delete _self.connectedSockets[ socket.id ];
                userSocket = null;
                console.log('unregistered socket successfuly');
                console.dir(_self.connectedSockets);
            });
        }
    });
    _self.connectedSockets[ socket.id ] = {};
    console.log('socket passed unique test & added to active sockets');
    console.dir(_self.connectedSockets);

    userSocket = require('../cast_room/protocol/UserSocket')(socket, _self);

  });
  
  console.log( 'Server setup listener for RT Socket connections from client - Done!!!' );
};

SocketIo.prototype.getClient = function getClient() {
    return this.client;
};
SocketIo.prototype.getPubSub = function getPubSub() {
    return this.pubsub;
};
SocketIo.prototype.sendToClient = function sendToClient(room, sockId, action, data) {
    var userSock = this.connection.of('/users').in(room).to(sockId);
    this.sioEmit( userSock, action, data );
};
SocketIo.prototype.sioEmit = function sioEmit(soc, action, data) {
    soc.emit('S2C', JSON.stringify({ 
      action: action, 
      data: data
    }));
};

SocketIo.prototype.psubPublish = function psubPublish( room, action, data ){
    this.pubsub.publish( JSON.stringify({
      room: room,
      action: action, 
      data: data
    } ));
};

SocketIo.prototype.disconnect = function disconnect( cb ){
    if( this.isConnected )
    {
        this.connection.close();
        this.connection = null;
        this.connectedSockets = null;
        this.logger = null;
        this.pubsub = null;
        this.client = null;
    }

    if(cb) {
        cb();
    }
};

SocketIo.prototype.promiseDisconnect = function promiseDisconnect() {
    var _self = this;
  return q.Promise(function(resolve, reject, notify){
    // Close Mongo
    console.log( 'Closing SocketIO ...' );
    _self.disconnect( function( err ) {
      if(err) {
        reject();
        return;
      }
      
      resolve();
    });
  });
};