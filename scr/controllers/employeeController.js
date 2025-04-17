const pool = require('../utils/db');

// Obtener todos los empleados
const getAllEmployees = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM employees');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Crear un nuevo empleado
const createEmployee = async (req, res) => {
  const { name, role } = req.body;
  try {
    const [result] = await pool.query('INSERT INTO employees (name, role) VALUES (?, ?)', [name, role]);
    res.json({ id: result.insertId, name, role });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Actualizar un empleado
const updateEmployee = async (req, res) => {
  const { id } = req.params;
  const { name, role } = req.body;
  try {
    await pool.query('UPDATE employees SET name = ?, role = ? WHERE id = ?', [name, role, id]);
    res.json({ id, name, role });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Eliminar un empleado
const deleteEmployee = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM employees WHERE id = ?', [id]);
    res.json({ message: 'Employee deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getAllEmployees, createEmployee, updateEmployee, deleteEmployee };