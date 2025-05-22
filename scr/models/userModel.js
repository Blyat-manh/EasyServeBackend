const db = require('../utils/db');

// Obtener usuario por nombre
const getUserByUsername = async (username) => {
  const [rows] = await db.query('SELECT * FROM users WHERE name = ?', [username]);
  return rows[0];
};

// Actualizar contraseña
const updateUserPassword = async (username, newHashedPassword) => {
  await db.query('UPDATE users SET password = ? WHERE name = ?', [newHashedPassword, username]);
};

module.exports = { getUserByUsername, updateUserPassword };
