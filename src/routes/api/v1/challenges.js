const router = require('express').Router();
const { body } = require('express-validator');
const validate    = require('../../../middleware/validate');
const { authenticate, requireAdmin } = require('../../../middleware/auth');
const ctrl        = require('../../../controllers/challengeController');

router.get('/',      ctrl.getAll);
router.get('/:id',   ctrl.getOne);

// Admin-only mutations
router.post('/',
  authenticate, requireAdmin,
  [body('icon').notEmpty(), body('text').notEmpty()],
  validate,
  ctrl.create
);

router.patch('/:id', authenticate, requireAdmin, ctrl.update);
router.delete('/:id',authenticate, requireAdmin, ctrl.remove);

module.exports = router;