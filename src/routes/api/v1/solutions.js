const router = require('express').Router();
const { authenticate, requireAdmin } = require('../../../middleware/auth');
const ctrl = require('../../../controllers/solutionController');

router.get('/',     ctrl.getAll);
router.get('/:id',  ctrl.getOne);
router.post('/',    authenticate, requireAdmin, ctrl.create);

// Log a solution view
router.post('/:solution_id/view',
  require('../../../controllers/sessionController').logView
);

module.exports = router;