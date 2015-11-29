'use strict';

var mResponse = require('../core/response.common');

exports.getHomepage = function(req, res) {
        var serverName = process.env.VCAP_APP_HOST ? process.env.VCAP_APP_HOST + ":" + process.env.VCAP_APP_PORT : 'localhost:3000';
        //save user from previous session (if it exists)
        var user = req.session.user;
        //regenerate new session & store user from previous session (if it exists)
        req.session.regenerate(function (err) {
            req.session.user = user;
            console.log('req.session.user ' + req.session.user);
            res.render('index', { title:config.APP_NAME, server:serverName, user:req.session.user});
        });
    };
    /*
     When the user logs in (in our case, does http POST w/ user name), store it
     in Express session (which inturn is stored in Redis)
     */

exports.refreshSession = function (req, res) {
        req.session.user = req.body.user;//set username to session
        renderHomePage(req, res);
    };
    
    /*
        Logout from the API
    */
exports.logout = function(req, res) {
        req.session.destroy();
        res.redirect('/');
    };