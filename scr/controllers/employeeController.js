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
  const { role, password, security_answer } = req.body;

  if (!role && !password && !security_answer) {
    return res.status(400).json({ error: 'Debe proporcionar rol, contraseña o respuesta para actualizar' });
  }

  try {
    // Construir dinámicamente la consulta y los parámetros
    let fields = [];
    let values = [];

    if (role) {
      fields.push('role = ?');
      values.push(role);
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      fields.push('password = ?');
      values.push(hashedPassword);
    }

    if (security_answer) {
      const hashedAnswer = await bcrypt.hash(security_answer, 10);
      fields.push('security_answer = ?');
      values.push(hashedAnswer);
    }

    values.push(name); // Para el WHERE

    const query = `UPDATE users SET ${fields.join(', ')} WHERE name = ?`;

    const [result] = await pool.query(query, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Empleado no encontrado' });
    }

    // Opcional: puedes devolver el usuario actualizado sin password ni respuesta cifrada
    const [updatedUser] = await pool.query('SELECT id, name, role FROM users WHERE name = ?', [name]);

    res.json({ employee: updatedUser[0], message: 'Empleado actualizado exitosamente' });

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

// Obtener un solo empleado por ID
const getEmployeeById = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.query('SELECT id, name, role FROM users WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Empleado no encontrado' });
    }

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


module.exports = { getAllEmployees, createEmployee, updateEmployee, deleteEmployee, getEmployeeById };
