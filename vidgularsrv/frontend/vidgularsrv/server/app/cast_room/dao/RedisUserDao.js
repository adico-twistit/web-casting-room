/**
 * @fileoverview Redis data layer. requires {@link q} or {@link https://github.com/kriskowal/q}
 * @author adico@twistit.co.il (Adi Cohen)
 * @requires q
 */

/**
 * Repository module for webcasting room communication persistance on RedisStore
 * @module models/repository
 */
module.exports = function RedisUserDao(opts) {
    'use strict';

    var hlp_err = require('../../core/err.common'),
        assert = require('assert-plus'),
        q = require('q'),
        that = {};

    opts = opts || {};
    if (!(opts.client && typeof opts.client === 'object' )) {
        hlp_err.createAppError({message: 'client not instance of RedisClient'});
        return null;
    }

    /**
    * @typedef {Object} OnlineUser
    * @property {String} id
    * @property {String} area
    * @property {String} socketid
    * @property {String} email
    * @property {String} raiseHand
    * @property {String} applause
    * @property {String} age
    */

    /**
    * @function removeUser Performs ...
    * @param {OnlineUser} user - the user object to whome permission is granted
    * @returns {Promise} result
    * @resolves no result when the key successfuly persisted
    * @rejects {RedisErrObject} err
    */
    function removeUser( user ){
        return q.Promise(function(resolve, reject, notify) {
            var userIndexKey = user.area + ':users';
            var userKey = userIndexKey + ':' + user.id;

            opts.client.multi()
                .srem( userIndexKey, userKey )
                .hdel( userKey, 'id', 'raiseHand', 'applause', 'email', 'age', 'socketid') 
                .exec(function(err) {
                    if(err) {
                        reject(err);
                        return;
                    }
                    resolve();
                });
        });
    }

    /**
    * @function setUser Performs ... 
    * @param {OnlineUser} user - the user object to whome permission is granted  
    * @param {number} expire - number in seconds to expire the key, should be set to a number that represents 
    * @returns {Promise} result
    * @resolves no result when the key successfuly persisted
    * @rejects {RedisErrObject} err
    */
    function setUser( user, expire ){
        return q.Promise(function(resolve, reject, notify) {
            var userIndexKey = user.area + ':users';
            var userKey = userIndexKey + ':' + user.id;

            opts.client.multi()
                .hmset( userKey, ['id', user.id, 'email', user.email, 'raiseHand', 0, 'applause', 0, 'age', new Date().getTime(), 'socketid', user.socketid ])
                .expire( userKey, expire )
                .sadd( userIndexKey, userKey )
                .expire( userIndexKey, expire)
                .exec(function(err) {
                    if(err === null){
                        resolve();
                    } else {
                        reject(err);
                    }
                });
        });
    }

    /**
    * @function unserialize Performs ... 
    * @param {OnlineUser} user - the user object to whome permission is granted  
    * @returns nothing
    */
    function unserialize(user) {
        user.raiseHand = user.raiseHand=='1' ? true : false;
        user.applause = user.applause=='1' ? true: false; 
    }

    /**
    * @function getConnectedUser Performs ... 
    * @param {string} key - the user key in the form of '[area]:users:[userid]
    * @returns {Promise} result
    * @resolves {OnlineUser} user
    * @rejects {RedisErrObject} err
    */
    function getConnectedUser( key ) {
        return q.Promise(function(resolve, reject, notify) {
            opts.client.hgetall( key, function (err, user) {
                if(err) {
                    reject(err);
                    return;
                }

                if( typeof user === 'undefined' || user === null ) {
                    reject('User is null');
                    return;
                }

                console.log("getConnectedUser");
                console.dir(user);

                unserialize(user);
                resolve(user);
            });
        });
    }

  /**
  * @function getConnectedUsers Performs ... 
  * @param {string} area - 
  * @returns {Promise} result
  * @resolves Array of OnlineUsers
  * @rejects {RedisErrObject} err
  */
  function getConnectedUsers( area ) {
    return q.Promise(function(resolve, reject, notify) {
      opts.client.smembers(area+':users', function(err, res) {
        if(err) {
          reject(err);
          return;
      }

      if(res.length > 0){
          console.log('getConnectedUsers:');
          console.dir(res);
          var length = res.length;
          var returnUsers = {};
          res.forEach(function(key) {
            if( key )
            {
              getConnectedUser(key).done(function(user) {
                returnUsers[user.id] = user;
                length--;
                if(length === 0){
                  resolve(returnUsers);
              }
          }, function(err) {
            reject(err);
        });
          }
      });

      } else {
          resolve();
      }
  });
  });
}

  /**
  * @function userRaiseHand Performs ... 
  * @param {OnlineUser} user - the user object to whome permission is granted  
  * @param {number} expire - number in seconds to expire the key, should be set to a number that represents 
  * @returns {Promise} result
  * @resolves no result when the key successfuly persisted
  * @rejects {RedisErrObject} err
  */
  function userRaiseHand(user, expire){
    return q.Promise(function(resolve, reject, notify){
      var userIndexKey = user.area + ':users';
      var userKey = userIndexKey + ':' + user.id;

      opts.client.multi()
      .hmset( userKey, ['raiseHand', 1])
      .exec(function(err){
          if(err === null){
            resolve();
        } else {
            reject(err);
        }
    });
  });
}

  /**
  * @function userLowerHand Performs ... 
  * @param {OnlineUser} user - the user object to whome permission is granted  
  * @param {number} expire - number in seconds to expire the key, should be set to a number that represents 
  * @returns {Promise} result
  * @resolves no result when the key successfuly persisted
  * @rejects {RedisErrObject} err
  */
  function userLowerHand(user, expire) {
    return q.Promise(function(resolve, reject, notify) {
      var userIndexKey = user.area + ':users';
      var userKey = userIndexKey + ':' + user.id;

      opts.client.multi()
      .hmset( userKey, ['raiseHand', 0])
      .exec(function(err) {
          if(err === null){
            resolve();
        } else {
            reject(err);
        }
    });
  });
}

  /**
  * @function userApplause Performs ... 
  * @param {OnlineUser} user - the user object to whome permission is granted  
  * @param {number} expire - number in seconds to expire the key, should be set to a number that represents 
  * @returns {Promise} result
  * @resolves no result when the key successfuly persisted
  * @rejects {RedisErrObject} err
  */
  function userApplause(user, expire) {
    return q.Promise(function (resolve, reject, notify) {
      var userIndexKey = user.area + ':users';
      var userKey = userIndexKey + ':' + user.id;

      opts.client.multi()
      .hmset( userKey, ['applause', 1])
      .exec(function (err) {
          if(err === null){
            resolve();
        } else {
            reject(err);
        }
    });
  });
}

  /**
  * @function grantSpeakPermission Performs persist activity grant user speak permission to redeis store 
  * @param {OnlineUser} user - the user object to whome permission is granted  
  * @param {string} room - name (identifier) of the webcast room (socketio) channel
  * @param {number} expire - number in seconds to expire the key, should be set to a number that represents 
  *   the end of the webcast session.
  * @param {RedisClient} client - client connection to redis.
  * @returns {Promise} result
  * @resolves no result when the key successfuly persisted
  * @rejects {RedisErrObject} err
  */
  function grantSpeakPermission (user, room, expire) {
    assert.object(user, 'user');
    assert.string(user.id, 'user.id');
    assert.string(room, 'room');
    assert.number(expire, 'expire');
    assert.object(opts.client, 'client');

    return q.Promise(function (resolve, reject, notify) {
      var userIndexKey = room + ':users';
      var userKey = userIndexKey + ':' + user.id;
      var stateIndexKey = room + ':state';

      // set room state speaker to the current speaking user id
      // change users raised_hand to false
      // im not submitting back the new user & room state because the client will take 
      // care of removing the raise hand flag from the user & marking his as the current speaker
      opts.client.multi()
      .hmset( userKey, ['raiseHand', 0])
      .hmset( stateIndexKey, ['speaker', user.id])
      .exec(function (err) {
          if(err === null){
            resolve();
        } else {
            reject(err);
        }
    });
  });
}

    /**
    * @function revokeSpeakPermission Performs persist activity revoke user speak permission to redeis store
    * @param {string} room - name (identifier) of the webcast room (socketio) channel
    * @param {number} expire - number in seconds to expire the key, should be set to a number that represents
    *   the end of the webcast session.
    * @param {RedisClient} client - client connection to redis.
    * @returns {Promise} result
    * @resolves no result when the key successfuly persisted
    * @rejects {RedisErrObject} err
    */
    function revokeSpeakPermission(room, expire) {
        assert.string(room, 'room');
        assert.number(expire, 'expire');
        assert.object(opts.client, 'client');
        return q.Promise(function (resolve, reject) {
            var stateIndexKey = room + ':state';

            opts.client.multi()
                .hmset(stateIndexKey, ['speaker', ''])
                .exec(function (err) {
                    if (err === null) {
                        resolve();
                    } else {
                        reject(err);
                    }
                });
        });
    }

    /** GET THE CONNECTED USER. */
    that.getConnectedUser = getConnectedUser;
    /** For Unit Testing - GET THE CONNECTED USERS. */
    that.getConnectedUsers = getConnectedUsers;
    /** CREATE USER. */
    that.setUser = setUser;
    /** REMOVE USER. */
    that.removeUser = removeUser;
    /** USER RAISED HAND. */
    that.userRaiseHand = userRaiseHand;
    /** USER LOWERED HIS HAND. */
    that.userLowerHand = userLowerHand;
    /** USER APPLAUSE. */
    that.userApplause = userApplause;
    /** GRANT USER PERMISSION TO SPEAK. */
    that.grantSpeakPermission = grantSpeakPermission;
    /** CASTER REVOKES THE USER SPEAK PERMISSION. */
    that.revokeSpeakPermission = revokeSpeakPermission;

    return that;
};