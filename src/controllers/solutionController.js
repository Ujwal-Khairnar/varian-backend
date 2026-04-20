const Solution     = require('../models/Solution');
const { asyncHandler } = require('../middleware/error');

exports.getAll = asyncHandler(async (req, res) => {
  // Allow ?ids=aria-core,eclipse for filtered fetch
  const ids = req.query.ids ? req.query.ids.split(',') : undefined;
  const solutions = await Solution.findAll({ ids });
  res.json({ success: true, data: solutions });
});

exports.getOne = asyncHandler(async (req, res) => {
  const solution = await Solution.findById(req.params.id);
  if (!solution) return res.status(404).json({ success: false, message: 'Solution not found' });
  res.json({ success: true, data: solution });
});

exports.create = asyncHandler(async (req, res) => {
  const solution = await Solution.create(req.body);
  res.status(201).json({ success: true, data: solution });
});