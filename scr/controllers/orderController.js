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

// Calcular el total del pedido a partir de los items
const calculateTotal = (items) => {
  return items.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
};

// Crear un nuevo pedido
const createOrder = async (req, res) => {
  const { table_number, items } = req.body;
  try {
    // Calcula el total del pedido
    const total = calculateTotal(items);

    // Insertar el pedido en la base de datos
    const [result] = await pool.query('INSERT INTO orders (table_number, items, total) VALUES (?, ?, ?)', [table_number, JSON.stringify(items), total]);
    res.json({ id: result.insertId, table_number, items, total });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Actualizar un pedido
const updateOrder = async (req, res) => {
  const { id } = req.params;
  const { table_number, items } = req.body;
  try {
    // Calcula el nuevo total del pedido
    const total = calculateTotal(items);

    // Actualizar el pedido en la base de datos
    await pool.query('UPDATE orders SET table_number = ?, items = ?, total = ? WHERE id = ?', [table_number, JSON.stringify(items), total, id]);
    res.json({ id, table_number, items, total });
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
  const { table_number } = req.params;
  try {
    const [rows] = await pool.query('SELECT * FROM orders WHERE table_number = ?', [table_number]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Marcar pedido como cobrado
const markOrderAsPaid = async (req, res) => {
  const { id } = req.params;
  try {
    // Aquí se puede actualizar el campo total a 0 si el pedido ha sido pagado
    await pool.query('UPDATE orders SET total = 0 WHERE id = ?', [id]);
    res.json({ message: 'Order marked as paid' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getAllOrders, createOrder, updateOrder, deleteOrder, getOrdersByTable, markOrderAsPaid };
