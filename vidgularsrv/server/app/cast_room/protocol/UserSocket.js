var userRedisDao,
    roomRedisDao,
    questionRedisDao,
    OnlineUser = require('../models/OnlineUser'),
    expire = 7200,
    assert = require('assert-plus');
/*

    Connection Started - inside connection
*/
var socketUser;

module.exports = UserSocket;

function UserSocket( socket, oSocketIO, opts ) {
    if (!(this instanceof UserSocket)) {
        return new UserSocket(socket, oSocketIO, opts);
    }
    opts = opts || {};
    this.connection = socket;
    this.logger = opts.logger || null;
    this.userEntered = false;
    this.oSocketIO = oSocketIO;
    this.socket = socket;

    this.initialize( socket );
    
    var client = oSocketIO.getClient();
    userRedisDao = require('../dao/RedisUserDao')({client:client}),
    roomRedisDao = require('../dao/RedisRoomDao')({client:client}),
    questionRedisDao = require('../dao/RedisQuestionDao')({client:client}),
    
    UserSocket.prototype.handlers = { 
      userEnter: this.userEnter,
      userRaiseHand: this.userRaiseHand,
      userLowerHand: this.userLowerHand,
      userApplause: this.userApplause,
      userAskQuestion: this.userAskQuestion,
      userVoteQuestion: this.userVoteQuestion,
      userUnvoteQuestion: this.userUnvoteQuestion,
      casterGrantPerm: this.casterGrantPerm,
      casterRevokePerm: this.casterRevokePerm,
      casterDeleteQuestion: this.casterDeleteQuestion,
      casterUpdateRoom: this.casterUpdateRoom
    };
}

UserSocket.prototype.initialize = function initialize( socket ) {
    var _self = this;
    this.socket = socket;
    // TODO: test functionality
    socket.once('error', function( err ){
        console.dir(err);
        console.log('socket.error:' + err );
    });

    socket.on('C2S', function( msg ){
      // recieved message from the client
      console.log('C2S -> msg: ');
      console.dir(msg);
      
      try {
        msg = JSON.parse( msg );
      }
      catch(e){
        _self.serverError(err, 'JSON Parse Failed on C2S');
        return;
      }
      // save data to redis store
      var handler = _self.getHandler( msg.action );
      var response = handler.call( _self, msg.data, socket );
    });
};

UserSocket.prototype.getHandler = function getHandler( action ) {
  if( action in this.handlers ) {
    return this.handlers[action];
  }
  return null;
};

UserSocket.prototype.serverError = function serverError(err, message){
    console.log("server error: " + err + ' ' + message );
    if( this instanceof UserSocket ) {
        if( this.socket && !this.socket.disconnected) {
            this.socket.emit('serverError', {message: message});
            this.socket.disconnect();
        }
    } else {
        console.log('unexpected this type:' + this.constructor.name );
    }
    this.cleanup();
};
UserSocket.prototype.cleanup = function cleanup() {
    this.connection = null;
    this.logger = null;
    this.userEntered = false;
    this.oSocketIO = null;
    this.socket = null;
    socketUser = null;  
};
UserSocket.prototype.userLeave = function userLeave( data, socket, cb ) {
    var _self = this;
    console.log('user leaving ...');
    socket.removeAllListeners("C2S");

    if( typeof socketUser !== 'undefined' && socketUser !== null ){
        console.log( socket.id + ' disconnecting');

        console.log('socket: user trying to leave room');
        if( typeof socketUser.area === 'string' && socketUser.area.length > 0 )
        {
            socket.leave(socketUser.area);
            console.log('socket: user left room');
        }

        console.log('redis: try remove user');

        (function( oUserSocket, su, sockid ){
            // Remove user from Redis store - clear user data from room
            userRedisDao.removeUser( su, oUserSocket.oSocketIO.getClient() ).done(function(){
                console.log('redis: user removed success');
                // publish action to all APP SERVER 
                oUserSocket.oSocketIO.psubPublish( su.area, 'userLeft', su );
                oUserSocket.cleanup();
                if(cb){
                    cb();
                }
            }, function(err){
                oUserSocket.serverError(err, 'redis: Something went wrong when removing user!');
                if(cb) {
                    cb(err);
                }
                return;
            });
        }(this, socketUser, socket.id));
    }
};

/**
* @typedef {Object} MinUserObj
* @property {String} id - 24byte unique id from user created on persistant DB
* @property {String} area - room name
* @property {String} email - user email
*/

/**
* @function userEnter Performs user enter room initialization & regsitration process  
* @param {MinUserObj} data - the user object to whome permission is granted  
* @param {SocketIo.Socket} socket - socketIo user connected socket.
* @returns none
*/
UserSocket.prototype.userEnter = function userEnter(data, socket) {
    assert.object(data, 'data');
    assert.string(data.id, 'data.id');
    assert.string(data.area, 'data.area');
    assert.string(data.email, 'data.email');
    assert.object(socket, 'socket');

    if( this.userEntered ) {
      this.serverError( {}, 'User entered twice!');
      return;
    }
    console.log("user entry passed duplication test");
    
    if( typeof data === 'undefined' || data === null ) { 
        this.serverError(data, 'Something went wrong userEnter: missing data');
        return;
      }            

    if( typeof data.id === 'undefined' || data.id === null ) {
      this.serverError(data.id, 'Something went wrong userEnter: missing id');
      return;
    }

    if( typeof data.email !== 'string' || !data.email.length ) {
      this.serverError(data.email, 'Something went wrong userEnter: missing email');
      return;
    }

    if( typeof data.area !== 'string' || !data.area.length ) {
      this.serverError(data.area, 'Something went wrong userEnter: missing area');
      return;
    }

    console.log("data tested & passed validations");

    socket.join( data.area );
    console.log("user joined room: " + data.area );

    socketUser = new OnlineUser( data, socket.id );
    console.log("created onlineUser object: " );
    console.dir( socketUser );

    (function( oUserSocket, su, sockid ){

      userRedisDao.setUser( su, expire * 2 )
      .done(
        function(){
          console.log("user saved on redis: " + data.area );
          
          oUserSocket.getRoomState(oUserSocket, su, sockid );
        
        }, 
        function(err){
            oUserSocket.serverError(err, 'Something went wrong connecting the user!');
      });
    
    }(this, socketUser, socket.id));
};
UserSocket.prototype.getRoomState = function getRoomState( oUserSocket, socketUser, sockId ) {
    console.log("getRoomState");
    roomRedisDao.getRoomState( socketUser.area ).done(
        function( res ){
          console.log("users list fetched from redis" );
          console.dir(res);
          oUserSocket.oSocketIO.sendToClient( socketUser.area, sockId, 'roomInit', res );          
          // publish action to all APP SERVER 
          oUserSocket.oSocketIO.psubPublish( socketUser.area, 'userEntered', socketUser );
          oUserSocket.userEntered = true;
        }, 
        function(err){
            oUserSocket.serverError(err, 'Something went wrong getRoomState!');
        }
    );
};
UserSocket.prototype.userRaiseHand = function userRaiseHand( data, socket ) {
  var _self = this;
  var user = data.user;

  console.log('user: ' + user.email + ' raised his hand' );
  userRedisDao.userRaiseHand(user, expire * 2)
    .done(function(){
      // publish action to all APP SERVER 
      _self.oSocketIO.psubPublish( socketUser.area, 'userRaisedHand', user );
    }, function(err){
      _self.serverError(err, 'Something went wrong connecting the user!');
    });
};
UserSocket.prototype.userLowerHand = function userLowerHand( data, socket ) {
  var _self = this;
  var user = data.user;
  
  console.log('user: ' + user.email + ' lower his hand' );
  userRedisDao.userLowerHand(user, expire * 2)
    .done(function(){
      // publish action to all APP SERVER 
      _self.oSocketIO.psubPublish( socketUser.area, 'userLoweredHand', user );
    }, function(err){
      _self.serverError(err, 'Something went wrong connecting the user!');
    });
};
UserSocket.prototype.userApplause = function userApplause( data, socket ) {
  var _self = this;
  var user = data.user;
  
  console.log('user: ' + user.email + ' applause' );
  userRedisDao.userApplause(user, expire * 2)
    .done(function(){
      // publish action to all APP SERVER 
      _self.oSocketIO.psubPublish( socketUser.area, 'userApplaused', user );
    }, function(err){
      _self.serverError(err, 'Something went wrong connecting the user!');
    });
};
UserSocket.prototype.userAskQuestion = function userAskQuestion( data, socket ) {
    var _self = this;
    var user = data.user;
    var question = data.question;

    console.log('user: ' + user.email + ' userAskQuestion' );
    questionRedisDao.userAskQuestion(user, socketUser.area, question, expire * 2)
      .done(function( question ){
        data.question = question;
        // publish action to all APP SERVER 
        _self.oSocketIO.psubPublish( socketUser.area, 'userAskedQuestion', { user: user, question: question } );
      }, function(err){
        _self.serverError(err, 'Something went wrong connecting the user!');
      });
};
UserSocket.prototype.userVoteQuestion = function userVoteQuestion( data, socket ) {
    var _self = this;
    var user = data.user;
    var question = data.question;

    console.log('user: ' + user.email + ' userVoteQuestion' );
    questionRedisDao.userVoteQuestion(user, socketUser.area, question, expire * 2, _self.oSocketIO.getClient())
      .done(function( voteCnt ){

        // sending back votes to make sure each user subscribe to a question only once
        question.votes = voteCnt;
        console.log('votes: ' + question.votes );
        // publish action to all APP SERVER 
        _self.oSocketIO.psubPublish( socketUser.area, 'userVotedQuestion', { user: user, question: question } );
      }, function(err){
        _self.serverError(err, 'Something went wrong connecting the user!');
      });
};
UserSocket.prototype.userUnvoteQuestion = function userUnvoteQuestion( data, socket ) {
    var _self = this;
    var user = data.user;
    var question = data.question;
    
    console.log('user: ' + user.email + ' userUnvoteQuestion' );
    questionRedisDao.userUnvoteQuestion(user, expire * 2, _self.oSocketIO.getClient())
      .done(function(voteCnt){
        // sending back votes to make sure each user subscribe to a question only once
        question.votes = voteCnt;
        console.log('votes: ' + question.votes );

        // publish action to all APP SERVER 
        _self.oSocketIO.psubPublish( socketUser.area, 'userUnvotedQuestion', { user: user, question: question } );
      }, function(err){
        _self.serverError(err, 'Something went wrong connecting the user!');
      });
};

UserSocket.prototype.casterGrantPerm = function casterGrantPerm( data, socket ) {
    var _self = this;
    var user = data.user;
    console.log('user: ' + user.email + ' casterGrantPerm' );
    userRedisDao.grantSpeakPermission(user, socketUser.area, expire * 2, _self.oSocketIO.getClient())
      .done(function(){
        var Model = require('../models/Users.js');
        Model.findById(user.id, function (err, dbuser) {
          if (err) { 
            _self.serverError(err, 'User not found on mongo!');
            return;
          }
          // publish action to all APP SERVER 
          _self.oSocketIO.psubPublish( socketUser.area, 'casterGrantedPerm', dbuser );
        });
      }, function(err){
        _self.serverError(err, 'Something went wrong connecting the user!');
      });
};
UserSocket.prototype.casterRevokePerm = function casterRevokePerm( data, socket ) {
    var _self = this;
    var user = data.user;
    console.log('user: ' + user.email + ' casterRevokePerm' );
    userRedisDao.revokeSpeakPermission(socketUser.area, expire * 2, _self.oSocketIO.getClient() )
      .done(function(){
        // publish action to all APP SERVER 
        _self.oSocketIO.psubPublish( socketUser.area, 'casterRevokedPerm', user );
      }, function(err){
        _self.serverError(err, 'Something went wrong connecting the user!');
      });
};

/**
* @typedef {Object} DeleteObj
* @property {OnlineUser} user - 24byte unique id from user created on persistant DB
* @property {Question} question - room name
* @property {String} area - socket room name
*/

/**
* @typedef {Object} Question
* @property {Number} id - question id, unique in the room, incrementing number
* @property {String} userid - 24byte unique id from user created on persistant DB
* @property {String} text - text of the question
* @property {Number} age - age of the question, incrementing number
* @property {Number} votes - socket room name
*/

/**
* @function casterDeleteQuestion Performs delete question initiated by the caster   
* @param {DeleteObject} data - data object includes user, question & room information (see DeleteObject)  
* @param {SocketIo.Socket} socket - socketIo user connected socket.
* @returns none
* @publish - publish 'casterDeletedQuestion' action to all room connected user sockets  
*/
UserSocket.prototype.casterDeleteQuestion = function casterDeleteQuestion( data, socket ) {
    var _self = this;
    assert.object(data.user, 'data');

    assert.object(data.question, 'data.question');
    assert.object(data.user, 'data.user');
    assert.string(data.area, 'data.area');
    
    var user = data.user;
    var question = data.question;

    console.log('user: ' + user.email + ' casterDeleteQuestion' );
    questionRedisDao.casterDeleteQuestion(question, socketUser.area, expire * 2, this.client)
      .done(function(){
        // publish action to all APP SERVER 
        psubPublish( socketUser.area, 'casterDeletedQuestion', question );
      }, function(err){
        _self.serverError(err, 'Something went wrong connecting the user!');
      });
};
UserSocket.prototype.casterUpdateRoom = function casterUpdateRoom( data, socket ) {
    var _self = this;
    var room = data.room;
    console.log('room: ' + socketUser.area + ' casterUpdateRoom' );
    roomRedisDao.casterUpdateRoom( socketUser.area, room, expire * 2, this.client)
      .done(function(){
        // publish action to all APP SERVER 
        psubPublish( socketUser.area, 'casterUpdatedRoom', room );
      }, function(err){
        _self.serverError(err, 'Something went wrong connecting the user!');
      });
};