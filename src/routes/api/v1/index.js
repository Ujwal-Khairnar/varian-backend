const router = require('express').Router();

router.use('/auth',       require('./auth'));
router.use('/challenges', require('./challenges'));
router.use('/solutions',  require('./solutions'));
router.use('/locations',  require('./locations'));
router.use('/sessions',   require('./sessions'));
router.use('/analytics',  require('./analytics'));
router.use('/feedback',   require('./feedback'));
router.use('/upload', require('./upload'));

module.exports = router;