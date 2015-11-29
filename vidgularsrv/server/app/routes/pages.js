var router = require('express').Router();

/* GET /pages listing. */
router.get('/', require('../ctrls/controller.pages').getPages );

/* POST /pages create. */
router.post('/', require('../ctrls/controller.pages').postPage );

/* GET /pages/id get */
router.get('/:id', require('../ctrls/controller.pages').getPage);

/* PUT /pages/id update */
router.put('/:id', require('../ctrls/controller.pages').putPage);

/* DELETE /pages/:id */
router.delete('/:id', require('../ctrls/controller.pages').deletePage);

module.exports = router;