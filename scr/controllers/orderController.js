const pool = require('../utils/db');

// Obtener todos los pedidos
const getAllOrders = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM orders');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Crear un nuevo pedido
const createOrder = async (req, res) => {
  const { table, items, completed } = req.body;
  try {
    const [result] = await pool.query('INSERT INTO orders (table, items, completed) VALUES (?, ?, ?)', [table, JSON.stringify(items), completed]);
    res.json({ id: result.insertId, table, items, completed });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Actualizar un pedido
const updateOrder = async (req, res) => {
  const { id } = req.params;
  const { table, items, completed } = req.body;
  try {
    await pool.query('UPDATE orders SET table = ?, items = ?, completed = ? WHERE id = ?', [table, JSON.stringify(items), completed, id]);
    res.json({ id, table, items, completed });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Eliminar un pedido
const deleteOrder = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM orders WHERE id = ?', [id]);
    res.json({ message: 'Order deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener pedidos por mesa
const getOrdersByTable = async (req, res) => {
  const { table } = req.params;
  try {
    const [rows] = await pool.query('SELECT * FROM orders WHERE table = ?', [table]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Marcar pedido como cobrado
const markOrderAsPaid = async (req, res) => {
  const { table } = req.params;
  try {
    await pool.query('UPDATE orders SET completed = true WHERE table = ?', [table]);
    res.json({ message: 'Order marked as paid' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getAllOrders, createOrder, updateOrder, deleteOrder, getOrdersByTable, markOrderAsPaid };