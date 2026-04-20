const db = require('../config/db');

class Solution {
  // Fetch a full solution with its features OR deliverables+use-cases
  static async findById(id) {
    const [rows] = await db.query(
      `SELECT * FROM solutions WHERE id = ? AND is_active = 1`, [id]
    );
    if (!rows[0]) return null;
    const solution = rows[0];
    return solution.is_aos
      ? this._attachDeliverables(solution)
      : this._attachFeatures(solution);
  }

  static async findAll({ ids } = {}) {
    let query  = `SELECT * FROM solutions WHERE is_active = 1`;
    let params = [];
    if (ids && ids.length) {
      query += ` AND id IN (${ids.map(() => '?').join(',')})`;
      params = ids;
    }
    query += ` ORDER BY sort_order`;
    const [rows] = await db.query(query, params);

    const results = await Promise.all(rows.map(s =>
      s.is_aos ? this._attachDeliverables(s) : this._attachFeatures(s)
    ));
    return results;
  }

  static async _attachFeatures(solution) {
    const [features] = await db.query(
      `SELECT * FROM solution_features WHERE solution_id = ? ORDER BY sort_order`,
      [solution.id]
    );

    const withBullets = await Promise.all(features.map(async f => {
      const [bullets] = await db.query(
        `SELECT bullet FROM solution_feature_bullets WHERE feature_id = ? ORDER BY sort_order`,
        [f.id]
      );
      return { ...f, bullets: bullets.map(b => b.bullet) };
    }));

    return { ...solution, features: withBullets };
  }

  static async _attachDeliverables(solution) {
    const [deliverables] = await db.query(
      `SELECT item_text FROM solution_deliverables WHERE solution_id = ? ORDER BY sort_order`,
      [solution.id]
    );
    const [useCases] = await db.query(
      `SELECT item_text FROM solution_use_cases WHERE solution_id = ? ORDER BY sort_order`,
      [solution.id]
    );
    return {
      ...solution,
      deliverables: deliverables.map(d => d.item_text),
      useCases:     useCases.map(u => u.item_text),
    };
  }

  static async create(data) {
    const conn = await (require('../config/db')).getConnection();
    try {
      await conn.beginTransaction();
      const { id, name, subtitle, is_aos, icon, left_label, right_label, sort_order,
              features, deliverables, useCases } = data;

      await conn.query(
        `INSERT INTO solutions (id,name,subtitle,is_aos,icon,left_label,right_label,sort_order)
         VALUES (?,?,?,?,?,?,?,?)`,
        [id, name, subtitle, is_aos ? 1 : 0, icon, left_label||null, right_label||null, sort_order||0]
      );

      if (!is_aos && features) {
        for (let i = 0; i < features.length; i++) {
          const f = features[i];
          const [fr] = await conn.query(
            `INSERT INTO solution_features (solution_id,label,heading,body,sort_order) VALUES (?,?,?,?,?)`,
            [id, f.label, f.heading, f.body, i]
          );
          for (let j = 0; j < (f.bullets||[]).length; j++) {
            await conn.query(
              `INSERT INTO solution_feature_bullets (feature_id,bullet,sort_order) VALUES (?,?,?)`,
              [fr.insertId, f.bullets[j], j]
            );
          }
        }
      }

      if (is_aos) {
        for (let i = 0; i < (deliverables||[]).length; i++) {
          await conn.query(
            `INSERT INTO solution_deliverables (solution_id,item_text,sort_order) VALUES (?,?,?)`,
            [id, deliverables[i], i]
          );
        }
        for (let i = 0; i < (useCases||[]).length; i++) {
          await conn.query(
            `INSERT INTO solution_use_cases (solution_id,item_text,sort_order) VALUES (?,?,?)`,
            [id, useCases[i], i]
          );
        }
      }

      await conn.commit();
      return this.findById(id);
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }
  }
}

module.exports = Solution;