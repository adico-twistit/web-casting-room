/**
 * @fileoverview Redis data layer. requires {@link q} or {@link https://github.com/kriskowal/q}
 * @author adico@twistit.co.il (Adi Cohen)
 * @requires q
 */

/**
 * Repository module for webcasting room communication persistance on RedisStore
 * @module models/repository
 */

module.exports = function(opts) {
  'use strict';

  var hlp_err = require('../../core/err.common.js'),
      assert = require('assert-plus'),
      q = require('q'),
      that = {};

  opts = opts || {};
  if (!(opts.client && typeof opts.client === 'object' )) {
        hlp_err.createAppError({message: 'client not instance of RedisClient'});
        return null;
    }

  /** GET REAL TIME ROOM INFO. */
  that.getRoomInfo = getRoomInfo;
  /** GET ROOM REAL TIME STATE: CONNECTED, QUESTIONS, ROOM INFO. */
  that.getRoomState = getRoomState;
  /** GET THE ROOM ACTIVE STATE. */
  that.getRoomState = getRoomState;
  /** CASTER UPDATES ROOM INFORMATION. */
  that.casterUpdateRoom = casterUpdateRoom;

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
  * @function getRoomInfo Performs ... 
  * @param {string} area - 
  * @returns {Promise} result
  * @resolves {RoomInfo} roomInfo
  * @rejects {RedisErrObject} err
  */
  function getRoomInfo(area) {
    return q.Promise(function(resolve, reject, notify){
        var stateIndexKey = area + ':state';

        opts.client.hgetall( stateIndexKey, function(err, roomInfo){
          if(err) {
            reject(err);
            return;
          }

          console.log("getRoomInfo");
          console.dir(roomInfo);

          //unserializeRoomInfo(roomInfo);
          resolve(roomInfo);
        });
    });
  }

  /**
  * @function getRoomState Performs ... 
  * @param {string} area - 
  * @returns {Promise} result
  * @resolves Array of promises results
  * @rejects {RedisErrObject} err
  */
  function getRoomState( area ) {
    return q.all( [
        require('./RedisUserDao')({client: opts.client}).getConnectedUsers( area ), 
        require('./RedisQuestionDao')({client: opts.client}).getQuestions( area ),
        getRoomInfo( area )      
      ] );
  }

  /**
  * @function casterUpdateRoom Performs ... 
  * @param {string} room - name (identifier) of the webcast room (socketio) channel
  * @param {RoomInfo} roomInfo - 
  * @param {number} expire - number in seconds to expire the key, should be set to a number that represents 
  *   the end of the webcast session.
  * @param {RedisClient} client - client connection to redis.
  * @returns {Promise} result
  * @resolves no result when the key successfuly persisted
  * @rejects {RedisErrObject} err
  */
  function casterUpdateRoom(room, roomInfo, expire) {
    return q.Promise(function(resolve, reject, notify){
      var roomStateIndexKey = room + ':state';

      opts.client.multi()
        .hmset( roomStateIndexKey, ['title', roomInfo.title,'message', roomInfo.message])
        .exec(function(err){
          if(err === null){
            resolve();
          }else{
            reject(err);
          }
        })
    });
  }


  return that;
};