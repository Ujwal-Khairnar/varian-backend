// const router  = require('express').Router();
// const upload  = require('../../../config/upload');
// const ctrl    = require('../../../controllers/uploadController');
// const { authenticate, requireAdmin } = require('../../../middleware/auth');

// // Middleware to set the S3 folder
// const setFolder = (folder) => (req, res, next) => {
//   req.uploadFolder = folder;
//   next();
// };

// // Upload a location image
// router.post('/location',
//   authenticate, requireAdmin,
//   setFolder('locations'),
//   upload.single('image'),
//   ctrl.uploadImage
// );

// // Upload a challenge card image
// router.post('/challenge',
//   authenticate, requireAdmin,
//   setFolder('challenges'),
//   upload.single('image'),
//   ctrl.uploadImage
// );

// // Save challenge image URL to database
// router.post('/challenge-image',
//   authenticate, requireAdmin,
//   ctrl.addChallengeImage
// );

// // Get challenge images
// router.get('/challenge-images/:challenge_id',
//   ctrl.getChallengeImages
// );

// module.exports = router;
// src/routes/api/v1/upload.js
// NOTE: Auth middleware removed for testing — add it back before going to production

const router = require('express').Router();
const upload = require('../../../config/upload');
const ctrl   = require('../../../controllers/uploadController');

// Middleware to set the S3 folder
const setFolder = (folder) => (req, res, next) => {
  req.uploadFolder = folder;
  next();
};

// ── Upload a location image to S3 ──────────────────────────────────────────
router.post('/location',
  setFolder('locations'),
  upload.single('image'),
  ctrl.uploadImage
);

// ── Upload a challenge card image to S3 ────────────────────────────────────
router.post('/challenge',
  setFolder('challenges'),
  upload.single('image'),
  ctrl.uploadImage
);

// ── Save challenge image URL to database ────────────────────────────────────
router.post('/challenge-image',
  ctrl.addChallengeImage
);

// ── Get all images for a challenge ──────────────────────────────────────────
router.get('/challenge-images/:challenge_id',
  ctrl.getChallengeImages
);

// ── Upload solution icon to S3 ──────────────────────────────────────────────
router.post('/solution',
  setFolder('solutions'),
  upload.single('image'),
  ctrl.uploadImage
);

// ── Generic upload (any folder) ─────────────────────────────────────────────
router.post('/general',
  setFolder('general'),
  upload.single('image'),
  ctrl.uploadImage
);

module.exports = router;