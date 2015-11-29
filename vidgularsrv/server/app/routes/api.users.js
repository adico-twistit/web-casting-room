(function () {
    'use strict';

    var express = require('express');
    var router = express.Router();

    var ensureAuthenticated = require('../core/auth.common').ensureAuthenticated;

    /* GET /users listing. */
    router.get('/', ensureAuthenticated, require('../ctrls/controller.users').getUsers);

    /* POST /users create. */
    router.post('/', require('../ctrls/controller.users').postUser);

    /* GET /users/id get */
    router.get('/:id', ensureAuthenticated, require('../ctrls/controller.users').getUser);

    /* PUT /users/id update */
    router.put('/:id', ensureAuthenticated, require('../ctrls/controller.users').putUser);

    /* DELETE /users/:id */
    router.delete('/:id', ensureAuthenticated, require('../ctrls/controller.users').deleteUser);

    module.exports = router;
})();