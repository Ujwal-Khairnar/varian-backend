const db = require('../config/db');

class Challenge {
  static async findAll() {
    const [challenges] = await db.query(
      `SELECT * FROM challenges WHERE is_active = 1 ORDER BY sort_order`
    );

    const result = await Promise.all(challenges.map(async (c) => {
      const [causes] = await db.query(
        `SELECT id, cause_text AS text, sort_order 
         FROM root_causes 
         WHERE challenge_id = ? 
         ORDER BY sort_order`,
        [c.id]
      );
      return { ...c, root_causes: causes };
    }));

    return result;
  }

  static async findById(id) {
    const [rows] = await db.query(
      `SELECT * FROM challenges WHERE id = ? AND is_active = 1`, [id]
    );
    return rows[0] || null;
  }

  static async findWithSolutions(id) {
    const [cRows] = await db.query(
      `SELECT c.*, 
              GROUP_CONCAT(rc.cause_text ORDER BY rc.sort_order SEPARATOR '|||') AS causes_concat
       FROM challenges c
       LEFT JOIN root_causes rc ON rc.challenge_id = c.id
       WHERE c.id = ? AND c.is_active = 1
       GROUP BY c.id`, [id]
    );
    if (!cRows[0]) return null;

    const [sRows] = await db.query(
      `SELECT s.id, s.name, s.icon, s.is_aos
       FROM solutions s
       JOIN challenge_solutions cs ON cs.solution_id = s.id
       WHERE cs.challenge_id = ?
       ORDER BY cs.sort_order`, [id]
    );

    const challenge = cRows[0];
    return {
      ...challenge,
      causes: challenge.causes_concat
        ? challenge.causes_concat.split('|||')
        : [],
      solutions: sRows,
    };
  }

  static async create({ icon, label, text, sort_order = 0 }) {
    const [result] = await db.query(
      `INSERT INTO challenges (icon, label, text, sort_order) VALUES (?,?,?,?)`,
      [icon, label, text, sort_order]
    );
    return this.findById(result.insertId);
  }

  static async update(id, fields) {
    const allowed = ['icon', 'label', 'text', 'sort_order', 'is_active'];
    const updates = [];
    const values  = [];
    for (const key of allowed) {
      if (fields[key] !== undefined) {
        updates.push(`${key} = ?`);
        values.push(fields[key]);
      }
    }
    if (!updates.length) return null;
    values.push(id);
    await db.query(`UPDATE challenges SET ${updates.join(', ')} WHERE id = ?`, values);
    return this.findById(id);
  }

  static async delete(id) {
    await db.query(`UPDATE challenges SET is_active = 0 WHERE id = ?`, [id]);
    return true;
  }
}

module.exports = Challenge;