const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db      = require('../config/db');
const { jwtSecret, jwtExpiresIn } = require('../config/env');
const { asyncHandler } = require('../middleware/error');

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const [[user]] = await db.query(`SELECT * FROM users WHERE email = ?`, [email]);

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    jwtSecret,
    { expiresIn: jwtExpiresIn }
  );

  res.json({ success: true, data: { token, user: { id: user.id, email: user.email, name: user.name, role: user.role } } });
});

exports.me = asyncHandler(async (req, res) => {
  const [[user]] = await db.query(
    `SELECT id, email, name, role, created_at FROM users WHERE id = ?`, [req.user.id]
  );
  res.json({ success: true, data: user });
});