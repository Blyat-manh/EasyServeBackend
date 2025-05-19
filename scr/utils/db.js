const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: 'hopper.proxy.rlwy.net',
  user: 'root',
  password: 'OlZAMjOlSoZkGTuRAbwGumamEMQuWrca',
  database: 'tpv',
  port: 54175
});

module.exports = pool;