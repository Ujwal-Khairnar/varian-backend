const Session      = require('../models/Session');
const { asyncHandler } = require('../middleware/error');

exports.create = asyncHandler(async (req, res) => {
  const { challenge_id, selected_causes } = req.body;
  const session = await Session.create({ challenge_id, selected_causes });
  res.status(201).json({ success: true, data: session });
});

exports.update = asyncHandler(async (req, res) => {
  const { challenge_id, selected_causes } = req.body;
  await Session.update(req.params.id, { challenge_id, selected_causes });
  res.json({ success: true, message: 'Session updated' });
});

exports.logView = asyncHandler(async (req, res) => {
  const { session_id } = req.body;
  const { solution_id } = req.params;
  await Session.logView(session_id, solution_id);
  res.json({ success: true, message: 'View logged' });
});