const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host:            process.env.DB_HOST     || 'localhost',
  port:            parseInt(process.env.DB_PORT || '3306'),
  user:            process.env.DB_USER     || 'root',
  password:        process.env.DB_PASSWORD || '',
  database:        process.env.DB_NAME     || 'varian_db',
  waitForConnections: true,
  connectionLimit:    2,
  queueLimit:         0,
  dateStrings:        true,
  charset:            'utf8mb4',
});

console.log('✅  MySQL connected');

module.exports = pool;