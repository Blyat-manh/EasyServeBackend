const pool = require('../utils/db');

// Obtener todo el inventario
const getAllInventory = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM inventory');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Crear un nuevo artículo en el inventario
const createInventoryItem = async (req, res) => {
  const { name, quantity } = req.body;
  try {
    const [result] = await pool.query('INSERT INTO inventory (name, quantity) VALUES (?, ?)', [name, quantity]);
    res.json({ id: result.insertId, name, quantity });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Actualizar un artículo del inventario
const updateInventoryItem = async (req, res) => {
  const { id } = req.params;
  const { name, quantity } = req.body;
  try {
    await pool.query('UPDATE inventory SET name = ?, quantity = ? WHERE id = ?', [name, quantity, id]);
    res.json({ id, name, quantity });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Eliminar un artículo del inventario
const deleteInventoryItem = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM inventory WHERE id = ?', [id]);
    res.json({ message: 'Item deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getAllInventory, createInventoryItem, updateInventoryItem, deleteInventoryItem };