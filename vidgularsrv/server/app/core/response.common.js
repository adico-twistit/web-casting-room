/**
 * @fileoverview Redis data layer. requires {@link q} or {@link https://github.com/kriskowal/q}
 * @author adico@twistit.co.il (Adi Cohen)
 * @requires q
 */

/**
 * Repository module for webcasting room communication persistance on RedisStore
 * @module models/repository
 */
module.exports = function() {
    'use strict';

    const OK = 200;
    const FAIL = 400;

    function init(opts) {
        var that = {},
            hlp_err = require('./err.common'),
            q = require('q');

        opts = opts || {};
        if (!(opts.res && typeof opts.res === 'object' )) {
            hlp_err.createAppError({message: 'res not instance of response'});
            return null;
        }

        /**
        * @typedef {Object} Packet
        * @property {boolean} success
        * @property {Object|string} data: if success json or value, if fail error
        */

        /**
        * @typedef {Object} Spec
        * @property {boolean} isJson
        * @property {Object|string} packet
        * @property {number} status
        */


        function respond(spec) {
            // packet success property can fill-in status code if missing 
            var statusCode = ( spec.packet && spec.packet.success || false ) ? OK : FAIL;
            spec.status = spec.status || statusCode;

            if(spec.isJson) {
                res.json(spec.packet);
            } else {
                if(spec.packet) {
                    opts.res.status(spec.status).send(spec.packet);
                } else {
                    opts.res.status(spec.status).end();
                }
            }
        }

        function packageError(err) {
            return { message: err };
        }

        function packageResponse(packet) {
            return { success: packet.success, data: packet.data };
        }

        that.respond = respond;
        return that;
    }

    var that = {};
    that.init = init;
    that.OK = OK;
    that.FAIL = FAIL;

    return that;
};