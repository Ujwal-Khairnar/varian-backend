const Location     = require('../models/Location');
const { asyncHandler } = require('../middleware/error');

exports.getAll = asyncHandler(async (req, res) => {
  const locations = await Location.findAll();
  res.json({ success: true, data: locations });
});

exports.getOne = asyncHandler(async (req, res) => {
  const loc = await Location.findById(req.params.id);
  if (!loc) return res.status(404).json({ success: false, message: 'Location not found' });
  res.json({ success: true, data: loc });
});

exports.create = asyncHandler(async (req, res) => {
  const loc = await Location.create(req.body);
  res.status(201).json({ success: true, data: loc });
});

exports.update = asyncHandler(async (req, res) => {
  const loc = await Location.update(req.params.id, req.body);
  if (!loc) return res.status(404).json({ success: false, message: 'Location not found' });
  res.json({ success: true, data: loc });
});

exports.remove = asyncHandler(async (req, res) => {
  await Location.delete(req.params.id);
  res.json({ success: true, message: 'Location deactivated' });
});