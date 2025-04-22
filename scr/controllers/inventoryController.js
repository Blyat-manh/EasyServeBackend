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
  const { name, price } = req.body;
  try {
    if (isNaN(price)) {
      return res.status(400).json({ error: 'El precio debe ser un número válido' });
    }

    const [result] = await pool.query('INSERT INTO inventory (name, price) VALUES (?, ?)', [name, price]);
    res.json({ id: result.insertId, name, price });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Actualizar un artículo del inventario
const updateInventoryItem = async (req, res) => {
  const { id } = req.params;
  const { name, price } = req.body;
  try {
    if (isNaN(price)) {
      return res.status(400).json({ error: 'El precio debe ser un número válido' });
    }

    await pool.query('UPDATE inventory SET name = ?, price = ? WHERE id = ?', [name, price, id]);
    res.json({ id, name, price });
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