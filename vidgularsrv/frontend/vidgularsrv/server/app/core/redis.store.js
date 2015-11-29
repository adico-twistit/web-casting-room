'use strict';

/**
 * Module dependencies.
 */
const util = require('util');
var events = require('events'),
    config = require('../../config'),
    redis = require('redis'),
    url = require('url'),
    redisConfig = url.parse(config.REDIS_URL),
    createError = require('./err.common').create,
    q = require('q');
/**
 * Module exports.
 */
module.exports = RS;

/**
 * RS constructor.
 *
 * @param {Object} options
 * @api public
 */
function RS( opts ) {
    if (!(this instanceof RS)) return new RS(opts);
        
    opts = opts || {};
    this.connection = null;
    this.logger = opts.logger || null;
}

// Initialize necessary properties from `EventEmitter` in this instance
RS.prototype = new events.EventEmitter;

RS.prototype.__defineGetter__('conn', function() {
    if( this.isConnected ) {
        return this.connection;
    }

    return null;
});

RS.prototype.__defineGetter__('isConnected', function() {
    if( typeof this.connection === 'object' && this.connection !== null ) {
        return true;
    }

    return false;
});
/**
* Get or create the shared connection (opened or not).
*
* @return {Object} Connection object.
* @public
*/
RS.prototype.getConnection = function( cb ){
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


RS.prototype.connect = function connect( cb ) {
    var config = require('../../config');
    var oRS = this;

    oRS.connection = redis.createClient(config.REDIS_PORT, config.REDIS_URL);

    if (typeof redisConfig.auth !== 'undefined' && redisConfig.auth !== null) {
        mod.client.auth(redisConfig.auth.split(':')[1]);
    }

    oRS.connection.on('connect', function(){
        console.log('redis connected');
        cb(null,oRS.connection);
    });

    oRS.connection.on('error', function(e){
        console.log('error: redis connect failed');
        cb(e);
    });
}


RS.prototype.disconnect = function disconnect( cb ){
    var err;
    if( this.isConnected )
    {
        try {
            this.connection.quit();
        } catch (e) {
            console.log(e);
            err = e;
        }
    }

    if(cb) {
        cb(err);
    }
};

RS.prototype.promiseDisconnect = function promiseDisconnect() {
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
}