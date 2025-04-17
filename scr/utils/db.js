const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: 'nozomi.proxy.rlwy.net',
  user: 'root',
  password: 'QosWINxBAdmUnLLblfCubgMcQzCpUlWN',
  database: 'tpv',
  port: 53598
});

module.exports = pool;