const router = require('express').Router();
const { body } = require('express-validator');
const validate = require('../../../middleware/validate');
const { authenticate } = require('../../../middleware/auth');
const ctrl = require('../../../controllers/authController');

router.post('/login',
  [body('email').isEmail(), body('password').notEmpty()],
  validate,
  ctrl.login
);

router.get('/me', authenticate, ctrl.me);

module.exports = router;