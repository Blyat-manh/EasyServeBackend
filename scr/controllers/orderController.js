const pool = require('../utils/db');

// Obtener todos los pedidos, incluyendo sus items y datos de mesa
const getAllOrders = async (req, res) => {
  try {
    // Traer pedidos con la mesa y sus items (join con tables y order_items + inventory)
    const [orders] = await pool.query(`
      SELECT 
        o.id AS order_id,
        o.total,
        o.created_at,
        t.table_number,
        u.name AS user_name
      FROM orders o
      JOIN tables t ON o.table_id = t.id
      LEFT JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at ASC
    `);

    // Para cada pedido obtener sus items
    for (const order of orders) {
      const [items] = await pool.query(`
        SELECT oi.id, oi.quantity, i.name, i.price
        FROM order_items oi
        JOIN inventory i ON oi.inventory_id = i.id
        WHERE oi.order_id = ?
      `, [order.order_id]);
      order.items = items;
    }

    res.json(orders);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Calcular el total del pedido a partir de los items
const calculateTotal = (items) => {
  return items.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
};

// Crear un nuevo pedido con items en order_items
const createOrder = async (req, res) => {
  const { table_number, user_id, items } = req.body;

  try {
    // Obtener id de la mesa a partir del número
    const [tables] = await pool.query('SELECT id FROM tables WHERE table_number = ?', [table_number]);
    if (tables.length === 0) return res.status(400).json({ error: 'Mesa no encontrada' });
    const table_id = tables[0].id;

    // Calcular total sin descuento
    const rawTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Obtener descuentos
    const [discountRates] = await pool.query('SELECT * FROM discount_rates');

    // Encontrar mayor descuento aplicable
    let applicableDiscount = 0;
    for (const discount of discountRates) {
      if (rawTotal >= discount.min_order_amount && discount.discount_rate > applicableDiscount) {
        applicableDiscount = discount.discount_rate;
      }
    }

    // Aplicar descuento
    const totalWithDiscount = parseFloat((rawTotal * (1 - applicableDiscount / 100)).toFixed(2));

    // Insertar en orders
    const [result] = await pool.query(
      'INSERT INTO orders (table_id, user_id, total) VALUES (?, ?, ?)',
      [table_id, user_id || null, totalWithDiscount]
    );

    const orderId = result.insertId;

    // Insertar items en order_items
    for (const item of items) {
      // Asumimos que items vienen con inventory_id y quantity
      await pool.query(
        'INSERT INTO order_items (order_id, inventory_id, quantity) VALUES (?, ?, ?)',
        [orderId, item.inventory_id, item.quantity]
      );
    }

    res.json({
      id: orderId,
      table_number,
      user_id,
      items,
      total: totalWithDiscount,
      applied_discount_rate: applicableDiscount
    });

  } catch (error) {
    console.error('Error al crear pedido:', error);
    res.status(500).json({ error: error.message });
  }
};

// Actualizar un pedido (modifica items y total)
const updateOrder = async (req, res) => {
  const { id } = req.params;
  const { table_number, items } = req.body;

  try {
    // Obtener id de la mesa
    const [tables] = await pool.query('SELECT id FROM tables WHERE table_number = ?', [table_number]);
    if (tables.length === 0) return res.status(400).json({ error: 'Mesa no encontrada' });
    const table_id = tables[0].id;

    // Calcular total
    // Para calcular total correcto necesitamos precio, así que buscamos precios actuales
    const itemDetailsPromises = items.map(async item => {
      const [inv] = await pool.query('SELECT price FROM inventory WHERE id = ?', [item.inventory_id]);
      if (inv.length === 0) throw new Error(`Inventario no encontrado para id ${item.inventory_id}`);
      return { ...item, price: inv[0].price };
    });
    const detailedItems = await Promise.all(itemDetailsPromises);
    const total = calculateTotal(detailedItems);

    // Actualizar datos del pedido
    await pool.query(
      'UPDATE orders SET table_id = ?, total = ? WHERE id = ?',
      [table_id, total, id]
    );

    // Borrar items antiguos
    await pool.query('DELETE FROM order_items WHERE order_id = ?', [id]);

    // Insertar nuevos items
    for (const item of items) {
      await pool.query(
        'INSERT INTO order_items (order_id, inventory_id, quantity) VALUES (?, ?, ?)',
        [id, item.inventory_id, item.quantity]
      );
    }

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
    // Obtener id de mesa
    const [tables] = await pool.query('SELECT id FROM tables WHERE table_number = ?', [table_number]);
    if (tables.length === 0) return res.status(404).json({ error: 'Mesa no encontrada' });
    const table_id = tables[0].id;

    // Obtener pedidos y sus items para esa mesa
    const [orders] = await pool.query(`
      SELECT o.id AS order_id, o.total, o.created_at, u.name AS user_name
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE o.table_id = ?
      ORDER BY o.created_at ASC
    `, [table_id]);

    for (const order of orders) {
      const [items] = await pool.query(`
        SELECT oi.id, oi.quantity, i.name, i.price
        FROM order_items oi
        JOIN inventory i ON oi.inventory_id = i.id
        WHERE oi.order_id = ?
      `, [order.order_id]);
      order.items = items;
    }

    res.json(orders);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Marcar pedido como cobrado y mover a paid_orders
const markOrderAsPaid = async (req, res) => {
  const orderId = req.params.id;
  try {
    const order = await db.query('SELECT * FROM orders WHERE id = ?', [orderId]);

    if (!order) return res.status(404).json({ message: "Pedido no encontrado" });

    await db.query('INSERT INTO paid_orders (...) VALUES (...)', [/* datos del pedido */]);

    await db.query('DELETE FROM orders WHERE id = ?', [orderId]);

    res.json({ message: "Pedido cobrado y movido a pedidos pagados" });
  } catch (error) {
    res.status(500).json({ message: "Error al cobrar pedido", error });
  }
};

module.exports = { 
  getAllOrders, 
  createOrder, 
  updateOrder, 
  deleteOrder, 
  getOrdersByTable, 
  markOrderAsPaid 
};
