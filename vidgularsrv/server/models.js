'use strict';

exports = module.exports = function(app, mongoose) {
  //then regular docs
  require('./app/schema/Pages')(app, mongoose);
  require('./app/schema/Users')(app, mongoose);
};