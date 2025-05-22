const pool = require('../utils/db');

// Obtener todas las mesas
const getAllTables = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, table_number, created_at FROM tables ORDER BY table_number');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Crear una nueva mesa
const createTable = async (req, res) => {
  const { table_number } = req.body;

  if (!table_number) {
    return res.status(400).json({ error: 'El número de mesa es obligatorio' });
  }

  try {
    // Verificar si ya existe esa mesa
    const [existing] = await pool.query('SELECT * FROM tables WHERE table_number = ?', [table_number]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'El número de mesa ya existe' });
    }

    const [result] = await pool.query(
      'INSERT INTO tables (table_number) VALUES (?)',
      [table_number]
    );

    res.status(201).json({ id: result.insertId, table_number, message: 'Mesa creada exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Actualizar mesa por id
const updateTable = async (req, res) => {
  const { id } = req.params;
  const { table_number } = req.body;

  if (!table_number) {
    return res.status(400).json({ error: 'El número de mesa es obligatorio' });
  }

  try {
    // Verificar si el nuevo número ya está en uso (por otra mesa)
    const [existing] = await pool.query(
      'SELECT * FROM tables WHERE table_number = ? AND id != ?',
      [table_number, id]
    );
    if (existing.length > 0) {
      return res.status(400).json({ error: 'El número de mesa ya está en uso' });
    }

    const [result] = await pool.query(
      'UPDATE tables SET table_number = ? WHERE id = ?',
      [table_number, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Mesa no encontrada' });
    }

    res.json({ id, table_number, message: 'Mesa actualizada exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Eliminar mesa por id
const deleteTable = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query('DELETE FROM tables WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Mesa no encontrada' });
    }

    res.json({ message: 'Mesa eliminada exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getAllTables, createTable, updateTable, deleteTable };
