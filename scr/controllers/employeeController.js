const pool = require('../utils/db');
const bcrypt = require('bcrypt');  // Para gestionar la contraseña de forma segura

// Obtener todos los empleados
const getAllEmployees = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT name, role FROM users');  // Se seleccionan name y role, sin contraseña
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Crear un nuevo empleado
const createEmployee = async (req, res) => {
  const { name, role, password } = req.body;
  try {
    // Verificar si el nombre ya está en uso (el "id" es el nombre)
    const [existingUser] = await pool.query('SELECT * FROM users WHERE name = ?', [name]);
    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'El nombre de usuario ya existe' });
    }

    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      'INSERT INTO users (name, password, role) VALUES (?, ?, ?)',
      [name, hashedPassword, role]
    );

    res.json({ name, role, message: 'Empleado creado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Actualizar un empleado
const updateEmployee = async (req, res) => {
  const { name } = req.params;  // Usamos el name como identificador
  const { role, password } = req.body;
  try {
    let queryParams = [role, name];
    let query = 'UPDATE users SET role = ? WHERE name = ?';

    // Si se proporciona una nueva contraseña, encriptarla y agregarla a la consulta
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      query = 'UPDATE users SET role = ?, password = ? WHERE name = ?';
      queryParams = [role, hashedPassword, name];
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

// Eliminar un empleado
const deleteEmployee = async (req, res) => {
  const { name } = req.params;  // Usamos el name como identificador
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
