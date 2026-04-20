const router = require('express').Router();
const { authenticate, requireAdmin } = require('../../../middleware/auth');
const ctrl = require('../../../controllers/analyticsController');

router.get('/overview', authenticate, requireAdmin, ctrl.overview);

module.exports = router;