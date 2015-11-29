'use strict';

/**
 * Module dependencies.
 */
const util = require('util');
var events = require('events'),
    redis = require('redis'),
    q = require('q'),
    config = require('../../config'),
    createError = require('./err.common').create;

/**
 * Module exports.
 */
module.exports = PS;

function PS(opts) {
    if (!(this instanceof PS)) {
        return new PS(opts);
    }
    opts = opts || {};
    this.connection = null;
    this.logger = opts.logger || null;
}

// Initialize necessary properties from `EventEmitter` in this instance
PS.prototype = new events.EventEmitter;

/**
* Get or create the shared connection (opened or not).
*
* @return {Object} Connection object.
* @public
*/
PS.prototype.getConnection = function( cb ){
    if( this.isConnected ) {
        cb( null, this.connection );
        return;    
    } else {
        this.connect( function( err, conn ) {
            if( err ) {
                cb(err);
            } else {
                cb(null,conn);
            }
        });
    }
};

PS.prototype.__defineGetter__('conn', function() {
    if( this.isConnected ) {
        return this.connection;
    }

    return null;
});

PS.prototype.__defineGetter__('isConnected', function() {
    if( typeof this.connection === 'object' && this.connection !== null ) {
        return true;
    }

    return false;
});

PS.prototype.connect = function connect( cb ) {
    var _self = this;

    console.log('connecting subscriber');
    this.connection = redis.createClient(config.REDIS_PORT, config.REDIS_URL);
    console.log('connecting publisher');
    this.pub = redis.createClient(config.REDIS_PORT, config.REDIS_URL);
    
    this.connection.subscribe(config.PUBSUB_CHANNEL);
    
    this.connection.on('connect', function(){
        console.log('redis connected');
    });

    this.connection.on('error', function(e){
        _self.emit( 'error', createError( 'Error: Could not connect to MongoDB. Did you forget to run `mongod`?', e ) );
    });

    cb(null, this.connection);
    return this.connection;
}

PS.prototype.disconnect = function disconnect( cb ){
    if( !this.isConnected ) {
        if(cb) {
            cb();
            return;
        }
    }

    this.connection.quit();
    this.pub.quit();
    if(cb) {
        cb();
    }
};

PS.prototype.promiseDisconnect = function promiseDisconnect() {
    var _self = this;
  return q.Promise(function(resolve, reject, notify){
    // Close Mongo
    console.log( 'Closing redis ...' );
    _self.disconnect( function( err ) {
      if(err) {
        reject();
        return;
      }
      
      resolve();
    });
  });
};

PS.prototype.publish = function( data ) { 
    this.pub.publish( config.PUBSUB_CHANNEL, data );
};