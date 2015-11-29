'use strict';

function createApp(dbConn, mongoose) {

var WcError = require('./app/core/err.common');
var express = require('express');
var path = require('path');
var redis = require('redis');
var favicon = require('serve-favicon');
var logger = require('morgan');
var config = require('./config');
var cookieParser = require('cookie-parser')(config.COOKIE_SECRET);
var bodyParser = require('body-parser');
var ExpressSession = require('express-session');
var RedisStore = require('connect-redis')(ExpressSession);
var rClient = redis.createClient();
var sessionStore = new RedisStore({client: rClient});

var colors = require('colors');
var cors = require('cors');

var app = express();
app.db = dbConn.connection;

//config data models
require('./models')(app, mongoose);

console.log( 'NODE_ENV: "' + app.get('env') + '"' );

var routes = require('./app/routes/index');
var api_me = require('./app/routes/api.me');
var api_users = require('./app/routes/api.users');
var auth = require('./app/routes/auth');
var pages = require('./app/routes/pages');


app.use(function (req, resp, next) {
    if(!app.locals.shutting_down)
    return next();

    resp.setHeader('Connection', "close");
    resp.send(503, "Server is in the process of restarting");
    // Change the response to something your client is expecting:
    //   html, text, json, etc.
});

var session = ExpressSession({
    store: sessionStore,
    secret: config.COOKIE_SECRET,
    /* key:'jsessionid', */ 
    resave: true,
    saveUninitialized: true
});

// view engine setup
app.set('views', path.join(__dirname, 'app/views'));
app.set('view engine', 'ejs');

app.use(cors());

app.all('/*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "origin, x-requested-with, content-type");
    res.header("Access-Control-Allow-Methods", "PUT, GET, POST, DELETE, OPTIONS");
    next();
});

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
/*
 Use cookieParser and session middlewares together.
 By default Express/Connect app creates a cookie by name 'connect.sid'.But to scale Socket.io app,
 make sure to use cookie name 'jsessionid' (instead of connect.sid) use Cloud Foundry's 'Sticky Session' feature.
 W/o this, Socket.io won't work if you have more than 1 instance.
 If you are NOT running on Cloud Foundry, having cookie name 'jsessionid' doesn't hurt - it's just a cookie name.

 link: https://github.com/rajaraodv/redispubsub
 */
app.use(cookieParser);
app.use(session);

// Force HTTPS on Heroku
if (app.get('env') === 'production') {
  app.use(function(req, res, next) {
    var protocol = req.get('x-forwarded-proto');
    protocol == 'https' ? next() : res.redirect('https://' + req.hostname + req.url);
  });
}

app.use(express.static(path.join(__dirname, '../frontend/app')));
app.use(express.static(path.join(__dirname, 'public')));

/*
    setup routes
*/
app.use('/', routes);
app.use('/api/me', api_me);
app.use('/api/users', api_users);
app.use('/auth', auth);
app.use('/pages', pages);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('404 Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        WcError.handleError(err, req, res, function(_err) {
            res.render('error', {
                message: _err.message,
                status: _err.status,
                stack: _err.stack
            } );
        });
    });
}

// production error handler
// no stacktraces leaked to user
if (app.get('env') === 'production') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        WcError.handleError(err, req, res, function(_err) {
            res.render('error', {
                message: _err.message,
                status: _err.status,
                stack: ''
            } );
        });
    });
}

// passing the session store and cookieParser
app.sessionStore = sessionStore;
app.cookieParser = cookieParser;
app.session = session;

return app;
}

module.exports = function(dbConn,mongoose) {
    return createApp(dbConn,mongoose);
};