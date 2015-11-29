'use strict';

var mResponse = require('../core/response.common');

exports.getUsers = function(req, res, next) {
      req.app.db.models.User.find(function (err, users) {
        if (err) return next(err);
        res.json(users);
      });
    };

exports.postUser = function(req, res, next) {
      req.app.db.models.User.create( req.body, function (err, user) {
        if (err) {
          if( err.code == '11000' )
          {
            if(err.message.indexOf('email') > -1 )
            {
               res.json( { success: false, data:{ message:'duplicate email' } } ); 
            }
            else if(err.message.indexOf('email') > -1 ) {
                res.json( { success: false, data:{ message:'duplicate username' } } ); 
            }
            else
            {
                res.json( { success: false, data: err.toJSON() } ); 
            }
            return;
          }

          return next(err);
        };
        res.json( { success: true, data: user } );
      });
    };

exports.getUser = function(req, res, next) {
      var id = req.params.id;
      if( !Number.isInteger( id ) ) {
        req.app.db.models.User.findOne( { email: req.params.id }, function (err, user) {
          if (err) return next(err);
          res.json(user);
          return
        });
        return;
      }

      req.app.db.models.User.findById(req.params.id, function (err, user) {
        if (err) return next(err);
        res.json(user);
      });
    };

exports.putUser = function(req, res, next) {
      req.app.db.models.User.findByIdAndUpdate(req.params.id, req.body, function (err, user) {
        if (err) return next(err);
        res.json(user);
      });
    };

exports.deleteUser = function(req, res, next) {
      req.app.db.models.User.findByIdAndRemove(req.params.id, req.body, function (err, user) {
        if (err) return next(err);
        res.json(user);
      });
    };
    