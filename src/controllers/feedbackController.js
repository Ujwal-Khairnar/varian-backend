const db = require('../config/db');
const { asyncHandler } = require('../middleware/error');

exports.submit = asyncHandler(async (req, res) => {
  const { session_id, rating, comment, page } = req.body;
  await db.query(
    `INSERT INTO feedback (session_id, rating, comment, page) VALUES (?,?,?,?)`,
    [session_id || null, rating || null, comment || null, page || null]
  );
  res.status(201).json({ success: true, message: 'Feedback received' });
});

exports.getAll = asyncHandler(async (req, res) => {
  const [rows] = await db.query(
    `SELECT f.*, us.session_token FROM feedback f
     LEFT JOIN user_sessions us ON us.id = f.session_id
     ORDER BY f.created_at DESC
     LIMIT 200`
  );
  res.json({ success: true, data: rows });
});