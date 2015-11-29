(function () {
    'use strict';
    var router = require('express').Router();

    /* GET home page. */
    router.get('/', require('../ctrls/controller.index').getHomepage );
    /*
     When the user logs in (in our case, does http POST w/ user name), store it
     in Express session (which inturn is stored in Redis)
     */
    router.post('/user', require('../ctrls/controller.index').refreshSession );
    /*
        Logout from the API
    */
    router.get('/logout', require('../ctrls/controller.index').logout );

    module.exports = router;
})();