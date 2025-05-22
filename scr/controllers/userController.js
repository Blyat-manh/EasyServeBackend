const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { getUserByUsername } = require('../models/userModel');
require('dotenv').config();

const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const user = await getUserByUsername(username);

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token, role: user.role });

  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const recoverPassword = async (req, res) => {
  const { name, security_answer, new_password } = req.body;

  if (!name || !security_answer || !new_password) {
    return res.status(400).json({ error: 'Todos los campos son requeridos' });
  }

  try {
    const [users] = await pool.query('SELECT * FROM users WHERE name = ?', [name]);

    if (users.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const user = users[0];
    const isAnswerCorrect = await bcrypt.compare(security_answer, user.security_answer);

    if (!isAnswerCorrect) {
      return res.status(401).json({ error: 'Respuesta incorrecta a la pregunta de seguridad' });
    }

    const hashedNewPassword = await bcrypt.hash(new_password, 10);
    await pool.query('UPDATE users SET password = ? WHERE name = ?', [hashedNewPassword, name]);

    res.json({ message: 'Contraseña actualizada exitosamente' });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


module.exports = { loginUser, recoverPassword };
