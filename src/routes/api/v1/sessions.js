const router = require('express').Router();
const ctrl = require('../../../controllers/sessionController');

router.post('/',      ctrl.create);
router.patch('/:id',  ctrl.update);

module.exports = router;