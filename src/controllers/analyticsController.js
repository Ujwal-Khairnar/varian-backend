const db = require('../config/db');
const { asyncHandler } = require('../middleware/error');

exports.overview = asyncHandler(async (req, res) => {
  const [[{ total_sessions }]] = await db.query(
    `SELECT COUNT(*) AS total_sessions FROM user_sessions`
  );

  const [topChallenges] = await db.query(
    `SELECT c.icon, c.text, COUNT(s.id) AS session_count
     FROM user_sessions s
     JOIN challenges c ON c.id = s.challenge_id
     GROUP BY s.challenge_id
     ORDER BY session_count DESC
     LIMIT 7`
  );

  const [topSolutions] = await db.query(
    `SELECT sol.id, sol.name, COUNT(sv.id) AS view_count
     FROM solution_views sv
     JOIN solutions sol ON sol.id = sv.solution_id
     GROUP BY sv.solution_id
     ORDER BY view_count DESC
     LIMIT 10`
  );

  const [dailyActivity] = await db.query(
    `SELECT DATE(created_at) AS date, COUNT(*) AS sessions
     FROM user_sessions
     WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
     GROUP BY DATE(created_at)
     ORDER BY date`
  );

  res.json({
    success: true,
    data: { total_sessions, topChallenges, topSolutions, dailyActivity },
  });
});