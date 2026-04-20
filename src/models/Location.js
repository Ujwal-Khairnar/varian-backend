const db = require('../config/db');

class Location {
  static async findAll() {
    const [rows] = await db.query(
      `SELECT * FROM locations WHERE is_active = 1 ORDER BY sort_order`
    );
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.query(
      `SELECT * FROM locations WHERE id = ? AND is_active = 1`, [id]
    );
    if (!rows[0]) return null;
    return this._attachDetails(rows[0]);
  }

  static async _attachDetails(location) {
    const [challenges] = await db.query(
      `SELECT challenge AS text, sort_order FROM location_challenges
       WHERE location_id = ? ORDER BY sort_order`, [location.id]
    );
    const [valueAdds] = await db.query(
      `SELECT value_add AS text, sort_order FROM location_value_adds
       WHERE location_id = ? ORDER BY sort_order`, [location.id]
    );
    const [testimonials] = await db.query(
      `SELECT quote, person_name, person_role FROM location_testimonials
       WHERE location_id = ?`, [location.id]
    );

    return {
      ...location,
      key_challenges: challenges.map(c => c.text),
      key_value_adds: valueAdds.map(v => v.text),
      testimonial:    testimonials[0] || null,
    };
  }

  static async create({ name, lat, lng, image_url, hero_image_url, stat, stat_desc,
                         story_title, partnership_years, sort_order = 0 }) {
    const [result] = await db.query(
      `INSERT INTO locations
       (name,lat,lng,image_url,hero_image_url,stat,stat_desc,story_title,partnership_years,sort_order)
       VALUES (?,?,?,?,?,?,?,?,?,?)`,
      [name, lat, lng, image_url, hero_image_url||null, stat, stat_desc,
       story_title||null, partnership_years||null, sort_order]
    );
    return this.findById(result.insertId);
  }

  static async addChallenge(location_id, challenge, sort_order = 0) {
    await db.query(
      `INSERT INTO location_challenges (location_id, challenge, sort_order) VALUES (?,?,?)`,
      [location_id, challenge, sort_order]
    );
  }

  static async addValueAdd(location_id, value_add, sort_order = 0) {
    await db.query(
      `INSERT INTO location_value_adds (location_id, value_add, sort_order) VALUES (?,?,?)`,
      [location_id, value_add, sort_order]
    );
  }

  static async addTestimonial(location_id, { quote, person_name, person_role }) {
    await db.query(
      `INSERT INTO location_testimonials (location_id, quote, person_name, person_role)
       VALUES (?,?,?,?)`,
      [location_id, quote, person_name||null, person_role||null]
    );
  }

  static async update(id, fields) {
    const allowed = ['name','lat','lng','image_url','hero_image_url','stat','stat_desc',
                     'story_title','partnership_years','sort_order','is_active'];
    const updates = [], values = [];
    for (const key of allowed) {
      if (fields[key] !== undefined) { updates.push(`${key} = ?`); values.push(fields[key]); }
    }
    if (!updates.length) return null;
    values.push(id);
    await db.query(`UPDATE locations SET ${updates.join(', ')} WHERE id = ?`, values);
    return this.findById(id);
  }

  static async delete(id) {
    await db.query(`UPDATE locations SET is_active = 0 WHERE id = ?`, [id]);
  }
}

module.exports = Location;