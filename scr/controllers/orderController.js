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
    // Calcular total original
    const rawTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Obtener todos los descuentos
    const [DiscountRates] = await pool.query('SELECT * FROM DiscountRates');

    // Encontrar el mayor descuento aplicable
    let applicableDiscount = 0;

    for (const discount of DiscountRates) {
      if (rawTotal >= discount.min_order_amount && discount.discount_rate > applicableDiscount) {
        applicableDiscount = discount.discount_rate;
      }
    }

    // Aplicar el descuento
    const totalWithDiscount = parseFloat((rawTotal * (1 - applicableDiscount / 100)).toFixed(2));

    // Insertar el pedido en la base de datos
    const [result] = await pool.query(
      'INSERT INTO orders (table_number, items, total) VALUES (?, ?, ?)',
      [table_number, JSON.stringify(items), totalWithDiscount]
    );

    res.json({
      id: result.insertId,
      table_number,
      items,
      total: totalWithDiscount,
      applied_discount_rate: applicableDiscount // Esto solo se devuelve, no se guarda
    });

  } catch (error) {
    console.error('Error al crear pedido:', error);
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

// Marcar pedido como cobrado y mover a paid_orders
const markOrderAsPaid = async (req, res) => {
  const { id } = req.params;

  try {
    // Obtener el pedido original
    const [rows] = await pool.query('SELECT * FROM orders WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = rows[0];

    // 🛠️ Asegúrate de que items sea un JSON válido
    const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;

    // Insertar en paid_orders
    await pool.query(
      'INSERT INTO paid_orders (table_number, items, total) VALUES (?, ?, ?)',
      [order.table_number, JSON.stringify(items), order.total]
    );

    // Eliminar de orders
    await pool.query('DELETE FROM orders WHERE id = ?', [id]);

    res.json({ message: 'Order marked as paid and moved to paid_orders' });

  } catch (error) {
    console.error('Error al cobrar pedido:', error);
    res.status(500).json({ error: error.message });
  }
};


module.exports = { getAllOrders, createOrder, updateOrder, deleteOrder, getOrdersByTable, markOrderAsPaid };
