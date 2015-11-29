/**
 * @fileoverview Mongoose Data Layer/User DAO. requires {@link q} or {@link https://github.com/kriskowal/q}
 * @author adico@twistit.co.il (Adi Cohen)
 * @requires q
 */

/**
 * Repository module for user store on mongoose
 * @module app/dao/MongoUserDao
 */
module.exports = function MongoUserDao(opts) {
    'use strict';

    opts = opts || {};
    opts.app = opts.app || require('express')();
    
    var that = {},
        q = require('q');


    function findById(user) {
        return opts.app.db.models.User.findById(user).exec();
    }

    function update(user, spec) {
        if (!user) {
            return q.fcall( new Error('User not found') );
        }

        user.displayName = spec.displayName || user.displayName;
        user.email = spec.email || user.email;
        return user.save();
    }

    that.findById = findById;
    that.update = update;

    return that;
};