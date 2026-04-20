const Challenge    = require('../models/Challenge');
const { asyncHandler } = require('../middleware/error');

exports.getAll = asyncHandler(async (req, res) => {
  const challenges = await Challenge.findAll();
  res.json({ success: true, data: challenges });
});

exports.getOne = asyncHandler(async (req, res) => {
  const challenge = await Challenge.findWithSolutions(req.params.id);
  if (!challenge) return res.status(404).json({ success: false, message: 'Challenge not found' });
  res.json({ success: true, data: challenge });
});

exports.create = asyncHandler(async (req, res) => {
  const challenge = await Challenge.create(req.body);
  res.status(201).json({ success: true, data: challenge });
});

exports.update = asyncHandler(async (req, res) => {
  const challenge = await Challenge.update(req.params.id, req.body);
  if (!challenge) return res.status(404).json({ success: false, message: 'Challenge not found' });
  res.json({ success: true, data: challenge });
});

exports.remove = asyncHandler(async (req, res) => {
  await Challenge.delete(req.params.id);
  res.json({ success: true, message: 'Challenge deactivated' });
});