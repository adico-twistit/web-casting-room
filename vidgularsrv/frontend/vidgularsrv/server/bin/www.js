#!/usr/bin/env node
(function() {
    process.on('uncaughtException', function (err) {
      console.error((new Date).toUTCString() + ' uncaughtException:', err.message)
      console.error(err.stack)
      process.exit(1)
    });

    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);

    var debug = require('debug')('webcastApp'),
        http = require('http'),
        Mongoose = require('../app/core/mongo.common'),
        Redis = require('../app/core/redis.store'),
        PubSub = require('../app/core/redis.pubsub'),
        SocketIO = require('../app/core/socketio.common'),
        q = require('q');

    var oDB = Mongoose({}),
        oRedisStore = Redis({}),
        oPubSub = PubSub({}),
        oSocketIO = SocketIO({});
    
    // listen to errors
    oDB.once('error', onUnrecoverableError);
    oRedisStore.once('error', onUnrecoverableError);
    oPubSub.once('error', onUnrecoverableError);
    oSocketIO.once('error', onUnrecoverableError);

    // connect to db
    var dbConnection,
        pubsubConn,
        redisStoreConn,
        server,
        app;
    
    connectDataServer().done( function() {
      app = require('../app')(dbConnection, dbConnection.mongoose),
          port = normalizePort(process.env.PORT || '3000');

      app.locals.shutting_down = false;
      app.set('port', port);

      server = http.createServer(app);

      server.listen(port);
      server.on('error', onError);
      server.on('listening', onListening);

      oSocketIO.initSocket(server, redisStoreConn, app, oPubSub);
      //start up socket.io
      var socketIoConn = oSocketIO.conn;

      
      /**
       * Listen on provided port, on all network interfaces.
       */
    }, function(err) {
      onUnrecoverableError(err);
      cleanup();
      return;
    });
    
    function connectStore() {
      return q.Promise(function(resolve, reject, notify){
          // connect to redis pubsub
          oRedisStore.getConnection( function(err, conn) {
            if(err)
            {
              reject();
            } else {
              redisStoreConn = conn;
              resolve();
            }
          });
      });
    }
    function connectPubSub() {
      return q.Promise(function(resolve, reject, notify){
          // connect to redis store
          oPubSub.getConnection( function(err, conn) {
            if(err)
            {
              reject();
            } else {
              pubsubConn = conn;
              resolve();
            }
          });
      });
    }
    function connectDB() {
      return q.Promise(function(resolve, reject, notify){
          oDB.getConnection( function(err, conn) {
            if(err)
            {
              reject();
            } else {
              dbConnection = conn;
              resolve();
            }
          });
      });
    }
    function connectDataServer() {
      return q.all( [
          connectDB(), 
          connectStore(),
          connectPubSub()      
        ] );
    };
    /**
     * Clean up and exit server process.
     */
    function cleanup () {
      console.log( 'Cleaning Up ...' );
      if(app) {
        app.locals.shutting_down = true;
      } else {

        require('express')().locals.shutting_down = true;
      }
      
      disconnectServers().done(function( res ){
        console.log( "Closed out remaining connections.");
        // Close db connections, other chores, etc.
        // Close redis
        // Close SocketIO
        if(server) {
          server.close( function () {
            process.exit();    
          } );  
        } else {
          process.exit();
        } 
      }, function(err){
        throw err;
      });

      setTimeout( function () {
          console.error("Could not close connections in time, forcing shut down");
          process.exit(1);
        }, 60*1000);

    }

    function disconnectServers() {
      return q.all( [
        oDB.promiseDisconnect(), 
        oRedisStore.promiseDisconnect(),
        oPubSub.promiseDisconnect(),
        oSocketIO.promiseDisconnect()      
      ] );
    }
      
    /**
     * Normalize a port into a number, string, or false.
     */

    function normalizePort(val) {
      var port = parseInt(val, 10);

      if (isNaN(port)) {
        // named pipe
        return val;
      }

      if (port >= 0) {
        // port number
        return port;
      }

      return false;
    }

    function handleError(error){
      console.log( error.stack );
      console.log( "Type: " + error.type );
      console.log( "Message: " + error.message );
      console.log( "Detail: " + error.detail );
      console.log( "Extended Info: " + error.extendedInfo );
      console.log( "Error Code: " + error.errorCode );
      console.dir(error.err);
    }
    /**
     * Event listener for HTTP server "error" event.
     */

    function onUnrecoverableError(error) {
    /**
     * Event listener for External Server Unrecoverabe "error" event.
     */
     handleError(error);
     cleanup();
    }

    function onError(error) {
      if (error.syscall !== 'listen') {
        onUnrecoverableError(error);
      }

      var bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;

      // handle specific listen errors with friendly messages
      switch (error.code) {
        case 'EACCES':
          onUnrecoverableError(error);
          break;
        case 'EADDRINUSE':
          onUnrecoverableError(error);
          break;
        default:
          onUnrecoverableError(error);
      }
    }

    /**
     * Event listener for HTTP server "listening" event.
     */

    function onListening() {
      var addr = server.address();
      var bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
      debug('Listening on ' + bind);
    }
})();