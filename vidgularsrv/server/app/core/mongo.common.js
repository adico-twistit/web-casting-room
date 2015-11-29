'use strict';
/**
 * Module dependencies.
 */
const util = require('util');

var events = require('events'),
    debug = require('debug'),
    createError = require('./err.common').create,
    STATES,
    q = require('q');

 /**
  * Module exports.
  */

 module.exports = DB;

/**
 * DB constructor.
 *
 * @param {Object} options
 * @api public
 */
function DB( opts ) {
    if (!(this instanceof DB)) {
        return new DB(opts);
    }

    opts = opts || {};
    this.connection = null;
    this.logger = opts.logger || null;

}

// Initialize necessary properties from `EventEmitter` in this instance
DB.prototype = new events.EventEmitter;

/**
* Get or create the shared connection (opened or not).
*
* @return {Object} Connection object.
* @public
*/
DB.prototype.getConnection = function(cb) {
    if ( this.isConnected ) {
        cb( null, this.connection );
        return;
    } else {
        this.connect( function( err,conn ) {
            if( err ) {
                cb(err);
            } else {
                cb(null,conn);
            }
        });
    }
};

DB.prototype.__defineGetter__('conn', function() {
    if( this.isConnected ) {
        return this.connection;
    }

    return null;
});

DB.prototype.__defineGetter__('isConnected', function() {
    if( typeof this.connection === 'object' && this.connection !== null ) {
        return true;
    }

    return false;
});

DB.prototype.connect = function connect(cb) {
    var _self = this;

    var config = require('../../config');
    var mongo_uri = config.MONGO_URI;
    var connection_name = config.MONGO_CONN; // Used to retrieve connection
    var logger = null; 
    
    this.mongoose = require('mongoose');
    // Use Q Promises
    this.mongoose.Promise = require('q').Promise;

    this.mongoose.connect(mongo_uri);

    this.connection = this.mongoose.connection;
    this.connection.once('error', function(err) {
        console.log('Mongoose default connection error: ' + err);
        this.connection = null;
        this.mongoose = null;
        // TODO: replace with evented errors
        _self.emit( 'error', createError('Error: Could not connect to MongoDB. Did you forget to run `mongod`?') );
        return;
    });
    this.connection.once('open', function (callback) {
        // Connected
        debug('Mongoose default connection open to ' + mongo_uri);
        // Ping the db server (using the db command "ping")
        if( _self.connection ) {
            //STATES = this.mongoose.STATES;
            _self.ping(function(err) {
                console.log('Ping %s', err ? 'failed' : 'succeeded');
                if(err)
                {
                    cb(err);
                } else {
                    cb(null,_self);
                }
            });
        } else {
            cb( createError('Problem with mongoose connection') );
        }
    });

    // on connection disconnected
    this.connection.once('disconnected', function () {
        console.log('Mongoose default connection disconnected');
        _self.connection = null;
        _self.mongoose = null;
    });
};

/**
   * Test whether the server is responding to commands.
   *
   * @param {Function} callback Invoked when done with [err].
   */
DB.prototype.ping = function pingDb(callback) {
    var connected = !!this.connection;
    var error = connected ? null : createError(503);
    if( callback )
    {
        callback(error);
    }
};

DB.prototype.disconnect = function disconnect( cb ){
    if( !this.isConnected ) {
        debug('mongoose wasnt connected');
        if(cb) {
            cb();
            return;
        }
    }

    debug('mongoose connected - disconnecting ...');
    this.connection.close(function ( err ) {
        console.log('Mongoose default connection disconnected through app termination');
        if(cb) {
            cb(err);
            return;
        }
    });
};

DB.prototype.promiseDisconnect = function disconnectMongo() {
    var _self = this;
  return q.Promise(function(resolve, reject, notify){
    // Close Mongo
    console.log( 'Closing mongoose ...' );
    _self.disconnect( function( err ) {
      if(err) {
        reject();
        return;
      }

      resolve();
    });
  });
};