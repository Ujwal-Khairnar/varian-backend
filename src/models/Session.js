const db   = require('../config/db');
const { v4: uuidv4 } = require('uuid');

class Session {
  static async create({ challenge_id, selected_causes } = {}) {
    const id    = uuidv4();
    const token = uuidv4();
    await db.query(
      `INSERT INTO user_sessions (id, session_token, challenge_id, selected_causes)
       VALUES (?, ?, ?, ?)`,
      [id, token, challenge_id || null, JSON.stringify(selected_causes || [])]
    );
    return { id, token };
  }

  static async update(id, { challenge_id, selected_causes }) {
    await db.query(
      `UPDATE user_sessions SET challenge_id = ?, selected_causes = ? WHERE id = ?`,
      [challenge_id, JSON.stringify(selected_causes || []), id]
    );
  }

  static async logView(session_id, solution_id) {
    await db.query(
      `INSERT INTO solution_views (session_id, solution_id) VALUES (?, ?)`,
      [session_id, solution_id]
    );
  }

  static async findById(id) {
    const [rows] = await db.query(
      `SELECT * FROM user_sessions WHERE id = ?`, [id]
    );
    return rows[0] || null;
  }
}

module.exports = Session;