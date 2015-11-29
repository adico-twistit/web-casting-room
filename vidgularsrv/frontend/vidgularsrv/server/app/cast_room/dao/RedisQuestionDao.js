/**
 * @fileoverview Redis data layer. requires {@link q} or {@link https://github.com/kriskowal/q}
 * @author adico@twistit.co.il (Adi Cohen)
 * @requires q
 */

/**
 * Repository module for webcasting room communication persistance on RedisStore
 * @module models/repository
 */

/**
  * @typedef {Object} Questions
  * @datastruct SET; keys: questionid; values: {Object} Question 
  * @keyformat [roomName]:questions
  * @valformat [questionid]
  * @redisCommand SADD <area>:questions [question.id]
  * @property {String} userid
  * @property {String} text
  */

/**
  * @typedef {Object} Question
  * @keyformat [roomName]:questions:[questionid] 
  * @property {String} id 
  * @property {String} userid
  * @property {String} text
  * @property {String} age
  */

/**
  * @typedef {Object} Vote
  * @keyformat [roomName]:questions:[questionid]:votes 
  */

module.exports = function(opts) {
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

  /** GET LIST OF POSTED QUESTION. */
  that.getQuestions = getQuestions;
  /** GET QUESTION BY ID. */
  that.getQuestion = getQuestion;
  /** USER ADDING QUESTION. */
  that.userAskQuestion = userAskQuestion;
  /** USER JOINIG/VOTING ON QUESTION. */
  that.userVoteQuestion = userVoteQuestion;
  /** USER WITHDRAW HIS JOIN/VOTE ON QUESTION. */
  that.userUnvoteQuestion = userUnvoteQuestion;
  /** CASTER DELETES A QUESTION. */
  that.casterDeleteQuestion = casterDeleteQuestion;

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
  * @function unserializeQuestion Performs ... 
  * @param {Question} question -
  * @returns nothing
  */
  function unserializeQuestion(question){
  }

  /**
  * @function getQuestion Performs ... 
  * @param {string} key - format [area]:questions:[question_id]
  * @returns {Promise} result
  * @resolves {Question} question
  * @rejects {RedisErrObject} err
  */
  function getQuestion( key ) {
    return q.Promise(function(resolve, reject, notify){
        votesStore = key + ':votes';

        opts.client.hgetall( key, function(err, question){
          if( err )
          {
            reject(err);
            return;
          }

          if( typeof question === 'undefined' || question === null ) {
              reject('User is null');
              return;
          }

            
          opts.client.scard( votesStore, function(err, votesCnt ){
            if( err )
            {
              reject(err);
              return;
            }

            question.votes = 0;

            if( votesCnt && typeof votesCnt === 'number' ) {
              question.votes = 1 * votesCnt;
            }

            unserializeQuestion(question);
            resolve(question);  
          } );
          
        });
    });
  }

  /**
  * @function getQuestions Performs ... 
  * @param {string} area - 
  * @returns {Promise} result
  * @resolves {HashMap} listing multiple key=question_id, value={Question Object}
  * @rejects {RedisErrObject} err
  */
  function getQuestions( area ) {
    return q.Promise(function(resolve, reject, notify){
      console.log('getQuestions main');
      console.dir(area);
      opts.client.smembers(area+':questions', function(err, res){
        if(err) {
          reject(err);
          return;
        }

        if(res.length > 0){
          console.log('getQuestions:');
          console.dir(res);
          var length = res.length;
          var returnQuestions = {};

          res.forEach(function(key){
            if( key )
            {
              getQuestion(key).done(function(question){
                console.dir(question);
                returnQuestions[question.id] = question;
                length--;
                if(length === 0){
                  resolve(returnQuestions);
                }
                  
              }, function(err){
                reject(err);
              });
            }
          });

        }else{
          resolve();
        }
      });
    });
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
  function userAskQuestion(user, area, questionText, expire){
    return q.Promise(function(resolve, reject, notify){
      var indexKey = area + ':questions';
      var questionIdIndexKey = indexKey + ':id';

      // Lock & Get question ID
      opts.client.watch(questionIdIndexKey);
      opts.client.get(questionIdIndexKey,function(err,questionid){
          var multi = opts.client.multi()
          
          // Generating question ID
          questionid++
          
          // Generating retrieval keys for question store & question votes store
          var valueKey = indexKey + ':' + questionid;
          var votesKey = valueKey + ':votes';
          
          // Incrementing question ID on the store
          multi.incr(questionIdIndexKey)
          .hmset(valueKey, ['id', questionid, 'userid', user.id, 'text', questionText, 'age', new Date().getTime()])
          .expire(valueKey, expire) // TODO: expire when room expires
          .sadd(indexKey, valueKey) // Index question
          .expire(indexKey, expire) // TODO: expire when room expires
          .sadd(votesKey, user.id) // Add 1st vote on question
          .expire(votesKey, expire) // TODO: expire when room expires
          .exec(function(err){
            if(err === null){
              getQuestion(valueKey).done(function(retQuestion){
                  resolve(retQuestion);
              }, function(err){
                reject(err);
              });
            }else{
              reject(err);
            }
          })
        })
    });
  }

  function casterDeleteQuestion(question, room, expire) {
    return q.Promise(function(resolve, reject, notify){
      var indexKey = area + ':questions';
      var valueKey = indexKey + ':' + question.id;
      var votesKey = valueKey + ':votes';

      opts.client.multi()
        .hdel( valueKey, 'id', 'userid', 'text', 'email', 'age') 
        .srem(valueKey) // Index question
        .del(votesKey)
        .exec(function(err){
          if(err === null){
            resolve();
          }else{
            reject(err);
          }
        })
    });
  }

  function userVoteQuestion(user, area, question, expire){
    return q.Promise(function(resolve, reject, notify){
      var pIndexKey = area + ':questions';
      var sIndexKey = pIndexKey + ':' + question.id;
      var valueKey = sIndexKey + ':votes';

      opts.client.multi()
        .sadd( valueKey, user.id )
        .expire( valueKey, expire )
        .exec(function(err){
          if(err === null){
            opts.client.scard( valueKey, function(err, votesCnt ){
              if( err )
              {
                reject(err);
                return;
              }

              question.votes = 0;

              if( votesCnt && typeof votesCnt === 'number' ) {
                question.votes = 1 * votesCnt;
              }

              resolve(votesCnt);
            });
          }else{
            reject(err);
          }
        });
    });  
  }

  function userUnvoteQuestion(user, expire){
    return q.Promise(function(resolve, reject, notify){
      var pIndexKey = user.area + ':questions';
      var sIndexKey = indexKey + ':' + question.id;
      var valueKey = sIndexKey + ':votes';

      opts.client.multi()
        .srem( valueKey )
        .exec(function(err){
          if(err === null){
            resolve();
          }else{
            reject(err);
          }
        });
    });  
  }

  return that;
};