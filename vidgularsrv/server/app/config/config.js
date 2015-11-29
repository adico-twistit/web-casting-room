(function() {
    /**
     * configuration file
     *
     */

    'use strict';

    var path = require('path');
    var rootPath = path.normalize(__dirname + '/..');

    module.exports = {
      development: {
        root: rootPath, 
        db: "mongodb://localhost/session-auth",
        app: {
          name: "angular-express-session-authentication"
        },
        facebook: {
          clientID: "[Enter Yours]",
          clientSecret: "[Enter Yours]",
          callbackURL: "http://localhost:3000/auth/facebook/callback" 
        }
      },
      test: {},
      production: {}
    };    
})();
