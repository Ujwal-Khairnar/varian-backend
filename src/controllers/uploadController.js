const { PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const s3Client  = require('../config/s3');
const db        = require('../config/db');
const { asyncHandler } = require('../middleware/error');

// Upload image to S3 — returns the public URL
exports.uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  res.json({
    success: true,
    data: {
      url:          req.file.location,
      key:          req.file.key,
      originalName: req.file.originalname,
      size:         req.file.size,
      mimetype:     req.file.mimetype,
    },
  });
});

// Add challenge image to DB
exports.addChallengeImage = asyncHandler(async (req, res) => {
  const { challenge_id, image_url, alt_text } = req.body;
  await db.query(
    `INSERT INTO challenge_images (challenge_id, image_url, alt_text) VALUES (?,?,?)`,
    [challenge_id, image_url, alt_text || null]
  );
  res.status(201).json({ success: true, message: 'Challenge image saved' });
});

// Get all images for a challenge
exports.getChallengeImages = asyncHandler(async (req, res) => {
  const [rows] = await db.query(
    `SELECT * FROM challenge_images WHERE challenge_id = ? ORDER BY created_at DESC`,
    [req.params.challenge_id]
  );
  res.json({ success: true, data: rows });
});