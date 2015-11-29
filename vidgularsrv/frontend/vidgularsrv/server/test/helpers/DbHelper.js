'use strict';

/**
* Databsse Helper Ctor
*/
function DbHelper(opts) {
    if (!(this instanceof DbHelper)) {
        return new DbHelper(opts);
    }
}

DbHelper.prototype.openConnection = function openConnection(cb) {
    if(cb) {
        cb();
    }
};

/**
* Store Helper Ctor
*/
function StoreHelper(opts) {
    if (!(this instanceof StoreHelper)) {
        return new StoreHelper(opts);
    }
    this.oRedis = require('../../app/core/redis.store')({});
}

/**
* Given a redis connection -> FlushAll & return the connection
*/
StoreHelper.prototype.startFresh = function startFresh(cb) {
    var oStoreHelper = this;
    if( !(oStoreHelper instanceof StoreHelper ) ) {
        throw new Error('oStoreHelper is NOT instanceof StoreHelper');
        return;
    }
    oStoreHelper.connection.FLUSHALL( function(err, conn) {
        if(err)
        {
            cb(err);
            return;
        } else {
            cb(null, conn);
        }
    });
};

/**
* Starts the Redis Store & return connection
*/
StoreHelper.prototype.openConnection = function openConnection(cb) {
    var oStoreHelper = this;
    if( !(oStoreHelper instanceof StoreHelper ) ) {
        throw new Error('oStoreHelper is NOT instanceof StoreHelper');
    }
    
    oStoreHelper.oRedis.getConnection( function(err, conn) {
        if(err)
        {
            cb(err);
            return;
        } else {
            oStoreHelper.connection = conn;
            cb(null, conn);
        }
    });
};

/**
* Starts the Redis Store + FlushAll return the connection or err in the callback
*/
StoreHelper.prototype.openFreshConnection = function openFreshConnection(cb) {
    var oStoreHelper = this;
    if( !(oStoreHelper instanceof StoreHelper ) ) {
        throw new Error('oStoreHelper is NOT instanceof StoreHelper');
    }
    oStoreHelper.openConnection(function (err, connection) {
        var oStoreHelper2 = oStoreHelper;
        if (err) {
          cb(err);
          return;
        }
        
        oStoreHelper2.connection = connection;
        
        oStoreHelper2.startFresh( function( err, ret ){
            if(err){
                cb(err);
                return;
            }

            cb(null,oStoreHelper2.connection);
        });
    });    
}

StoreHelper.prototype.closeConnection = function closeConnection(cb) {
    var oStoreHelper = this;
    if( !(oStoreHelper instanceof StoreHelper) ) {
        throw new Error('oStoreHelper is NOT instanceof StoreHelper');
    }
    
    oStoreHelper.oRedis.disconnect( function(err, conn) {
        oStoreHelper.connection = null;
        oStoreHelper.oRedis = null;
        if (err) {
            cb(err);
            return;
        } else {
            cb();
        }
    });
};

/**
* Module Exports
*/
exports.DbHelper = DbHelper;
exports.StoreHelper = StoreHelper;