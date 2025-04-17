const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'nozomi.proxy.rlwy.net',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'QosWINxBAdmUnLLblfCubgMcQzCpUlWN',
  database: process.env.DB_NAME || 'tpv',
  port: process.env.DB_PORT || 3306
});

module.exports = pool;