const pool = require('../utils/db');

// Obtener todos los pedidos, incluyendo sus items y datos de mesa
const getAllOrders = async (req, res) => {
  try {
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

const calculateTotal = (items) => {
  return items.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
};

// Crear un nuevo pedido con items en order_items
const createOrder = async (req, res) => {
  const { table_number, user_id, items } = req.body;

  try {
    const [tables] = await pool.query('SELECT id, status FROM tables WHERE table_number = ?', [table_number]);
    if (tables.length === 0) return res.status(400).json({ error: 'Mesa no encontrada' });

    const table = tables[0];
    const table_id = table.id;
    if (table.status === 'reserved') {
      return res.status(403).json({ error: 'Esta mesa está reservada y no se pueden crear pedidos en ella.' });
    }

    const rawTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const [discountRates] = await pool.query('SELECT * FROM discount_rates');

    let applicableDiscount = 0;
    for (const discount of discountRates) {
      if (rawTotal >= discount.min_order_amount && discount.discount_rate > applicableDiscount) {
        applicableDiscount = discount.discount_rate;
      }
    }

    const totalWithDiscount = parseFloat((rawTotal * (1 - applicableDiscount / 100)).toFixed(2));

    const [result] = await pool.query(
      'INSERT INTO orders (table_id, user_id, total) VALUES (?, ?, ?)',
      [table_id, user_id || null, totalWithDiscount]
    );

    const orderId = result.insertId;

    for (const item of items) {
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
    const [tables] = await pool.query('SELECT id FROM tables WHERE table_number = ?', [table_number]);
    if (tables.length === 0) return res.status(400).json({ error: 'Mesa no encontrada' });
    const table_id = tables[0].id;

    const itemDetailsPromises = items.map(async item => {
      const [inv] = await pool.query('SELECT price FROM inventory WHERE id = ?', [item.inventory_id]);
      if (inv.length === 0) throw new Error(`Inventario no encontrado para id ${item.inventory_id}`);
      return { ...item, price: inv[0].price };
    });
    const detailedItems = await Promise.all(itemDetailsPromises);
    const total = calculateTotal(detailedItems);

    await pool.query(
      'UPDATE orders SET table_id = ?, total = ? WHERE id = ?',
      [table_id, total, id]
    );

    await pool.query('DELETE FROM order_items WHERE order_id = ?', [id]);

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

// Eliminar pedido (sin afectar el historial de ingresos)
const deleteOrder = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM order_items WHERE order_id = ?', [id]);
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
    const [tables] = await pool.query('SELECT id FROM tables WHERE table_number = ?', [table_number]);
    if (tables.length === 0) return res.status(404).json({ error: 'Mesa no encontrada' });
    const table_id = tables[0].id;

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

// Cobrar un pedido: mueve a paid_orders, luego elimina el pedido
const markOrderAsPaid = async (req, res) => {
  const orderId = req.params.id;
  try {
    const [orderResult] = await pool.query('SELECT * FROM orders WHERE id = ?', [orderId]);
    if (orderResult.length === 0) return res.status(404).json({ message: "Pedido no encontrado" });
    const order = orderResult[0];
    // Insertar en paid_orders (paid_at se genera solo)
    await pool.query(
      'INSERT INTO paid_orders (order_id, total) VALUES (?, ?)',
      [order.id, order.total]
    );
    // Borrar items y pedido
    await pool.query('DELETE FROM order_items WHERE order_id = ?', [orderId]);
    await pool.query('DELETE FROM orders WHERE id = ?', [orderId]);
    res.json({ message: "Pedido cobrado y registrado en paid_orders" });
  } catch (error) {
    console.error('Error cobrando pedido:', error);
    res.status(500).json({ message: "Error al cobrar pedido", error: error.message });
  }
};

// Obtener ingresos diarios de pedidos cobrados (sin cerrar día aún)
const getDailyPaidOrders = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT DATE(paid_at) as date, SUM(total) as total FROM paid_orders GROUP BY DATE(paid_at) ORDER BY date DESC'
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Finalizar el día: suma lo cobrado, pasa a daily_revenue y borra de paid_orders
const endDay = async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const [result] = await pool.query(
      'SELECT SUM(total) as total FROM paid_orders WHERE DATE(paid_at) = ?', [today]
    );
    const total = result[0].total || 0;
    if (total === 0) {
      return res.status(400).json({ message: 'No hay pedidos cobrados para finalizar hoy' });
    }
    // Insertar (o actualizar) en daily_revenue
    const [existing] = await pool.query('SELECT * FROM daily_revenue WHERE date = ?', [today]);
    if (existing.length > 0) {
      await pool.query('UPDATE daily_revenue SET total = ? WHERE date = ?', [total, today]);
    } else {
      await pool.query('INSERT INTO daily_revenue (date, total) VALUES (?, ?)', [today, total]);
    }
    // Borrar paid_orders de hoy
    await pool.query('DELETE FROM paid_orders WHERE DATE(paid_at) = ?', [today]);
    res.json({ message: 'Día finalizado. Ingresos diarios guardados y paid_orders limpiados.', total });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener el historial de ingresos diarios ya cerrados
const getAllDailyRevenue = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM daily_revenue ORDER BY date DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getActiveOrders = async (req, res) => {
  try {
    const [orders] = await pool.query(`
      SELECT id AS order_id, table_id
      FROM orders
    `);

    res.json(orders);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllOrders,
  createOrder,
  updateOrder,
  deleteOrder,
  getOrdersByTable,
  markOrderAsPaid,
  getDailyPaidOrders,
  endDay,
  getAllDailyRevenue,
  getActiveOrders
};
