'use strict';
/**
 * Module dependencies.
 */
var mongoose = require( 'mongoose' );
var config = require('../../config');
var createError = require('./err.common').create;
var STATES = mongoose.STATES;
var wrappers = {};

/**
 * Default connection options.
 *
 * "Mongoose by default sets the auto_reconnect option to true.
 * We recommend setting socket options at both the server and replica set level.
 * We recommend a 30 second connection timeout because it allows for
 * plenty of time in most operating environments."
 *
 * @see  http://blog.mongolab.com/2014/04/mongodb-driver-mongoose/
 * @type {Object}
 */
var CONNECTION_DEFAULTS = {
  auth: {
    authMechanism: 'MONGODB-CR'
  },
  server: {
    socketOptions: {
      keepAlive: 1,
      connectTimeoutMS: 30000
    }
  },
  replset: {
    socketOptions: {
      keepAlive: 1,
      connectTimeoutMS: 30000
    }
  }
};

/**
 * @see getWrapper
 * @type {Function}
 */
module.exports = exports = getWrapper;

/**
 * Exports the mongoose module to the world.
 *
 * @type  {Mongoose}
 */
module.exports.mongoose = mongoose;

/**
 * Get a shared connection wrapper by name and uri.
 * @param  {String}             connection_name The connection name.
 * @param  {String}             mongo_uri       The mongo connection URI.
 * @param  {Bunyan | console =} opt_logger      Optional Bunyan logger (or console).
 * @return {Object} An object with the methods `connection`, `connect` and `disconnect`.
 * @public
 */
function getWrapper(connection_name, mongo_uri, opt_logger) {
  var key, wrapper;
  key = connection_name + '\n' + mongo_uri;
  wrapper = wrappers[key] || (wrappers[key] = createWrapper(mongo_uri));
  if (opt_logger !== undefined && opt_logger !== null) {
    wrapper.logger = opt_logger;
  }
  return wrapper;
}

/**
 * Create a new connection wrapper.
 *
 * @param  {String}  mongo_uri  The mongo connection URI.
 * @return {Object} An object with the methods `connection`, `connect`, `disconnect` and `ping`.
 * @private
 */
function createWrapper(mongo_uri) {
  var wrapper, connection;

  wrapper = {
    connection: getConnection,
    connect: connect,
    disconnect: disconnect,
    ping: pingDb,
    mongoose: mongoose,
    logger: null
  };

  return wrapper;



  /**
   * Get or create the shared connection (opened or not).
   *
   * @return {Object} Connection object.
   * @public
   */
  function getConnection() {
    return connection || (connection = mongoose.createConnection());
  }


  /**
   * Connects to database (unless already connected).
   *
   * @param {Function} callback Invoked when done with [err].
   * @public
   */
  function connect(callback) {
    var state = getConnection().readyState;

    switch (state) {
      case STATES.disconnected:
      {
        // Disconnected
        logMessage('info', 'Connecting to db...');
        connection.openSet(mongo_uri, CONNECTION_DEFAULTS, wrapCallback(callback));
        return;
      }
      case STATES.connected:
      {
        // Already connected
        logMessage('info', 'Already connected');
        setImmediate(callback);
        return;
      }
      case STATES.connecting:
      {
        // Connecting...
        connection.once('open', callback);
        return;
      }
      /* istanbul ignore next */
      case STATES.disconnecting:
      {
        // Disconnecting...
        var err = new Error('Unable to connect while disconnecting');
        logMessage('error', err);
        setImmediate(wrapCallback(callback), err);
        return;
      }
      /* istanbul ignore next */
      default:
      {
        var err = createError(500, 'Unknown connection state: ' + state);
        logMessage('error', err);
        setImmediate(callback, err);
        return;
      }
    }
  }


  /**
   * Disconnects from database.
   *
   * @param {Function} callback Invoked with [err].
   * @public
   */
  function disconnect(callback) {
    if (!connection) {
      setImmediate(callback);
      return;
    }

    logMessage('info', 'Closing DB connection...');
    connection.close(function(err) {
      if (err) {
        logMessage('error', err, 'Error closing connection');
        callback(createError());
        return;
      }

      callback();
    });
  }


  /**
   * Test whether the server is responding to commands.
   *
   * @param {Function} callback Invoked when done with [err].
   */
  function pingDb(callback) {
    var connected = !!connection && connection.readyState === STATES.connected;
    var error = connected ? null : createError(503);
    setImmediate(callback, error);
  }


  /**
   * Wrap callback function and intercept error.
   *
   * @param  {Function} callback The callback function
   * @return {Function} A new function that will log any errors.
   * @private
   */
  function wrapCallback(callback) {
    return function(err) {
      if (err) {
        logMessage('warn', err);
        callback(createError());
      }
      else {
        callback.apply(null, arguments);
      }
    };
  }


  /**
   * Logs a message using available logger.
   * @param {String} level    The log level.
   * @param {...*}   var_args Rest of the arguments passed to logger.
   * @private
   */
  function logMessage(level, var_args) {
    var obj = wrapper.logger;
    /* istanbul ignore if: logger not used in testing */
    if (obj && typeof obj[level] === 'function') {
      obj[level].apply(obj, Array.prototype.slice.call(arguments, 1));
    }
  }

}