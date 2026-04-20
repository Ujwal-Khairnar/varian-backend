const router = require('express').Router();
const { body } = require('express-validator');
const validate = require('../../../middleware/validate');
const { authenticate, requireAdmin } = require('../../../middleware/auth');
const ctrl = require('../../../controllers/feedbackController');

router.post('/',
  [body('rating').optional().isInt({ min: 1, max: 5 })],
  validate,
  ctrl.submit
);

router.get('/', authenticate, requireAdmin, ctrl.getAll);

module.exports = router;