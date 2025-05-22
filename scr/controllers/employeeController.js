const pool = require('../utils/db');
const bcrypt = require('bcrypt');

// Obtener todos los empleados (sin contraseñas)
const getAllEmployees = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, name, role FROM users'); // Incluyo id para mayor flexibilidad
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Crear un nuevo empleado
const createEmployee = async (req, res) => {
  const { name, role, password, security_answer } = req.body;

  if (!name || !role || !password || !security_answer) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios (nombre, rol, contraseña, respuesta)' });
  }

  try {
    const [existingUser] = await pool.query('SELECT * FROM users WHERE name = ?', [name]);
    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'El nombre de usuario ya existe' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const hashedAnswer = await bcrypt.hash(security_answer, 10);

    const [result] = await pool.query(
      'INSERT INTO users (name, password, security_answer, role) VALUES (?, ?, ?, ?)',
      [name, hashedPassword, hashedAnswer, role]
    );

    res.status(201).json({ id: result.insertId, name, role, message: 'Empleado creado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Actualizar un empleado por nombre (aunque mejor usar id)
const updateEmployee = async (req, res) => {
  const { name } = req.params;
  const { role, password } = req.body;

  if (!role && !password) {
    return res.status(400).json({ error: 'Debe proporcionar rol o contraseña para actualizar' });
  }

  try {
    let query, queryParams;

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      query = 'UPDATE users SET role = ?, password = ? WHERE name = ?';
      queryParams = [role, hashedPassword, name];
    } else {
      query = 'UPDATE users SET role = ? WHERE name = ?';
      queryParams = [role, name];
    }

    const [result] = await pool.query(query, queryParams);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Empleado no encontrado' });
    }

    res.json({ name, role, message: 'Empleado actualizado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Eliminar un empleado por nombre
const deleteEmployee = async (req, res) => {
  const { name } = req.params;

  try {
    const [result] = await pool.query('DELETE FROM users WHERE name = ?', [name]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Empleado no encontrado' });
    }

    res.json({ message: 'Empleado eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getAllEmployees, createEmployee, updateEmployee, deleteEmployee };
