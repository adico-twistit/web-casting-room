(function api_me () {
  var express = require('express');
  var router = express.Router();

  var ensureAuthenticated = require('../core/auth.common').ensureAuthenticated;
  /*
   |--------------------------------------------------------------------------
   | GET /api/me
   |--------------------------------------------------------------------------
   */
  router.get('/', ensureAuthenticated, require('../ctrls/controller.me').getUser );
  /*
   |--------------------------------------------------------------------------
   | PUT /api/me
   |--------------------------------------------------------------------------
   */
  router.put('/', ensureAuthenticated, require('../ctrls/controller.me').putUser);

  module.exports = router;
})();