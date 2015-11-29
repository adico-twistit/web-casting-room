'use strict';

var mResponse = require('../core/response.common')();

exports.getUser = function (req, res) {
    var UserDao = require('../dao/MongoUserDao')({app: req.app});
    UserDao.findById(req.user).then( 
        function success(user) {
            mResponse.init({res: res})
              .respond({status: mResponse.OK, packet: user});
        },
        function fail(err) {
            mResponse.init({res: res})
              .respond({status: mResponse.FAIL, packet: err});
        });
  };

exports.putUser = function(req, res) {
    var UserDao = require('../dao/MongoUserDao')({app: req.app});
    UserDao.findById(req.user).then( 
        function success(user) {

          UserDao.update(user,{displayName: req.body.displayName, email: req.body.email }).then(
              function success(user){
                  mResponse.init({res: res})
                    .respond({status: mResponse.OK});
              },
              function fail(err) {
                  mResponse.init({res: res})
                    .respond({status: mResponse.FAIL, packet: err});
              }
          );
            
        },
        function fail(err) {
            mResponse.init({res: res})
              .respond({status: mResponse.FAIL, packet: err});
        });
  };