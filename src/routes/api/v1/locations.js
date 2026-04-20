const router = require('express').Router();
const { authenticate, requireAdmin } = require('../../../middleware/auth');
const ctrl = require('../../../controllers/locationController');

router.get('/',      ctrl.getAll);
router.get('/:id',   ctrl.getOne);
router.post('/',     authenticate, requireAdmin, ctrl.create);
router.patch('/:id', authenticate, requireAdmin, ctrl.update);
router.delete('/:id',authenticate, requireAdmin, ctrl.remove);

module.exports = router;